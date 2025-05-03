import { io as Client } from "socket.io-client";
import { GameRoom } from "../types/game";
import { describe, beforeAll, afterAll, test, expect } from "@jest/globals";

describe("Game Server", () => {
  let clientSocket: any;

  beforeAll((done) => {
    console.log("Setting up test environment...");
    clientSocket = Client("http://localhost:3000");
    clientSocket.on("connect", () => {
      console.log("Client connected successfully");
      done();
    });
  });

  afterAll(() => {
    console.log("Cleaning up test environment...");
    clientSocket.close();
  });

  test("should create a new room", (done) => {
    console.log("Testing room creation...");
    const roomName = "Test Room";
    const playerName = "Test Player";

    clientSocket.emit("createRoom", { name: roomName, playerName });
    console.log("Emitted createRoom event");

    clientSocket.on("roomCreated", (room: GameRoom) => {
      console.log("Received roomCreated event");
      expect(room).toBeDefined();
      expect(room.name).toBe(roomName);
      expect(room.players).toHaveLength(1);
      expect(room.players[0].name).toBe(playerName);
      expect(room.players[0].isJudge).toBe(true);
      done();
    });
  }, 10000);

  test("should join an existing room", (done) => {
    console.log("Testing room joining...");
    const roomName = "Test Room";
    const playerName = "Test Player";
    const newPlayerName = "New Player";

    clientSocket.emit("createRoom", { name: roomName, playerName });
    console.log("Emitted createRoom event");

    clientSocket.on("roomCreated", (room: GameRoom) => {
      console.log("Received roomCreated event");
      clientSocket.emit("joinRoom", {
        roomId: room.id,
        playerName: newPlayerName,
      });
      console.log("Emitted joinRoom event");

      clientSocket.on("roomUpdated", (updatedRoom: GameRoom) => {
        console.log("Received roomUpdated event");
        expect(updatedRoom.players).toHaveLength(2);
        expect(updatedRoom.players[1].name).toBe(newPlayerName);
        expect(updatedRoom.players[1].isJudge).toBe(false);
        done();
      });
    });
  }, 10000);

  test("should not allow more than 5 players", (done) => {
    console.log("Testing player limit...");
    const roomName = "Test Room";
    const playerName = "Test Player";

    clientSocket.emit("createRoom", { name: roomName, playerName });
    console.log("Emitted createRoom event");

    clientSocket.on("roomCreated", (room: GameRoom) => {
      console.log("Received roomCreated event");
      const players = [
        "Player 2",
        "Player 3",
        "Player 4",
        "Player 5",
        "Player 6",
      ];
      let errorCount = 0;

      players.forEach((name) => {
        clientSocket.emit("joinRoom", { roomId: room.id, playerName: name });
        console.log(`Emitted joinRoom event for ${name}`);
      });

      clientSocket.on("error", ({ message }: { message: string }) => {
        console.log("Received error event:", message);
        errorCount++;
        if (errorCount === 1) {
          expect(message).toBe("Sala cheia");
          done();
        }
      });
    });
  }, 10000);

  test("should start game with enough players", (done) => {
    console.log("Testing game start...");
    const roomName = "Test Room";
    const playerName = "Test Player";

    clientSocket.emit("createRoom", { name: roomName, playerName });
    console.log("Emitted createRoom event");

    clientSocket.on("roomCreated", (room: GameRoom) => {
      console.log("Received roomCreated event");
      clientSocket.emit("joinRoom", {
        roomId: room.id,
        playerName: "Player 2",
      });
      clientSocket.emit("joinRoom", {
        roomId: room.id,
        playerName: "Player 3",
      });
      console.log("Emitted joinRoom events for additional players");

      clientSocket.on("roomUpdated", (updatedRoom: GameRoom) => {
        console.log("Received roomUpdated event");
        if (updatedRoom.players.length === 3) {
          clientSocket.emit("startGame", { roomId: room.id });
          console.log("Emitted startGame event");

          clientSocket.on("roomUpdated", (gameRoom: GameRoom) => {
            console.log("Received roomUpdated event for game start");
            expect(gameRoom.status).toBe("playing");
            expect(gameRoom.currentBlackCard).toBeDefined();
            expect(gameRoom.players[0].cards).toHaveLength(7);
            done();
          });
        }
      });
    });
  }, 10000);
});

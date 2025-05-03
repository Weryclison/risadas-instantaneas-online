
import { cn } from "@/lib/utils";
import React from "react";

interface GameCardProps {
  type: "black" | "white";
  text: string;
  onClick?: () => void;
  selectable?: boolean;
  selected?: boolean;
  className?: string;
}

const GameCard: React.FC<GameCardProps> = ({
  type,
  text,
  onClick,
  selectable = false,
  selected = false,
  className,
}) => {
  return (
    <div
      className={cn(
        type === "black" ? "black-card" : "white-card",
        selectable && "cursor-pointer hover:shadow-lg transition-shadow",
        selected && "ring-2 ring-game-highlight transform scale-105",
        "animate-fade-in",
        className
      )}
      onClick={selectable ? onClick : undefined}
    >
      <p className="card-text">{text}</p>
    </div>
  );
};

export default GameCard;

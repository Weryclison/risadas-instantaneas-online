import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { useGame } from "@/contexts/GameContext";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Layout from "@/components/Layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Schema for room creation form
const formSchema = z.object({
  roomName: z
    .string()
    .min(3, "O nome da sala deve ter pelo menos 3 caracteres")
    .max(30, "O nome da sala deve ter no máximo 30 caracteres"),
  hasPassword: z.boolean().default(false),
  password: z.string().optional(),
  maxPlayers: z.number().min(2).max(20),
  targetScore: z.number().min(8).max(16),
});

type FormValues = z.infer<typeof formSchema>;

const CreateRoom = () => {
  const navigate = useNavigate();
  const { createRoom, playerName } = useGame();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomName: "",
      hasPassword: false,
      password: "",
      maxPlayers: 8,
      targetScore: 8,
    },
  });

  const onSubmit = (values: FormValues) => {
    if (!playerName) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, defina seu apelido primeiro.",
        variant: "destructive",
      });
      return;
    }

    if (
      values.hasPassword &&
      (!values.password || values.password.trim() === "")
    ) {
      toast({
        title: "Senha obrigatória",
        description: "Por favor, defina uma senha para a sala protegida.",
        variant: "destructive",
      });
      return;
    }

    const roomId = createRoom(
      values.roomName,
      values.hasPassword,
      values.password || "",
      values.maxPlayers,
      values.targetScore
    );

    if (roomId) {
      toast({
        title: "Sala criada",
        description: "Sua sala foi criada com sucesso!",
      });
      navigate(`/room/${roomId}`);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 max-w-md">
        <h1 className="text-2xl font-bold mb-6">Criar Nova Sala</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="roomName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Sala</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome da sala" {...field} />
                  </FormControl>
                  <FormDescription>
                    Este nome será visível para outros jogadores
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hasPassword"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Proteger com senha
                    </FormLabel>
                    <FormDescription>
                      Apenas quem tiver a senha poderá entrar na sala
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("hasPassword") && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha da Sala</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Digite uma senha"
                          {...field}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Compartilhe esta senha apenas com os amigos que deseja
                      convidar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="targetScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pontuação para Vitória</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a pontuação para vitória" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="8">8 pontos</SelectItem>
                      <SelectItem value="12">12 pontos</SelectItem>
                      <SelectItem value="16">16 pontos</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    O primeiro jogador a atingir essa pontuação vence o jogo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxPlayers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Máximo de Jogadores: {field.value}</FormLabel>
                  <FormControl>
                    <Slider
                      min={2}
                      max={20}
                      step={1}
                      defaultValue={[field.value]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                    />
                  </FormControl>
                  <FormDescription>
                    Escolha entre 2 e 20 jogadores
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
              >
                Cancelar
              </Button>
              <Button type="submit">Criar Sala</Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
};

export default CreateRoom;

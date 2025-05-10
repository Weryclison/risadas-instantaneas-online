import { useState, useEffect, useCallback } from "react";
import { Progress } from "@/components/ui/progress";

interface RoundTimerProps {
  duration: number; // duração em segundos
  onTimeout: () => void; // função a ser chamada quando o tempo acabar
  isActive: boolean; // se o temporizador está ativo
  onCancel?: () => void; // função opcional para cancelar o temporizador
}

export function RoundTimer({
  duration,
  onTimeout,
  isActive,
  onCancel,
}: RoundTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 1000); // convertendo para milissegundos
  const [isPaused, setIsPaused] = useState(false);

  // Função para formatar o tempo restante (mm:ss)
  const formatTimeLeft = useCallback(() => {
    const totalSeconds = Math.ceil(timeLeft / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }, [timeLeft]);

  // Calcula a porcentagem de progresso
  const progressPercentage = Math.max(
    0,
    Math.min(100, (timeLeft / (duration * 1000)) * 100)
  );

  useEffect(() => {
    // Reinicia o temporizador quando a duração muda
    setTimeLeft(duration * 1000);
  }, [duration]);

  useEffect(() => {
    let timer: number | undefined;

    if (isActive && !isPaused && timeLeft > 0) {
      // Usa um intervalo de 100ms para atualização mais suave
      const startTime = Date.now();
      const initialTimeLeft = timeLeft;

      timer = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newTimeLeft = Math.max(0, initialTimeLeft - elapsed);

        setTimeLeft(newTimeLeft);

        if (newTimeLeft <= 0) {
          clearInterval(timer);
          onTimeout();
        }
      }, 100);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, isPaused, timeLeft, onTimeout]);

  // Cancela o temporizador se onCancel for fornecido
  const handleCancel = () => {
    if (onCancel) {
      setIsPaused(true);
      onCancel();
    }
  };

  // Se o temporizador não estiver ativo, não renderiza nada
  if (!isActive) {
    return null;
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-lg font-bold">{formatTimeLeft()}</span>
        {onCancel && (
          <button
            onClick={handleCancel}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Pular
          </button>
        )}
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
}

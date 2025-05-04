import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

export interface GameCardProps {
  type: "black" | "white";
  text: string;
  onClick?: () => void;
  selectable?: boolean;
  selected?: boolean;
  className?: string;
  footerText?: string;
  disabled?: boolean;
  faceDown?: boolean;
  winner?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({
  type,
  text,
  onClick,
  selectable = false,
  selected = false,
  className,
  footerText,
  disabled = false,
  faceDown = false,
  winner = false,
}) => {
  // Classe base comum para todas as cartas para manter consistência visual
  const baseCardClasses = "h-36 rounded-lg shadow-md w-full";

  if (faceDown) {
    return (
      <div
        className={cn(
          baseCardClasses,
          "card-back border flex items-center justify-center p-4",
          type === "black"
            ? "bg-gradient-to-r from-gray-800 to-gray-900 text-white"
            : "bg-gradient-to-br from-slate-200 to-slate-300",
          "relative overflow-hidden",
          className
        )}
      >
        {/* Card pattern background */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-4 gap-1 h-full w-full p-2">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="bg-slate-500 rounded-sm"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseCardClasses,
        type === "black" ? "black-card" : "white-card",
        selectable &&
          !disabled &&
          "cursor-pointer hover:shadow-lg transition-shadow",
        selected && "ring-2 ring-primary selected-card",
        disabled && "opacity-60",
        winner && "winning-card",
        "animate-fade-in",
        className
      )}
      onClick={selectable && !disabled ? onClick : undefined}
    >
      <p className="card-text text-center w-full">{text}</p>
      {footerText && (
        <div className="text-xs mt-2 font-light text-right">{footerText}</div>
      )}
    </div>
  );
};

export default GameCard;

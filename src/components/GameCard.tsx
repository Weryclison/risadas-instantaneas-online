import { cn } from "@/lib/utils";
import React from "react";

export interface GameCardProps {
  type: "black" | "white";
  text: string;
  onClick?: () => void;
  selectable?: boolean;
  selected?: boolean;
  className?: string;
  footerText?: string;
  disabled?: boolean;
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
}) => {
  return (
    <div
      className={cn(
        type === "black" ? "black-card" : "white-card",
        selectable &&
          !disabled &&
          "cursor-pointer hover:shadow-lg transition-shadow",
        selected && "ring-2 ring-primary selected-card",
        disabled && "opacity-60",
        "animate-fade-in",
        className
      )}
      onClick={selectable && !disabled ? onClick : undefined}
    >
      <p className="card-text">{text}</p>
      {footerText && (
        <div className="text-xs mt-2 font-light text-right">{footerText}</div>
      )}
    </div>
  );
};

export default GameCard;

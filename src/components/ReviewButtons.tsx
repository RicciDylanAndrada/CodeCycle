"use client";

import { Button } from "@/components/ui/button";

interface ReviewButtonsProps {
  onSubmit: (result: "FAILED" | "STRUGGLED" | "SOLVED" | "INSTANT") => void;
  disabled?: boolean;
}

const ReviewButtons = ({ onSubmit, disabled = false }: ReviewButtonsProps) => {
  const buttons = [
    {
      result: "FAILED" as const,
      label: "Failed",
      description: "Will review again soon",
      variant: "hard" as const,
    },
    {
      result: "STRUGGLED" as const,
      label: "Struggled",
      description: "Needs reinforcement",
      variant: "medium" as const,
    },
    {
      result: "SOLVED" as const,
      label: "Solved",
      description: "Good recall",
      variant: "easy" as const,
    },
    {
      result: "INSTANT" as const,
      label: "Instant",
      description: "Strong Memory",
      variant: "lightwork" as const,
    },
  ];

  return (
    <div className="flex justify-between items-center gap-4">
      {buttons.map(({ result, label, description, variant }) => (
        <Button
          key={result}
          onClick={() => onSubmit(result)}
          disabled={disabled}
          variant={variant}
          className="h-30 w-40 cursor-pointer p-4 flex flex-col items-center justify-center gap-1"
          aria-label={`Mark as ${label}: ${description}`}
        >
          <span className="font-semibold">{label}</span>
          <span className="text-xs opacity-80">{description}</span>
        </Button>
      ))}
    </div>
  );
};

export default ReviewButtons;

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
      description: "Couldn't solve it",
      variant: "destructive" as const,
    },
    {
      result: "STRUGGLED" as const,
      label: "Struggled",
      description: "Solved with difficulty",
      variant: "secondary" as const,
    },
    {
      result: "SOLVED" as const,
      label: "Solved",
      description: "Got it with effort",
      variant: "default" as const,
    },
    {
      result: "INSTANT" as const,
      label: "Instant",
      description: "Remembered immediately",
      variant: "outline" as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {buttons.map(({ result, label, description, variant }) => (
        <Button
          key={result}
          onClick={() => onSubmit(result)}
          disabled={disabled}
          variant={variant}
          className="h-auto p-4 flex flex-col items-start"
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

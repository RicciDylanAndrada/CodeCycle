import { Badge } from "@/components/ui/badge";

interface DifficultyBadgeProps {
  difficulty: string;
}

const DifficultyBadge = ({ difficulty }: DifficultyBadgeProps) => {
  const variants: Record<string, "medium" | "easy" | "hard" | "outline"> = {
    Easy: "easy",
    Medium: "medium",
    Hard: "hard",
    Unknown: "outline",
  };

  const variant = variants[difficulty] || "outline";

  return <Badge variant={variant}>{difficulty}</Badge>;
};

export default DifficultyBadge;

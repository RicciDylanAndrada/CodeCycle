import { Badge } from "@/components/ui/badge";

interface DifficultyBadgeProps {
  difficulty: string;
}

const DifficultyBadge = ({ difficulty }: DifficultyBadgeProps) => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    Easy: "secondary",
    Medium: "default",
    Hard: "destructive",
    Unknown: "outline",
  };

  const variant = variants[difficulty] || "outline";

  return <Badge variant={variant}>{difficulty}</Badge>;
};

export default DifficultyBadge;

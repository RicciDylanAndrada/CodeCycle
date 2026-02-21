import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DifficultyBadge from "./DifficultyBadge";

interface ProblemCardProps {
  slug: string;
  title: string;
  difficulty: string;
  tags: string[];
  isNew?: boolean;
  showLink?: boolean;
}

const ProblemCard = ({
  slug,
  title,
  difficulty,
  tags,
  isNew = false,
  showLink = true,
}: ProblemCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium truncate">{title}</h3>
              {isNew && <Badge variant="outline">New</Badge>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <DifficultyBadge difficulty={difficulty} />
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          </div>
          {showLink && (
            <Button asChild size="sm">
              <a
                href={`https://leetcode.com/problems/${slug}/`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${title} on LeetCode`}
              >
                Open
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProblemCard;

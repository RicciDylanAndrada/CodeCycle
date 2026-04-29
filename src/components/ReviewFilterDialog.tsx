"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ReviewFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartReview: (filters: ReviewFilters) => void;
  availableDifficulties: string[];
  availableTags: string[];
}

interface ReviewFilters {
  difficulties: string[];
  tags: string[];
}

const ReviewFilterDialog = ({
  open,
  onOpenChange,
  onStartReview,
  availableDifficulties,
  availableTags,
}: ReviewFilterDialogProps) => {
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleDifficultyToggle = (difficulty: string) => {
    setSelectedDifficulties((prev) =>
      prev.includes(difficulty)
        ? prev.filter((d) => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const handleStartReview = () => {
    onStartReview({
      difficulties: selectedDifficulties,
      tags: selectedTags,
    });
    onOpenChange(false);
  };

  const handleClearFilters = () => {
    setSelectedDifficulties([]);
    setSelectedTags([]);
  };

  const hasActiveFilters = selectedDifficulties.length > 0 || selectedTags.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter Review Questions</DialogTitle>
          <DialogDescription>
            Select the difficulties and topics you want to focus on for today&apos;s review session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Difficulty Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Difficulty</Label>
              {selectedDifficulties.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDifficulties([])}
                  className="h-auto px-2 py-1 text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {availableDifficulties.map((difficulty) => {
                const isSelected = selectedDifficulties.includes(difficulty);
                const variant =
                  difficulty.toLowerCase() === "easy"
                    ? "easy"
                    : difficulty.toLowerCase() === "medium"
                    ? "medium"
                    : difficulty.toLowerCase() === "hard"
                    ? "hard"
                    : "outline";

                return (
                  <button
                    key={difficulty}
                    onClick={() => handleDifficultyToggle(difficulty)}
                    className={`
                      px-4 py-2 rounded-md text-sm font-medium transition-all
                      cursor-pointer border
                      ${
                        isSelected
                          ? variant === "easy"
                            ? "bg-green-500 text-white border-green-500"
                            : variant === "medium"
                            ? "bg-yellow-500 text-white border-yellow-500"
                            : variant === "hard"
                            ? "bg-red-500 text-white border-red-500"
                            : "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary text-secondary-foreground border-transparent hover:border-secondary-foreground/20"
                      }
                    `}
                    aria-pressed={isSelected}
                    aria-label={`Filter by ${difficulty} difficulty`}
                  >
                    {difficulty}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Topics & Tags</Label>
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTags([])}
                  className="h-auto px-2 py-1 text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableTags.sort().map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <div
                    key={tag}
                    className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-all ${
                      isSelected
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-secondary/50 border border-transparent hover:bg-secondary"
                    }`}
                    onClick={() => handleTagToggle(tag)}
                    role="checkbox"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleTagToggle(tag);
                      }
                    }}
                  >
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={isSelected}
                      className="pointer-events-none"
                    />
                    <span className="text-sm font-medium text-foreground cursor-pointer flex-1">
                      {tag}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Active Filters</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-auto px-2 py-1 text-xs"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {selectedDifficulties.map((difficulty) => (
                    <Badge
                      key={`diff-${difficulty}`}
                      variant={
                        difficulty.toLowerCase() === "easy"
                          ? "easy"
                          : difficulty.toLowerCase() === "medium"
                          ? "medium"
                          : "hard"
                      }
                      className="cursor-pointer"
                      onClick={() => handleDifficultyToggle(difficulty)}
                    >
                      {difficulty}
                    </Badge>
                  ))}
                  {selectedTags.map((tag) => (
                    <Badge
                      key={`tag-${tag}`}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleStartReview}
            type="button"
            disabled={!hasActiveFilters}
          >
            {hasActiveFilters
              ? `Start Review (${selectedDifficulties.length + selectedTags.length} filters)`
              : "Select Filters to Start"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewFilterDialog;

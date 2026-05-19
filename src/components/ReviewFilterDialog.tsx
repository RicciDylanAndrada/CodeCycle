"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";

interface ReviewFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartPractice: (filters: ReviewFilters, count: number) => void;
  availableDifficulties: string[];
  availableTags: string[];
}

interface ReviewFilters {
  difficulties: string[];
  tags: string[];
}

type Step = "filters" | "count";

const ReviewFilterDialog = ({
  open,
  onOpenChange,
  onStartPractice,
  availableDifficulties,
  availableTags,
}: ReviewFilterDialogProps) => {
  const [step, setStep] = useState<Step>("filters");
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [problemCount, setProblemCount] = useState<number>(5); // Start with 5

const countOptions = [5, 10, 15, 20, 25, 30];

const handleDifficultyToggle = (difficulty: string) => {
    setSelectedDifficulties(prev =>
      prev.includes(difficulty)
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleNextStep = () => {
    if (selectedDifficulties.length > 0 || selectedTags.length > 0) {
      setStep("count");
    }
  };

  const handleBackStep = () => {
    setStep("filters");
  };

  const handleStartPractice = () => {
    onStartPractice(
      {
        difficulties: selectedDifficulties,
        tags: selectedTags,
      },
      problemCount
    );
    handleReset();
    onOpenChange(false);
  };

  const handleReset = () => {
    setStep("filters");
    setSelectedDifficulties([]);
    setSelectedTags([]);
    setProblemCount(5); // Reset to 5 instead of countOptions[0]
  };
  

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const hasActiveFilters = selectedDifficulties.length > 0 || selectedTags.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "filters" ? "Filter Problems" : "Select Problem Count"}
          </DialogTitle>
          <DialogDescription>
            {step === "filters"
              ? "Select the difficulties and topics you want to focus on for practice."
              : "How many problems would you like to practice?"}
          </DialogDescription>
        </DialogHeader>

        {step === "filters" ? (
          <div className="space-y-6 py-4">
            {/* Difficulty Filter */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Difficulty</Label>
                {selectedDifficulties.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      selectedDifficulties.forEach(difficulty => handleDifficultyToggle(difficulty));
                    }}
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
                    onClick={() => {
                      selectedTags.forEach(tag => handleTagToggle(tag));
                    }}
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
                      onClick={() => {
                        selectedDifficulties.forEach(difficulty => handleDifficultyToggle(difficulty));
                        selectedTags.forEach(tag => handleTagToggle(tag));
                      }}
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
        ) : (
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Number of Problems</Label>
              <p className="text-sm text-muted-foreground">
                Select how many problems you want to practice from your filtered selection.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {countOptions.map((count) => (
                <button
                  key={count}
                  onClick={() => setProblemCount(count)}
                  className={`
                    p-4 rounded-lg border-2 text-center font-medium transition-all
                    ${problemCount === count
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                    }
                  `}
                >
                  {count}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Label className="text-sm">Custom:</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={problemCount}
                onChange={(e) => setProblemCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">(max 50)</span>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {selectedDifficulties.length + selectedTags.length} filters selected
                  </span>
                  {" - "}
                  <span className="font-medium text-foreground">
                    {problemCount} problems
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter>
          {step === "filters" ? (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                type="button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleNextStep}
                type="button"
                disabled={!hasActiveFilters}
              >
                Next
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleBackStep}
                type="button"
              >
                Back
              </Button>
              <Button
                onClick={handleStartPractice}
                type="button"
              >
                Start Practice ({problemCount})
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewFilterDialog;
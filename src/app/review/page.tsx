"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProblemCard from "@/components/ProblemCard";
import ReviewButtons from "@/components/ReviewButtons";
import ModeToggle from "@/components/ThemeToggle";

interface ReviewProblem {
  id: string | null;
  slug: string;
  title: string;
  difficulty: string;
  tags: string[];
  isNew: boolean;
}

const ReviewPage = () => {
  const router = useRouter();
  const [problems, setProblems] = useState<ReviewProblem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await fetch("/api/review/today");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setProblems(data.problems);
        if (data.problems.length === 0) {
          setCompleted(true);
        }
      } catch {
        setError("Failed to load review");
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [router]);

  const handleSubmit = async (
    result: "FAILED" | "STRUGGLED" | "SOLVED" | "INSTANT"
  ) => {
    if (submitting) return;

    const currentProblem = problems[currentIndex];
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/review/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: currentProblem.slug,
          result,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to submit");
        return;
      }

      if (currentIndex < problems.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCompleted(true);
      }
    } catch {
      setError("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
          <h1 className="text-5xl font-bold text-primary">CodeCycle</h1>
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-secondary text-muted-foreground text-xl">Loading Your Review...</span>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="text-6xl mb-2">🎉</div>
            <CardTitle>Review Complete!</CardTitle>
            <CardDescription>Great job! You&apos;ve completed today&apos;s review.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentProblem = problems[currentIndex];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 mb-4 flex items-center justify-between">
      <h1 className="text-3xl font-bold text-primary"> CodeCycle </h1>
      <ModeToggle />
      <Button variant="default" asChild>
            <Link href="/dashboard">Exit</Link>
          </Button>
    </div>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center p-2">
            <h1 className="text-2xl font-bold text-primary">Review Session</h1>
            <p className="text-muted-foreground">
              {currentIndex + 1} / {problems.length}
            </p>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{
              width: `${((currentIndex + 1) / problems.length) * 100}%`,
            }}
          />
        </div>

        <div className="text-sm text-muted-foreground flex justify-center items-center">
            <span>
              Open the problem on LeetCode and try to solve it (or recall the solution).
              Then rate how it went:
            </span>
          </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <ProblemCard
          slug={currentProblem.slug}
          title={currentProblem.title}
          difficulty={currentProblem.difficulty}
          tags={currentProblem.tags}
          isNew={currentProblem.isNew}
        />

        <ReviewButtons onSubmit={handleSubmit} disabled={submitting} />

        {submitting && (
          <p className="text-center text-muted-foreground">Submitting...</p>
        )}
      </div>
    </div>
  );
};

export default ReviewPage;

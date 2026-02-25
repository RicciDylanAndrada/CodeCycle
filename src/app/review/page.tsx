"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProblemCard from "@/components/ProblemCard";
import ReviewButtons from "@/components/ReviewButtons";

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
  const [completedToday, setCompletedToday] = useState(0);
  const [totalProblems, setTotalProblems] = useState(0);
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
        setProblems(data.remaining || []);
        setCompletedToday(data.completedToday || 0);
        setTotalProblems(data.total || 0);
        if ((data.remaining || []).length === 0) {
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

  // 1-indexed: shows current problem number (not completed count)
  const currentProblemNum = Math.min(completedToday + currentIndex + 1, totalProblems);
  const progressDisplay = `${currentProblemNum}/${totalProblems}`;
  // For progress bar, use actual completion percentage
  const progressPercent = ((completedToday + currentIndex) / totalProblems) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <span className="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading review...</span>
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
            <CardDescription>
              Great job! You&apos;ve completed {completedToday + problems.length} problems today.
            </CardDescription>
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
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Review Session</h1>
            <p className="text-muted-foreground">
              Progress: {progressDisplay}
            </p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Exit</Link>
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{
              width: `${progressPercent}%`,
            }}
          />
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

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Open the problem on LeetCode and try to solve it (or recall the solution).
              Then rate how it went:
            </p>
          </CardContent>
        </Card>

        <ReviewButtons onSubmit={handleSubmit} disabled={submitting} />

        {submitting && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Submitting...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewPage;

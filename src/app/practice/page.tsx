"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProblemCard from "@/components/ProblemCard";
import ReviewButtons from "@/components/ReviewButtons";
import ModeToggle from "@/components/ThemeToggle";

interface PracticeProblem {
  slug: string;
  title: string;
  difficulty: string;
  tags: string[];
  isNew: boolean;
}

interface PracticeSession {
  difficulties: string[];
  tags: string[];
  count: number;
}

const PracticePage = () => {
  const router = useRouter();
  const [problems, setProblems] = useState<PracticeProblem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPractice = async () => {
      try {
        // Get session data from sessionStorage
        const sessionData = sessionStorage.getItem("practiceSession");
        if (!sessionData) {
          router.push("/browse");
          return;
        }

        const session: PracticeSession = JSON.parse(sessionData);
        sessionStorage.removeItem("practiceSession");

        const res = await fetch("/api/review/practice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            difficulties: session.difficulties,
            tags: session.tags,
            count: session.count,
          }),
        });

        if (res.status === 401) {
          router.push("/login");
          return;
        }

        const data = await res.json();

        if (!res.ok || data.error || !Array.isArray(data.problems)) {
          setError(data.error || "Failed to load practice problems");
          setLoading(false);
          return;
        }

        if (data.problems.length === 0) {
          setError("No problems found matching your filters.");
          setLoading(false);
          return;
        }

        setProblems(data.problems);
      } catch (err) {
        console.error("Practice session error:", err);
        setError("Failed to load practice session");
      } finally {
        setLoading(false);
      }
    };

    fetchPractice();
  }, [router]);

  const handleSubmit = async (
    result: "FAILED" | "STRUGGLED" | "SOLVED" | "INSTANT"
  ) => {
    if (submitting) return;

    setSubmitting(true);
    setError("");

    try {
      // For practice mode, we just track which problems were practiced
      // but don't update the spaced repetition system
      if (currentIndex < problems.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCompleted(true);
      }
    } catch {
      setError("Failed to continue");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <h1 className="text-5xl font-bold text-primary">CodeCycle</h1>
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground text-xl">Loading Practice Session...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="text-6xl mb-2">❌</div>
            <CardTitle>No Problems Found</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild>
              <Link href="/browse">Try Different Filters</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (completed || problems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="text-6xl mb-2">🎉</div>
            <CardTitle>Practice Complete!</CardTitle>
            <CardDescription>
              Great job! You&apos;ve practiced {problems.length} problems.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild>
              <Link href="/browse">Practice More</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentProblem = problems[currentIndex];

  if (!currentProblem || problems.length === 0) {
    setCompleted(true);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="text-6xl mb-2">❌</div>
            <CardTitle>Something went wrong</CardTitle>
            <CardDescription>Could not load the problem.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild>
              <Link href="/browse">Back to Browse</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">CodeCycle</h1>
        <ModeToggle />
        <Button variant="default" asChild>
          <Link href="/browse">Exit</Link>
        </Button>
      </div>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center p-2">
          <h1 className="text-2xl font-bold text-primary">Practice Session</h1>
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

export default PracticePage;
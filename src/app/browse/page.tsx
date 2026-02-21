"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TopicAccordion from "@/components/TopicAccordion";

interface Problem {
  slug: string;
  title: string;
  difficulty: string;
  tags: string[];
}

const BrowsePage = () => {
  const router = useRouter();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await fetch("/api/leetcode/solved");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setProblems(
          data.problems.map((p: { slug: string; title: string; difficulty: string; topicTags: { name: string }[] }) => ({
            slug: p.slug,
            title: p.title,
            difficulty: p.difficulty,
            tags: p.topicTags.map((t: { name: string }) => t.name),
          }))
        );
      } catch {
        setError("Failed to load problems");
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [router]);

  const problemsByTopic: Record<string, Problem[]> = {};
  for (const problem of problems) {
    const topic = problem.tags[0] || "Other";
    if (!problemsByTopic[topic]) {
      problemsByTopic[topic] = [];
    }
    problemsByTopic[topic].push(problem);
  }

  const sortedTopics = Object.entries(problemsByTopic).sort(
    (a, b) => b[1].length - a[1].length
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading problems...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Browse Problems</h1>
            <p className="text-muted-foreground">{problems.length} total problems</p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">← Back</Link>
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {sortedTopics.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                No problems synced yet. Go to the dashboard and sync your LeetCode problems.
              </p>
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {sortedTopics.map(([topic, topicProblems]) => (
              <TopicAccordion
                key={topic}
                topic={topic}
                problems={topicProblems}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;

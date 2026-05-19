"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TopicAccordion from "@/components/TopicAccordion";
import ModeToggle from "@/components/ThemeToggle";
import Search from "@/components/BrowseSearch";
import ReviewFilterDialog from "@/components/ReviewFilterDialog";

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
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [availableDifficulties, setAvailableDifficulties] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await fetch("/api/problems");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        const mappedProblems = data.problems.map(
          (p: {
            slug: string;
            title: string;
            difficulty: string;
            tags: string[];
          }) => ({
            slug: p.slug,
            title: p.title,
            difficulty: p.difficulty,
            tags: p.tags,
          })
        );
        setProblems(mappedProblems);

        // Extract available difficulties and tags
        const difficulties = new Set<string>();
        const tags = new Set<string>();
        mappedProblems.forEach((p: Problem) => {
          difficulties.add(p.difficulty.toLowerCase());
          p.tags.forEach((tag: string) => tags.add(tag.toLowerCase()));
        });
        setAvailableDifficulties(Array.from(difficulties));
        setAvailableTags(Array.from(tags));
      } catch {
        setError("Failed to load problems");
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [router]);

  const handleStartPractice = (filters: { difficulties: string[]; tags: string[] }, count: number) => {
    // Store filters and count in sessionStorage for the practice page
    const sessionData = {
      difficulties: filters.difficulties,
      tags: filters.tags,
      count,
    };
    sessionStorage.setItem("practiceSession", JSON.stringify(sessionData));
    // Small delay to ensure sessionStorage is written before navigation
    setTimeout(() => {
      window.location.href = "/practice";
    }, 50);
  };


    const allTags = new Set<string>();
    const allDifficulties = new Set<string>();

    problems.forEach((problem) => {
      allDifficulties.add( problem.difficulty.toLowerCase() );
      problem.tags.forEach((tag) => allTags.add(tag.toLowerCase()));
    });

  const selectedDifficulties = selectedFilters.filter(f => allDifficulties.has(f));
  const selectedTags = selectedFilters.filter(f => allTags.has(f));

    const toTitleCase = (str: string) =>
      str.replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
      );

    const filterOptions = [
      ...Array.from(allDifficulties).map((difficulty) => ({
        value: difficulty,
        label: toTitleCase(difficulty),
      })),
      ...Array.from(allTags).map((tag) => ({
        value: tag,
        label: toTitleCase(tag),
      })),
    ];


  const difficultyFilters = selectedDifficulties;
  const tagFilters = selectedTags;

  const filteredProblems =
    selectedFilters.length === 0
      ? problems
      : problems.filter((problem) => {
         const difficultyMatch =
           difficultyFilters.length === 0 ||
           difficultyFilters.includes(problem.difficulty.toLowerCase());

        const tagMatch =
          tagFilters.length === 0 ||
          tagFilters.every((tag) =>
            problem.tags.map((t) => t.toLowerCase()).includes(tag)
          );

        return difficultyMatch && tagMatch;
      });


  const problemsByTopic: Record<string, Problem[]> = {};

  for (const problem of filteredProblems) {
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <h1 className="text-5xl font-bold text-primary">CodeCycle</h1>
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          <span className="text-secondary-foreground text-xl">
            Loading Your Problems...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Browse Problems
            </h1>
            <p className="text-muted-foreground">
              {filteredProblems.length} total problems
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="default" onClick={() => setFilterDialogOpen(true)}>
              Practice Problems
            </Button>
            <ModeToggle />
            <Button variant="default" asChild>
              <Link href="/dashboard">← Back</Link>
            </Button>
          </div>
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
                No problems matched your filters.
              </p>
              <Button onClick={() => setSelectedFilters([])}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            <Search
              options={filterOptions}
              value={selectedFilters}
              onChange={setSelectedFilters}
            />
            {sortedTopics.map(([topic, topicProblems]) => (
              <TopicAccordion
                key={topic}
                topic={topic}
                problems={topicProblems}
              />
            ))}
          </div>
        )}

        <ReviewFilterDialog
    open={filterDialogOpen}
    onOpenChange={setFilterDialogOpen}
    onStartPractice={handleStartPractice}
    availableDifficulties={availableDifficulties}
    availableTags={availableTags}
  />
      </div>
    </div>
  );
};

export default BrowsePage;
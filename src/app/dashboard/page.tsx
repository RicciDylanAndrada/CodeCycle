"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface ReviewData {
  date: string;
  dailyGoal: number;
  total: number;
  problems: Array<{
    slug: string;
    title: string;
    difficulty: string;
    isNew: boolean;
  }>;
}

interface Settings {
  dailyGoal: number;
  maxNewPerDay: number;
  defaultInterval: number;
}

const DashboardPage = () => {
  const router = useRouter();
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewRes, settingsRes] = await Promise.all([
          fetch("/api/review/today"),
          fetch("/api/review/settings"),
        ]);

        if (reviewRes.status === 401 || settingsRes.status === 401) {
          router.push("/login");
          return;
        }

        const [review, settingsData] = await Promise.all([
          reviewRes.json(),
          settingsRes.json(),
        ]);

        setReviewData(review);
        setSettings(settingsData);
      } catch {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/leetcode/solved");
      if (res.ok) {
        const data = await res.json();
        alert(`Synced ${data.count} problems from LeetCode!`);
        const reviewRes = await fetch("/api/review/today");
        if (reviewRes.ok) {
          setReviewData(await reviewRes.json());
        }
      }
    } catch {
      setError("Failed to sync");
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleUpdateSettings = async (field: string, value: number) => {
    try {
      const res = await fetch("/api/review/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
      }
    } catch {
      setError("Failed to update settings");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">CodeCycle</h1>
            <p className="text-muted-foreground">Your daily LeetCode review</p>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Review</CardTitle>
            <CardDescription>
              {reviewData && reviewData.total > 0
                ? `You have ${reviewData.total} problems to review`
                : "No problems due today"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reviewData && reviewData.total > 0 ? (
              <Button asChild>
                <Link href="/review">Start Review</Link>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sync your LeetCode problems or check back tomorrow!
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sync Problems</CardTitle>
            <CardDescription>Fetch your solved problems from LeetCode</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" onClick={handleSync} disabled={syncing}>
              {syncing ? "Syncing..." : "Sync from LeetCode"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Browse Problems</CardTitle>
            <CardDescription>View all your problems organized by topic</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" asChild>
              <Link href="/browse">Browse All</Link>
            </Button>
          </CardContent>
        </Card>

        {settings && (
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Daily Goal</Label>
                  <span className="text-sm text-muted-foreground">{settings.dailyGoal} problems</span>
                </div>
                <Slider
                  value={[settings.dailyGoal]}
                  min={3}
                  max={15}
                  step={1}
                  onValueChange={(value) => handleUpdateSettings("dailyGoal", value[0])}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Max New Per Day</Label>
                  <span className="text-sm text-muted-foreground">{settings.maxNewPerDay} problems</span>
                </div>
                <Slider
                  value={[settings.maxNewPerDay]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => handleUpdateSettings("maxNewPerDay", value[0])}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Default Interval</Label>
                  <span className="text-sm text-muted-foreground">{settings.defaultInterval} days</span>
                </div>
                <Slider
                  value={[settings.defaultInterval]}
                  min={3}
                  max={14}
                  step={1}
                  onValueChange={(value) => handleUpdateSettings("defaultInterval", value[0])}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

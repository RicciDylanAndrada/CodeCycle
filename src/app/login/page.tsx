"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const LoginPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [sessionCookie, setSessionCookie] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, sessionCookie, csrfToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold">CodeCycle</h1>
          <p className="text-muted-foreground mt-2">LeetCode Spaced Repetition Companion</p>
        </div>

        {showInstructions && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">How to get your LeetCode cookies</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInstructions(false)}
                  aria-label="Close instructions"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="bg-primary text-primary-foreground font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">1</span>
                  <span>Go to <a href="https://leetcode.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">leetcode.com</a> and make sure you&apos;re logged in</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-primary text-primary-foreground font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">2</span>
                  <span>Open DevTools: <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs">F12</kbd> or <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs">Cmd+Option+I</kbd></span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-primary text-primary-foreground font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">3</span>
                  <span>Go to <strong>Application</strong> → <strong>Cookies</strong> → <strong>https://leetcode.com</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-primary text-primary-foreground font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">4</span>
                  <span>Copy <code className="bg-muted px-1.5 py-0.5 rounded text-xs">LEETCODE_SESSION</code> value</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-primary text-primary-foreground font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">5</span>
                  <span>Copy <code className="bg-muted px-1.5 py-0.5 rounded text-xs">csrftoken</code> value</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Connect your LeetCode</CardTitle>
            <CardDescription>Enter your LeetCode credentials to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">LeetCode Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionCookie">LEETCODE_SESSION Cookie</Label>
                <textarea
                  id="sessionCookie"
                  value={sessionCookie}
                  onChange={(e) => setSessionCookie(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                  placeholder="Paste your LEETCODE_SESSION cookie value here..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="csrfToken">csrftoken Cookie</Label>
                <Input
                  id="csrfToken"
                  type="text"
                  value={csrfToken}
                  onChange={(e) => setCsrfToken(e.target.value)}
                  className="font-mono"
                  placeholder="Paste your csrftoken cookie value here..."
                  required
                />
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Connecting..." : "Connect LeetCode Account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-muted-foreground text-xs text-center">
          Your cookies are encrypted and stored securely. They are only used to fetch your LeetCode data.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

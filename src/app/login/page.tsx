"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

  const inputClasses =
    "w-full px-4 py-3.5 bg-white/90 backdrop-blur-sm border border-black/[0.06] rounded-xl text-[#2D2A26] text-sm shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] transition-all placeholder:text-[#A8A299] focus:outline-none focus:border-[#5B8C5A] focus:shadow-[0_0_0_3px_rgba(91,140,90,0.15),inset_0_1px_3px_rgba(0,0,0,0.04)]";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF8F5] to-[#F0EDE8] flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-5">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="text-3xl font-semibold tracking-tight text-[#2D2A26]" aria-label="CodeCycle home">
            CodeCycle
          </Link>
          <p className="text-sm text-[#7A756D]">LeetCode Spaced Repetition Companion</p>
        </div>

        {/* Instructions */}
        {showInstructions && (
          <div className="rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl p-5 shadow-sm shadow-[#2D2A26]/[0.04]">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-base font-semibold text-[#2D2A26]">How to get your LeetCode cookies</h2>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-[#A8A299] hover:text-[#7A756D] text-lg leading-none transition-colors"
                aria-label="Close instructions"
                tabIndex={0}
              >
                &times;
              </button>
            </div>
            <ol className="space-y-3 text-sm text-[#7A756D]">
              {[
                <>Go to <a href="https://leetcode.com" target="_blank" rel="noopener noreferrer" className="text-[#5B8C5A] hover:underline font-medium">leetcode.com</a> and make sure you&apos;re logged in</>,
                <>Open DevTools: <kbd className="bg-[#F0EDE8] px-1.5 py-0.5 rounded text-xs font-mono">F12</kbd> or <kbd className="bg-[#F0EDE8] px-1.5 py-0.5 rounded text-xs font-mono">Cmd+Option+I</kbd></>,
                <>Go to <strong className="text-[#2D2A26]">Application</strong> &rarr; <strong className="text-[#2D2A26]">Cookies</strong> &rarr; <strong className="text-[#2D2A26]">https://leetcode.com</strong></>,
                <>Copy <code className="bg-[#F0EDE8] px-1.5 py-0.5 rounded text-xs font-mono">LEETCODE_SESSION</code> value</>,
                <>Copy <code className="bg-[#F0EDE8] px-1.5 py-0.5 rounded text-xs font-mono">csrftoken</code> value</>,
              ].map((content, i) => (
                <li key={i} className="flex gap-3">
                  <span className="bg-[#5B8C5A] text-white font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">
                    {i + 1}
                  </span>
                  <span>{content}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Login Form */}
        <div className="rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl p-5 shadow-sm shadow-[#2D2A26]/[0.04]">
          <h2 className="text-base font-semibold text-[#2D2A26] mb-1">Connect your LeetCode</h2>
          <p className="text-sm text-[#7A756D] mb-5">Enter your LeetCode credentials to get started.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-sm font-medium text-[#2D2A26]">
                LeetCode Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
                required
                className={inputClasses}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sessionCookie" className="text-sm font-medium text-[#2D2A26]">
                LEETCODE_SESSION Cookie
              </label>
              <textarea
                id="sessionCookie"
                value={sessionCookie}
                onChange={(e) => setSessionCookie(e.target.value)}
                placeholder="Paste your LEETCODE_SESSION cookie value here..."
                required
                className={`${inputClasses} min-h-[80px] font-mono resize-none`}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="csrfToken" className="text-sm font-medium text-[#2D2A26]">
                csrftoken Cookie
              </label>
              <input
                id="csrfToken"
                type="text"
                value={csrfToken}
                onChange={(e) => setCsrfToken(e.target.value)}
                placeholder="Paste your csrftoken cookie value here..."
                required
                className={`${inputClasses} font-mono`}
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-[#F5E8E8] border border-[#B85C5C]/15 text-[#B85C5C] text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-br from-[#5B8C5A] to-[#4A7349] text-white text-sm font-semibold shadow-md shadow-[#5B8C5A]/30 hover:shadow-lg hover:shadow-[#5B8C5A]/35 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 transition-all"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connecting...
                </span>
              ) : (
                "Connect LeetCode Account"
              )}
            </button>
          </form>
        </div>

        <p className="text-[#A8A299] text-xs text-center">
          Your cookies are encrypted and stored securely. They are only used to fetch your LeetCode data.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { fetchUserProfile } from "@/lib/leetcodeClient";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Rate limit: 10 requests per minute (LeetCode API protection)
    const rateLimitResult = await checkRateLimit(request, "leetcode");
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    const profile = await fetchUserProfile(user.leetUsername, {
      sessionCookie: user.sessionCookie,
      csrfToken: user.csrfToken,
    });

    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Rate limit: 30 requests per minute (general)
    const rateLimitResult = await checkRateLimit(request, "general");
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    // Get all problems from database (cached data)
    const problems = await prisma.problem.findMany({
      orderBy: { solvedAt: "desc" },
    });

    return NextResponse.json({
      count: problems.length,
      problems,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Problems fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch problems" },
      { status: 500 }
    );
  }
}

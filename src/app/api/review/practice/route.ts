import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";

interface PracticeRequest {
  difficulties: string[];
  tags: string[];
  count: number;
}

export async function POST(req: Request) {
  try {
    const request = req as NextRequest;

    // Rate limit: 20 requests per minute (prevent spam)
    const rateLimitResult = await checkRateLimit(request, "review");
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    const user = await requireAuth();
    const body: PracticeRequest = await request.json();
    const { difficulties, tags, count } = body;

    if (!count || count < 1 || count > 50) {
      return NextResponse.json(
        { error: "Count must be between 1 and 50" },
        { status: 400 }
      );
    }

    // Build where clause for filtering
    const whereClause: Record<string, unknown> = {};

    if (difficulties && difficulties.length > 0) {
      whereClause.difficulty = {
        in: difficulties.map(d => d.charAt(0).toUpperCase() + d.slice(1).toLowerCase()),
      };
    }

    if (tags && tags.length > 0) {
      whereClause.tags = {
        hasSome: tags.map(t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()),
      };
    }

    // Fetch problems matching filters, prioritizing unsolved, then by solve date
    const problems = await prisma.problem.findMany({
      where: whereClause,
      orderBy: [
        { solvedAt: "asc" },
        { slug: "asc" },
      ],
      take: count,
    });

    return NextResponse.json({
      problems: problems.map(p => ({
        slug: p.slug,
        title: p.title,
        difficulty: p.difficulty,
        tags: p.tags,
        isNew: true, // Practice sessions don't track progress the same way
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Practice review error:", error);
    return NextResponse.json(
      { error: "Failed to get practice problems" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateNextReview, ReviewResult } from "@/lib/spacedRepetition";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { slug, result } = body;

    if (!slug || !result) {
      return NextResponse.json(
        { error: "Missing slug or result" },
        { status: 400 }
      );
    }

    const validResults: ReviewResult[] = [
      "FAILED",
      "STRUGGLED",
      "SOLVED",
      "INSTANT",
    ];
    if (!validResults.includes(result)) {
      return NextResponse.json(
        { error: "Invalid result. Must be FAILED, STRUGGLED, SOLVED, or INSTANT" },
        { status: 400 }
      );
    }

    // Find the problem
    const problem = await prisma.problem.findUnique({
      where: { slug },
    });

    if (!problem) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }

    // Check if progress exists
    const existingProgress = await prisma.userProblemProgress.findUnique({
      where: {
        userId_problemId: {
          userId: user.id,
          problemId: problem.id,
        },
      },
    });

    const isFirstReview = !existingProgress;
    const currentInterval = existingProgress?.intervalDays ?? 0;

    const { nextInterval, nextReviewAt } = calculateNextReview({
      currentInterval,
      result: result as ReviewResult,
      isFirstReview,
    });

    // Upsert progress
    const progress = await prisma.userProblemProgress.upsert({
      where: {
        userId_problemId: {
          userId: user.id,
          problemId: problem.id,
        },
      },
      update: {
        lastReviewed: new Date(),
        intervalDays: nextInterval,
        nextReviewAt,
      },
      create: {
        userId: user.id,
        problemId: problem.id,
        lastReviewed: new Date(),
        intervalDays: nextInterval,
        nextReviewAt,
      },
    });

    return NextResponse.json({
      success: true,
      slug,
      result,
      nextInterval,
      nextReviewAt: nextReviewAt.toISOString().split("T")[0],
      progressId: progress.id,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Review submit error:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}

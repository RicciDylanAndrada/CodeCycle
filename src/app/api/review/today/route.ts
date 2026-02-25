import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface ReviewItem {
  id: string | null;
  slug: string;
  title: string;
  difficulty: string;
  tags: string[];
  lastReviewed: Date | null;
  intervalDays: number;
  isNew: boolean;
}

export async function GET() {
  try {
    const user = await requireAuth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count problems reviewed today
    const completedToday = await prisma.userProblemProgress.count({
      where: {
        userId: user.id,
        lastReviewed: { gte: today },
      },
    });

    // Early return if daily goal already met
    if (completedToday >= user.dailyGoal) {
      return NextResponse.json({
        date: today.toISOString().split("T")[0],
        dailyGoal: user.dailyGoal,
        completedToday,
        remaining: [],
        total: completedToday,
      });
    }

    // Get all reviewed slugs first (needed for never-reviewed query)
    const existingProgressSlugs = await prisma.userProblemProgress.findMany({
      where: { userId: user.id },
      select: { problem: { select: { slug: true } } },
    });
    const reviewedSlugs = new Set(
      existingProgressSlugs.map((p) => p.problem.slug)
    );

    // Calculate max never-reviewed (capped at 50% of daily goal)
    const maxNeverReviewed = Math.min(
      user.maxNewPerDay,
      Math.floor(user.dailyGoal / 2)
    );

    // Fetch never-reviewed problems FIRST (guaranteed slots)
    const neverReviewedProblems = await prisma.problem.findMany({
      where: {
        slug: { notIn: Array.from(reviewedSlugs) },
      },
      orderBy: [
        { solvedAt: "asc" },
        { slug: "asc" },
      ],
      take: maxNeverReviewed,
    });

    // Build the review list starting with never-reviewed
    const reviewList: ReviewItem[] = neverReviewedProblems.map((problem) => ({
      id: null,
      slug: problem.slug,
      title: problem.title,
      difficulty: problem.difficulty,
      tags: problem.tags,
      lastReviewed: null,
      intervalDays: 0,
      isNew: true,
    }));

    // Calculate remaining slots for due reviews
    const remainingSlots = user.dailyGoal - completedToday - reviewList.length;

    // Fetch due reviews to fill remaining slots
    const dueProblems = remainingSlots > 0
      ? await prisma.userProblemProgress.findMany({
          where: {
            userId: user.id,
            nextReviewAt: { lte: today },
            lastReviewed: { lt: today },
          },
          include: {
            problem: true,
          },
          orderBy: {
            nextReviewAt: "asc",
          },
          take: remainingSlots,
        })
      : [];

    // Add due reviews to the list
    for (const p of dueProblems) {
      reviewList.push({
        id: p.id,
        slug: p.problem.slug,
        title: p.problem.title,
        difficulty: p.problem.difficulty,
        tags: p.problem.tags,
        lastReviewed: p.lastReviewed,
        intervalDays: p.intervalDays,
        isNew: false,
      });
    }

    // Calculate total (never show "4/2" if exceeded goal)
    const total = Math.max(user.dailyGoal, completedToday + reviewList.length);

    return NextResponse.json({
      date: today.toISOString().split("T")[0],
      dailyGoal: user.dailyGoal,
      completedToday,
      remaining: reviewList,
      total,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Review today error:", error);
    return NextResponse.json(
      { error: "Failed to get today's review" },
      { status: 500 }
    );
  }
}

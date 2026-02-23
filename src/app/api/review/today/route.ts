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

    // Problems due but NOT yet reviewed today
    const dueProblems = await prisma.userProblemProgress.findMany({
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
    });

    const reviewList: ReviewItem[] = dueProblems.map((p) => ({
      id: p.id,
      slug: p.problem.slug,
      title: p.problem.title,
      difficulty: p.problem.difficulty,
      tags: p.problem.tags,
      lastReviewed: p.lastReviewed,
      intervalDays: p.intervalDays,
      isNew: false,
    }));

    // Fresh imports (never reviewed)
    const remainingSlots = user.dailyGoal - completedToday - reviewList.length;
    const maxNew = Math.min(remainingSlots, user.maxNewPerDay);

    if (maxNew > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - user.defaultInterval);

      const existingProgressSlugs = await prisma.userProblemProgress.findMany({
        where: { userId: user.id },
        select: { problem: { select: { slug: true } } },
      });
      const reviewedSlugs = new Set(
        existingProgressSlugs.map((p) => p.problem.slug)
      );

      const totalProblems = await prisma.problem.count();
      const isNewUser = reviewedSlugs.size < 10 || reviewedSlugs.size < totalProblems * 0.1;

      const freshProblems = await prisma.problem.findMany({
        where: {
          slug: { notIn: Array.from(reviewedSlugs) },
          ...(isNewUser
            ? {}
            : {
                OR: [
                  { solvedAt: { lte: cutoffDate } },
                  { solvedAt: null },
                ],
              }),
        },
        orderBy: [
          { solvedAt: "asc" },
          { slug: "asc" },
        ],
        take: maxNew,
      });

      for (const problem of freshProblems) {
        reviewList.push({
          id: null,
          slug: problem.slug,
          title: problem.title,
          difficulty: problem.difficulty,
          tags: problem.tags,
          lastReviewed: null,
          intervalDays: 0,
          isNew: true,
        });
      }
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

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

    // Priority 1 & 2: Problems already in system that are due
    const dueProblems = await prisma.userProblemProgress.findMany({
      where: {
        userId: user.id,
        nextReviewAt: { lte: today },
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

    // Priority 3: Fresh imports (never reviewed, solved 7+ days ago)
    const remainingSlots = user.dailyGoal - reviewList.length;
    const maxNew = Math.min(remainingSlots, user.maxNewPerDay);

    if (maxNew > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - user.defaultInterval);

      // Get problems that user has solved but never reviewed
      const existingProgressSlugs = await prisma.userProblemProgress.findMany({
        where: { userId: user.id },
        select: { problem: { select: { slug: true } } },
      });
      const reviewedSlugs = new Set(
        existingProgressSlugs.map((p) => p.problem.slug)
      );

      // Count total problems vs reviewed - if user is new (reviewed < 10), be lenient
      const totalProblems = await prisma.problem.count();
      const isNewUser = reviewedSlugs.size < 10 || reviewedSlugs.size < totalProblems * 0.1;

      // Fresh problems: not yet in review schedule.
      // - New user (few reviewed): include any synced problem so today's list fills.
      // - Otherwise: only problems solved 7+ days ago or with no solvedAt.
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

    // Limit to daily goal
    const finalList = reviewList.slice(0, user.dailyGoal);

    return NextResponse.json({
      date: today.toISOString().split("T")[0],
      dailyGoal: user.dailyGoal,
      total: finalList.length,
      problems: finalList,
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

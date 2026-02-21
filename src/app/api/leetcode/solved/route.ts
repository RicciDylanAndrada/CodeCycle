import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { fetchSolvedProblems } from "@/lib/leetcodeClient";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireAuth();

    const solvedProblems = await fetchSolvedProblems(user.leetUsername, {
      sessionCookie: user.sessionCookie,
      csrfToken: user.csrfToken,
    });

    // Sync problems to database
    for (const problem of solvedProblems) {
      await prisma.problem.upsert({
        where: { slug: problem.slug },
        update: {
          title: problem.title,
          difficulty: problem.difficulty,
          tags: problem.topicTags.map((t) => t.name),
          solvedAt: problem.lastSubmittedAt
            ? new Date(problem.lastSubmittedAt)
            : null,
        },
        create: {
          slug: problem.slug,
          title: problem.title,
          difficulty: problem.difficulty,
          tags: problem.topicTags.map((t) => t.name),
          solvedAt: problem.lastSubmittedAt
            ? new Date(problem.lastSubmittedAt)
            : null,
        },
      });
    }

    return NextResponse.json({
      count: solvedProblems.length,
      problems: solvedProblems,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Solved problems fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch solved problems" },
      { status: 500 }
    );
  }
}

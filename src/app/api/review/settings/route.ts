import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireAuth();

    return NextResponse.json({
      dailyGoal: user.dailyGoal,
      maxNewPerDay: user.maxNewPerDay,
      defaultInterval: user.defaultInterval,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to get settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { dailyGoal, maxNewPerDay, defaultInterval } = body;

    const updates: {
      dailyGoal?: number;
      maxNewPerDay?: number;
      defaultInterval?: number;
    } = {};

    if (dailyGoal !== undefined) {
      if (dailyGoal < 1 || dailyGoal > 20) {
        return NextResponse.json(
          { error: "dailyGoal must be between 1 and 20" },
          { status: 400 }
        );
      }
      updates.dailyGoal = dailyGoal;
    }

    if (maxNewPerDay !== undefined) {
      if (maxNewPerDay < 1 || maxNewPerDay > 10) {
        return NextResponse.json(
          { error: "maxNewPerDay must be between 1 and 10" },
          { status: 400 }
        );
      }
      updates.maxNewPerDay = maxNewPerDay;
    }

    if (defaultInterval !== undefined) {
      if (defaultInterval < 1 || defaultInterval > 30) {
        return NextResponse.json(
          { error: "defaultInterval must be between 1 and 30" },
          { status: 400 }
        );
      }
      updates.defaultInterval = defaultInterval;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updates,
    });

    return NextResponse.json({
      dailyGoal: updatedUser.dailyGoal,
      maxNewPerDay: updatedUser.maxNewPerDay,
      defaultInterval: updatedUser.defaultInterval,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

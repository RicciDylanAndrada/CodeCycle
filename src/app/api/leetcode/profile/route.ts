import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { fetchUserProfile } from "@/lib/leetcodeClient";

export async function GET() {
  try {
    const user = await requireAuth();

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

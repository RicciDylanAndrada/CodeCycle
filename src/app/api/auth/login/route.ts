import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import { validateCredentials } from "@/lib/leetcodeClient";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, sessionCookie, csrfToken } = body;

    if (!username || !sessionCookie || !csrfToken) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const isValid = await validateCredentials(username, {
      sessionCookie,
      csrfToken,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid LeetCode credentials. Please check your cookies." },
        { status: 401 }
      );
    }

    const encryptedSession = encrypt(sessionCookie);
    const encryptedCsrf = encrypt(csrfToken);

    const user = await prisma.user.upsert({
      where: { leetUsername: username.toLowerCase() },
      update: {
        sessionCookie: encryptedSession,
        csrfToken: encryptedCsrf,
      },
      create: {
        leetUsername: username.toLowerCase(),
        sessionCookie: encryptedSession,
        csrfToken: encryptedCsrf,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return NextResponse.json({ success: true, username: user.leetUsername });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}

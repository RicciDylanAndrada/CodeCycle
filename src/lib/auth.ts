import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { decrypt } from "./encryption";

export interface AuthUser {
  id: string;
  leetUsername: string;
  dailyGoal: number;
  maxNewPerDay: number;
  defaultInterval: number;
  sessionCookie: string;
  csrfToken: string;
}

export const getAuthUser = async (): Promise<AuthUser | null> => {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      leetUsername: user.leetUsername,
      dailyGoal: user.dailyGoal,
      maxNewPerDay: user.maxNewPerDay,
      defaultInterval: user.defaultInterval,
      sessionCookie: decrypt(user.sessionCookie),
      csrfToken: decrypt(user.csrfToken),
    };
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
};

export const requireAuth = async (): Promise<AuthUser> => {
  const user = await getAuthUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
};

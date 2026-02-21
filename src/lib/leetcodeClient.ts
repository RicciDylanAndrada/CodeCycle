const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

interface LeetCodeCredentials {
  sessionCookie: string;
  csrfToken: string;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

const makeGraphQLRequest = async <T>(
  query: string,
  variables: Record<string, unknown>,
  credentials: LeetCodeCredentials
): Promise<T> => {
  const response = await fetch(LEETCODE_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `LEETCODE_SESSION=${credentials.sessionCookie}; csrftoken=${credentials.csrfToken}`,
      "x-csrftoken": credentials.csrfToken,
      Referer: "https://leetcode.com",
      Origin: "https://leetcode.com",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`LeetCode API error: ${response.status}`);
  }

  const json = (await response.json()) as GraphQLResponse<T>;

  if (json.errors && json.errors.length > 0) {
    throw new Error(`GraphQL error: ${json.errors[0].message}`);
  }

  if (!json.data) {
    throw new Error("No data returned from LeetCode");
  }

  return json.data;
};

export interface UserProfile {
  username: string;
  submitStatsGlobal: {
    acSubmissionNum: Array<{
      difficulty: string;
      count: number;
    }>;
  };
}

export const fetchUserProfile = async (
  username: string,
  credentials: LeetCodeCredentials
): Promise<UserProfile> => {
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

  const data = await makeGraphQLRequest<{ matchedUser: UserProfile }>(
    query,
    { username },
    credentials
  );

  return data.matchedUser;
};

export interface SolvedProblem {
  slug: string;
  title: string;
  difficulty: string;
  topicTags: Array<{ name: string }>;
  lastSubmittedAt?: number;
}

export interface SubmissionDetails {
  titleSlug: string;
  title: string;
  difficulty: string;
  topicTags: Array<{ name: string }>;
  timestamp: string;
}

export const fetchSolvedProblems = async (
  username: string,
  credentials: LeetCodeCredentials
): Promise<SolvedProblem[]> => {
  const query = `
    query recentAcSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        titleSlug
        title
        timestamp
      }
    }
  `;

  const submissionsData = await makeGraphQLRequest<{
    recentAcSubmissionList: Array<{
      titleSlug: string;
      title: string;
      timestamp: string;
    }>;
  }>(query, { username, limit: 500 }, credentials);

  const uniqueProblems = new Map<string, { title: string; timestamp: string }>();

  for (const submission of submissionsData.recentAcSubmissionList) {
    if (!uniqueProblems.has(submission.titleSlug)) {
      uniqueProblems.set(submission.titleSlug, {
        title: submission.title,
        timestamp: submission.timestamp,
      });
    }
  }

  const problemDetailsQuery = `
    query getProblemDetails($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        titleSlug
        title
        difficulty
        topicTags {
          name
        }
      }
    }
  `;

  const problems: SolvedProblem[] = [];

  for (const [slug, { title, timestamp }] of uniqueProblems) {
    try {
      const details = await makeGraphQLRequest<{
        question: {
          titleSlug: string;
          title: string;
          difficulty: string;
          topicTags: Array<{ name: string }>;
        };
      }>(problemDetailsQuery, { titleSlug: slug }, credentials);

      problems.push({
        slug: details.question.titleSlug,
        title: details.question.title,
        difficulty: details.question.difficulty,
        topicTags: details.question.topicTags,
        lastSubmittedAt: parseInt(timestamp) * 1000,
      });
    } catch {
      problems.push({
        slug,
        title,
        difficulty: "Unknown",
        topicTags: [],
        lastSubmittedAt: parseInt(timestamp) * 1000,
      });
    }
  }

  return problems;
};

export const validateCredentials = async (
  username: string,
  credentials: LeetCodeCredentials
): Promise<boolean> => {
  try {
    const profile = await fetchUserProfile(username, credentials);
    return profile.username.toLowerCase() === username.toLowerCase();
  } catch {
    return false;
  }
};

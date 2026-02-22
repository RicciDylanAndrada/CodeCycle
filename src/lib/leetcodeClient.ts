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
  const problems: SolvedProblem[] = [];

  // Method 1: Try problemsetQuestionList with AC filter (gets ALL solved)
  const problemsetQuery = `
    query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
      problemsetQuestionList: questionList(
        categorySlug: $categorySlug
        limit: $limit
        skip: $skip
        filters: $filters
      ) {
        total: totalNum
        questions: data {
          titleSlug
          title
          difficulty
          topicTags {
            name
          }
        }
      }
    }
  `;

  try {
    let skip = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const data = await makeGraphQLRequest<{
        problemsetQuestionList: {
          total: number;
          questions: Array<{
            titleSlug: string;
            title: string;
            difficulty: string;
            topicTags: Array<{ name: string }>;
          }>;
        };
      }>(
        problemsetQuery,
        {
          categorySlug: "",
          limit,
          skip,
          filters: { status: "AC" },
        },
        credentials
      );

      const questions = data.problemsetQuestionList.questions;

      for (const q of questions) {
        problems.push({
          slug: q.titleSlug,
          title: q.title,
          difficulty: q.difficulty,
          topicTags: q.topicTags,
          lastSubmittedAt: undefined,
        });
      }

      skip += limit;
      hasMore = questions.length === limit && skip < data.problemsetQuestionList.total;
    }
  } catch (error) {
    console.log("problemsetQuestionList failed, falling back to recentAcSubmissionList:", error);
  }

  // Method 2: If Method 1 failed or returned nothing, use recentAcSubmissionList
  if (problems.length === 0) {
    const recentQuery = `
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
    }>(recentQuery, { username, limit: 5000 }, credentials);

    const uniqueProblems = new Map<string, { title: string; timestamp: string }>();

    for (const submission of submissionsData.recentAcSubmissionList) {
      if (!uniqueProblems.has(submission.titleSlug)) {
        uniqueProblems.set(submission.titleSlug, {
          title: submission.title,
          timestamp: submission.timestamp,
        });
      }
    }

    // Get details for each unique problem
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
  }

  // Get timestamps for problems from Method 1
  const recentQuery = `
    query recentAcSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        titleSlug
        timestamp
      }
    }
  `;

  try {
    const recentData = await makeGraphQLRequest<{
      recentAcSubmissionList: Array<{
        titleSlug: string;
        timestamp: string;
      }>;
    }>(recentQuery, { username, limit: 5000 }, credentials);

    const timestampMap = new Map<string, number>();
    for (const sub of recentData.recentAcSubmissionList) {
      if (!timestampMap.has(sub.titleSlug)) {
        timestampMap.set(sub.titleSlug, parseInt(sub.timestamp) * 1000);
      }
    }

    for (const problem of problems) {
      problem.lastSubmittedAt = timestampMap.get(problem.slug);
    }
  } catch {
    // Timestamps are optional
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

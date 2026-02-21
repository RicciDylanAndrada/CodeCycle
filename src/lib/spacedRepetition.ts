export type ReviewResult = "FAILED" | "STRUGGLED" | "SOLVED" | "INSTANT";

interface SpacedRepetitionInput {
  currentInterval: number;
  result: ReviewResult;
  isFirstReview: boolean;
}

interface SpacedRepetitionOutput {
  nextInterval: number;
  nextReviewAt: Date;
}

export const calculateNextReview = ({
  currentInterval,
  result,
  isFirstReview,
}: SpacedRepetitionInput): SpacedRepetitionOutput => {
  let nextInterval: number;

  if (isFirstReview) {
    switch (result) {
      case "FAILED":
        nextInterval = 1;
        break;
      case "STRUGGLED":
        nextInterval = 1;
        break;
      case "SOLVED":
        nextInterval = 2;
        break;
      case "INSTANT":
        nextInterval = 4;
        break;
    }
  } else {
    switch (result) {
      case "FAILED":
        nextInterval = 1;
        break;
      case "STRUGGLED":
        nextInterval = Math.max(1, Math.round(currentInterval * 1.2));
        break;
      case "SOLVED":
        nextInterval = Math.max(2, Math.round(currentInterval * 1.5));
        break;
      case "INSTANT":
        nextInterval = currentInterval * 2;
        break;
    }
  }

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + nextInterval);
  nextReviewAt.setHours(0, 0, 0, 0);

  return {
    nextInterval,
    nextReviewAt,
  };
};

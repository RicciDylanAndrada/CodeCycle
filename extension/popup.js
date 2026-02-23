// CodeCycle Extension Popup

let problems = [];
let currentIndex = 0;
let completedToday = 0;
let totalProblems = 0;
let isLoggedIn = false;

// DOM Elements
const screens = {
  loading: document.getElementById("loading"),
  login: document.getElementById("login"),
  review: document.getElementById("review")
};

const elements = {
  usernameInput: document.getElementById("username-input"),
  connectBtn: document.getElementById("connect-btn"),
  loginError: document.getElementById("login-error"),
  progress: document.getElementById("progress"),
  noProblems: document.getElementById("no-problems"),
  currentProblem: document.getElementById("current-problem"),
  completed: document.getElementById("completed"),
  problemTitle: document.getElementById("problem-title"),
  problemDifficulty: document.getElementById("problem-difficulty"),
  problemTags: document.getElementById("problem-tags"),
  newBadge: document.getElementById("new-badge"),
  openProblem: document.getElementById("open-problem"),
  syncBtn: document.getElementById("sync-btn"),
  doneBtn: document.getElementById("done-btn"),
  ratingButtons: document.querySelectorAll(".rating-btn")
};

// Show a screen
function showScreen(screenName) {
  Object.values(screens).forEach(s => s.classList.add("hidden"));
  screens[screenName].classList.remove("hidden");
}

// Send message to background script
function sendMessage(action, data = {}) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action, ...data }, resolve);
  });
}

// Initialize
async function init() {
  showScreen("loading");

  const cookies = await sendMessage("getCookies");

  if (!cookies) {
    showScreen("login");
    return;
  }

  const username = await sendMessage("getUsername");

  if (!username) {
    showScreen("login");
    return;
  }

  const review = await sendMessage("getTodayReview");

  if (review.error === "Unauthorized") {
    await attemptLogin(username, cookies);
    return;
  }

  if (review.error) {
    showScreen("login");
    return;
  }

  isLoggedIn = true;
  completedToday = review.completedToday || 0;
  problems = review.remaining || [];
  totalProblems = review.total || 0;
  currentIndex = 0;
  showReviewScreen();
}

// Attempt login
async function attemptLogin(username, cookies) {
  const result = await sendMessage("login", {
    data: {
      username,
      sessionCookie: cookies.sessionCookie,
      csrfToken: cookies.csrfToken
    }
  });

  if (result.error) {
    elements.loginError.textContent = result.error;
    elements.loginError.classList.remove("hidden");
    showScreen("login");
    return false;
  }

  await sendMessage("saveUsername", { username });

  const review = await sendMessage("getTodayReview");
  isLoggedIn = true;
  completedToday = review.completedToday || 0;
  problems = review.remaining || [];
  totalProblems = review.total || 0;
  currentIndex = 0;
  showReviewScreen();
  return true;
}

// Show review screen
function showReviewScreen() {
  showScreen("review");
  updateProgress();

  if (problems.length === 0) {
    elements.noProblems.classList.remove("hidden");
    elements.currentProblem.classList.add("hidden");
    elements.completed.classList.add("hidden");

    // Show completed state if we've done work today
    if (completedToday > 0) {
      elements.noProblems.classList.add("hidden");
      elements.completed.classList.remove("hidden");
    }
  } else if (currentIndex >= problems.length) {
    elements.noProblems.classList.add("hidden");
    elements.currentProblem.classList.add("hidden");
    elements.completed.classList.remove("hidden");
  } else {
    elements.noProblems.classList.add("hidden");
    elements.currentProblem.classList.remove("hidden");
    elements.completed.classList.add("hidden");
    showCurrentProblem();
  }
}

// Update progress badge
function updateProgress() {
  const done = completedToday + currentIndex;
  elements.progress.textContent = `${done}/${totalProblems}`;
}

// Show current problem
function showCurrentProblem() {
  const problem = problems[currentIndex];

  elements.problemTitle.textContent = problem.title;
  elements.problemDifficulty.textContent = problem.difficulty;
  elements.problemDifficulty.className = "difficulty " + problem.difficulty.toLowerCase();

  const tags = problem.tags || [];
  elements.problemTags.textContent = tags.slice(0, 2).join(" · ");

  if (problem.isNew) {
    elements.newBadge.classList.remove("hidden");
  } else {
    elements.newBadge.classList.add("hidden");
  }

  elements.openProblem.href = `https://leetcode.com/problems/${problem.slug}/`;
}

// Submit rating
async function submitRating(result, clickedBtn) {
  const problem = problems[currentIndex];

  // Add loading state to clicked button
  clickedBtn.classList.add("btn-loading");
  elements.ratingButtons.forEach(btn => btn.disabled = true);

  const response = await sendMessage("submitReview", {
    data: {
      slug: problem.slug,
      result
    }
  });

  // Remove loading state
  clickedBtn.classList.remove("btn-loading");
  elements.ratingButtons.forEach(btn => btn.disabled = false);

  if (response.error) {
    console.error("Submit error:", response.error);
    return;
  }

  currentIndex++;
  updateProgress();
  showReviewScreen();
}

// Sync problems
async function syncProblems() {
  elements.syncBtn.disabled = true;
  elements.syncBtn.innerHTML = '<span class="spinner-inline"></span>Syncing...';

  const result = await sendMessage("syncProblems");

  elements.syncBtn.disabled = false;
  elements.syncBtn.textContent = "Sync from LeetCode";

  if (result.error) {
    console.error("Sync error:", result.error);
    return;
  }

  const review = await sendMessage("getTodayReview");
  completedToday = review.completedToday || 0;
  problems = review.remaining || [];
  totalProblems = review.total || 0;
  currentIndex = 0;
  showReviewScreen();
}

// Event Listeners
elements.connectBtn.addEventListener("click", async () => {
  const username = elements.usernameInput.value.trim();

  if (!username) {
    elements.loginError.textContent = "Please enter your LeetCode username";
    elements.loginError.classList.remove("hidden");
    return;
  }

  elements.connectBtn.disabled = true;
  elements.connectBtn.innerHTML = '<span class="spinner-inline"></span>Connecting...';
  elements.loginError.classList.add("hidden");

  const cookies = await sendMessage("getCookies");

  if (!cookies) {
    elements.loginError.textContent = "Please log into LeetCode first, then try again";
    elements.loginError.classList.remove("hidden");
    elements.connectBtn.disabled = false;
    elements.connectBtn.textContent = "Connect LeetCode";
    return;
  }

  const success = await attemptLogin(username, cookies);

  if (!success) {
    elements.connectBtn.disabled = false;
    elements.connectBtn.textContent = "Connect LeetCode";
  }
});

elements.ratingButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const result = btn.dataset.result;
    submitRating(result, btn);
  });
});

elements.syncBtn.addEventListener("click", syncProblems);

elements.doneBtn.addEventListener("click", () => {
  window.close();
});

// Start
init();

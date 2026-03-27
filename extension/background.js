// Background service worker for CodeCycle extension

const API_BASE = "https://codecycle.vercel.app";

// Get LeetCode cookies
async function getLeetCodeCookies() {
  const cookies = await chrome.cookies.getAll({ domain: "leetcode.com" });

  const sessionCookie = cookies.find(c => c.name === "LEETCODE_SESSION");
  const csrfToken = cookies.find(c => c.name === "csrftoken");

  if (!sessionCookie || !csrfToken) {
    return null;
  }

  return {
    sessionCookie: sessionCookie.value,
    csrfToken: csrfToken.value
  };
}

// Get LeetCode username from cookies or storage
async function getLeetCodeUsername() {
  const stored = await chrome.storage.local.get(["leetUsername"]);
  if (stored.leetUsername) {
    return stored.leetUsername;
  }
  return null;
}

// Save username to storage
async function saveUsername(username) {
  await chrome.storage.local.set({ leetUsername: username });
}

// Get stored userId
async function getUserId() {
  const stored = await chrome.storage.local.get(["userId"]);
  return stored.userId || null;
}

// Save userId to storage
async function saveUserId(userId) {
  await chrome.storage.local.set({ userId });
}

// API calls — sends userId via header since extension can't use cookies
async function apiCall(endpoint, options = {}) {
  const userId = await getUserId();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  if (userId) {
    headers["x-user-id"] = userId;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });
  return response;
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCookies") {
    getLeetCodeCookies().then(sendResponse);
    return true;
  }

  if (request.action === "getUsername") {
    getLeetCodeUsername().then(sendResponse);
    return true;
  }

  if (request.action === "saveUsername") {
    saveUsername(request.username).then(() => sendResponse({ success: true }));
    return true;
  }

  if (request.action === "login") {
    apiCall("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(request.data)
    })
      .then(res => res.json())
      .then(async (data) => {
        if (data.userId) {
          await saveUserId(data.userId);
        }
        sendResponse(data);
      })
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }

  if (request.action === "getTodayReview") {
    apiCall("/api/review/today")
      .then(res => res.json())
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }

  if (request.action === "submitReview") {
    apiCall("/api/review/submit", {
      method: "POST",
      body: JSON.stringify(request.data)
    })
      .then(res => res.json())
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }

  if (request.action === "syncProblems") {
    apiCall("/api/leetcode/solved")
      .then(res => res.json())
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }
});

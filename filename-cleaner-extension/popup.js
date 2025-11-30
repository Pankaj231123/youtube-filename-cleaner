const API_BASE = "http://localhost:4000";

const userIdEl = document.getElementById("userId");
const rawEl = document.getElementById("rawFilename");
const nicheEl = document.getElementById("niche");
const titleEl = document.getElementById("title");
const useEpisodeEl = document.getElementById("useEpisode");
const outputEl = document.getElementById("output");
const copyBtn = document.getElementById("copyBtn");
const cleanBtn = document.getElementById("cleanBtn");

// Load saved userId
chrome.storage.local.get(["userId"], (data) => {
  if (data.userId) userIdEl.value = data.userId;
});

userIdEl.addEventListener("input", () => {
  chrome.storage.local.set({ userId: userIdEl.value });
});

cleanBtn.addEventListener("click", async () => {
  outputEl.textContent = "Cleaning...";
  copyBtn.style.display = "none";

  const payload = {
    userId: userIdEl.value.trim(),
    rawFilename: rawEl.value.trim(),
    niche: nicheEl.value.trim(),
    title: titleEl.value.trim(),
    useEpisode: useEpisodeEl.checked
  };

  console.log("Sending payload:", payload);

  if (!payload.userId || !payload.rawFilename) {
    outputEl.textContent = "userId and rawFilename required!";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/clean`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      mode: "cors"
    });

    let data = {};
    try { data = await res.json(); } catch (e) {}

    console.log("Response status:", res.status);
    console.log("Response data:", data);

    if (!res.ok) {
      outputEl.textContent = data.error || data.details || "Request failed";
      return;
    }

    outputEl.textContent = data.cleanFilename;
    copyBtn.style.display = "block";

    copyBtn.onclick = () => {
      navigator.clipboard.writeText(data.cleanFilename);
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy"), 1200);
    };

  } catch (err) {
    console.error("Fetch error:", err);
    outputEl.textContent = "Failed to fetch. Check manifest reload.";
  }
});

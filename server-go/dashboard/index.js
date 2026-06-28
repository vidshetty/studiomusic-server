/**
 * Upload dashboard — calls POST /track and POST /lyrics.
 * Auth: session cookie (dashboard_jwt) sent via credentials: 'include'.
 */

const API = {
  albums: "/dashboard/api/albums",
  album: "/dashboard/api/album",
  trackMeta: "/dashboard/api/track",
  search: "/dashboard/api/search",
  albumDetails: "/dashboard/api/album/details",
  trackDetails: "/dashboard/api/track/details",
  usersSearch: "/dashboard/api/users/search",
  userDetails: "/dashboard/api/user/details",
  user: "/dashboard/api/user",
  objectId: {
    albumId: "/dashboard/api/object-id/albumId",
    trackId: "/dashboard/api/object-id/trackId",
  },
  trackUpload: "/dashboard/track",
  lyrics: "/dashboard/lyrics",
};

const TAB_COPY = {
  upload: {
    title: "Upload content",
    desc: "Fill in album and track metadata, then upload audio and lyrics files.",
  },
  edit: {
    title: "Edit content",
    desc: "Search for existing albums and tracks, then update their metadata.",
  },
  users: {
    title: "Manage users",
    desc: "Search for users by email or username, then update account details.",
  },
};

const fetchOpts = { credentials: "include" };
const LOGIN_URL = "/dashboard/login";

function todayDateString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function setAlbumAddedDateDefault() {
  const today = todayDateString();
  const uploadInput = document.getElementById("album-added-date");
  if (uploadInput) uploadInput.value = today;
  const editInput = document.getElementById("edit-album-added-date");
  if (editInput && !editInput.value) editInput.value = today;
}

function initAlbumAddedDateDefaults() {
  setAlbumAddedDateDefault();
}

function getAlbumAddedDate(inputId) {
  return document.getElementById(inputId)?.value || todayDateString();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAlbumAddedDateDefaults);
} else {
  initAlbumAddedDateDefaults();
}

let unauthorizedHandled = false;

class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthError";
  }
}

function showUnauthorizedPopup(message) {
  if (unauthorizedHandled) return;
  unauthorizedHandled = true;

  const overlay = document.getElementById("auth-popup-overlay");
  const text = document.getElementById("auth-popup-text");
  if (text) {
    text.textContent = message || "Session expired. Please sign in again.";
  }
  if (overlay) {
    overlay.classList.remove("hidden");
  }

  window.setTimeout(() => {
    window.location.assign(LOGIN_URL);
  }, 3000);
}

function shouldIgnoreFetchError(err) {
  return err?.name === "AbortError" || err?.name === "AuthError" || unauthorizedHandled;
}

async function getUnauthorizedMessage(res) {
  if (res.status === 403) {
    return "Access denied. Please sign in again.";
  }

  try {
    const parsed = await parseErrorResponse(res.clone());
    if (parsed && parsed !== "{}" && parsed !== "Unauthorized") {
      return parsed;
    }
  } catch {
    // fall through to default
  }

  return "Session expired. Please sign in again.";
}

async function isLoginHtmlResponse(res) {
  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  if (!contentType.includes("text/html")) return false;

  try {
    const html = await res.clone().text();
    return html.includes("auth-page") || html.includes('href="/dashboard/auth/google"');
  } catch {
    return false;
  }
}

async function assertAuthorizedResponse(res, requestUrl) {
  if (res.status === 401 || res.status === 403) {
    const message = await getUnauthorizedMessage(res);
    showUnauthorizedPopup(message);
    throw new AuthError(message);
  }

  const finalUrl = String(res.url || "");
  if (
    finalUrl.includes("/dashboard/login") ||
    finalUrl.includes("/dashboard/auth/unauthorized")
  ) {
    const message = "Session expired. Please sign in again.";
    showUnauthorizedPopup(message);
    throw new AuthError(message);
  }

  if (String(requestUrl).startsWith("/dashboard") && (await isLoginHtmlResponse(res))) {
    const message = "Session expired. Please sign in again.";
    showUnauthorizedPopup(message);
    throw new AuthError(message);
  }
}

async function dashboardFetch(url, options = {}) {
  const res = await fetch(url, {
    ...fetchOpts,
    ...options,
    credentials: "include",
    headers: {
      Accept: "application/json, text/plain, */*",
      "X-Dashboard-Request": "1",
      ...options.headers,
    },
  });

  await assertAuthorizedResponse(res, url);
  return res;
}

/** Mirrors server convertTitleForFolder (handlers.go). */
function convertTitleForFolder(title) {
  const symbols = new Set(["-", "/", '"', "'"]);
  let name = "";
  for (const char of title) {
    if (char === " ") continue;
    if (symbols.has(char)) name += "_";
    else name += char;
  }
  return name;
}

const STATUS_ICONS = {
  success: "check_circle",
  error: "error",
  info: "info",
};

function showStatus(el, type, message) {
  el.classList.remove("hidden", "success", "error", "info");
  el.classList.add(type);
  const icon = el.querySelector(".status-icon");
  const text = el.querySelector(".status-text");
  if (icon) icon.textContent = STATUS_ICONS[type] || "info";
  if (text) text.textContent = message;
  else el.textContent = message;
}

function hideStatus(el) {
  el.classList.add("hidden");
  const text = el.querySelector(".status-text");
  if (text) text.textContent = "";
  else el.textContent = "";
}

function setLoading(btn, spinner, loading) {
  btn.disabled = loading;
  spinner.classList.toggle("hidden", !loading);
}

async function parseErrorResponse(res) {
  try {
    const data = await res.json();
    if (data && typeof data.message === "string") return data.message;
    return JSON.stringify(data);
  } catch {
    return res.statusText || `HTTP ${res.status}`;
  }
}

function setupDropzone(dropzone, input, metaEl, onFile) {
  const openPicker = () => input.click();

  dropzone.addEventListener("click", (e) => {
    if (e.target === input) return;
    openPicker();
  });

  dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPicker();
    }
  });

  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (file) onFile(file);
  });

  ["dragenter", "dragover"].forEach((ev) => {
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add("dragover");
    });
  });

  ["dragleave", "drop"].forEach((ev) => {
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove("dragover");
    });
  });

  dropzone.addEventListener("drop", (e) => {
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    onFile(file);
  });

  function onFile(file) {
    metaEl.textContent = `${file.name} (${formatBytes(file.size)})`;
    dropzone.classList.add("has-file");
  }
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

// --- Tab navigation ---

function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  const panels = {
    upload: document.getElementById("tab-upload"),
    edit: document.getElementById("tab-edit"),
    users: document.getElementById("tab-users"),
  };
  const pageTitle = document.getElementById("page-title");
  const pageDesc = document.getElementById("page-desc");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const name = tab.dataset.tab;
      if (!name || !panels[name]) return;

      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });

      Object.entries(panels).forEach(([key, panel]) => {
        if (!panel) return;
        panel.classList.toggle("active", key === name);
        panel.classList.toggle("hidden", key !== name);
      });

      const copy = TAB_COPY[name];
      if (copy && pageTitle) pageTitle.textContent = copy.title;
      if (copy && pageDesc) pageDesc.textContent = copy.desc;
    });
  });
}

setupTabs();

// --- Metadata forms (schema.ts → proxied /dashboard/api/*) ---

async function fetchObjectId(kind) {
  const url = API.objectId[kind];
  const res = await dashboardFetch(url, { ...fetchOpts });
  if (!res.ok) throw new Error(await parseErrorResponse(res));
  const data = await res.json();
  const id = data.objectId || data.objectID || data.id;
  if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) {
    throw new Error("Invalid ObjectId returned from server.");
  }
  return id;
}

function wireObjectIdButton(buttonId, inputId, kind, statusEl) {
  const btn = document.getElementById(buttonId);
  const input = document.getElementById(inputId);
  if (!btn || !input) return;

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    if (statusEl) hideStatus(statusEl);

    try {
      input.value = await fetchObjectId(kind);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      if (kind === "albumId" && trackMetaAlbumIdOverride) {
        trackMetaAlbumIdOverride.value = input.value;
      }
    } catch (err) {
      if (shouldIgnoreFetchError(err)) return;
      if (statusEl) showStatus(statusEl, "error", err.message || "Failed to generate ObjectId.");
    } finally {
      btn.disabled = false;
    }
  });
}

function setupAlbumSearch() {
  const searchInput = document.getElementById("track-album-search");
  const resultsEl = document.getElementById("track-album-results");
  const selectedEl = document.getElementById("track-album-selected");
  const albumIdInput = document.getElementById("track-meta-album-id");
  if (!searchInput || !resultsEl || !albumIdInput) return;

  let debounceTimer = null;
  let activeController = null;

  const hideResults = () => {
    resultsEl.classList.add("hidden");
    resultsEl.innerHTML = "";
  };

  const showSelected = (album) => {
    if (!selectedEl) return;
    if (!album) {
      selectedEl.classList.add("hidden");
      selectedEl.textContent = "";
      return;
    }
    selectedEl.textContent = `Selected: ${album.Album} (${album.Type}) · ${album._albumId}`;
    selectedEl.classList.remove("hidden");
  };

  const selectAlbum = (album) => {
    albumIdInput.value = album._albumId;
    searchInput.value = album.Album;
    showSelected(album);
    hideResults();
  };

  const renderResults = (albums, emptyMessage) => {
    resultsEl.innerHTML = "";
    if (!albums.length) {
      const li = document.createElement("li");
      li.className = "album-search-empty";
      li.textContent = emptyMessage;
      resultsEl.appendChild(li);
      resultsEl.classList.remove("hidden");
      return;
    }
    for (const a of albums) {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "album-search-option";
      btn.setAttribute("role", "option");
      btn.innerHTML = `${a.Album}<span class="album-search-option-meta">${a.AlbumArtist} · ${a.Type} · ${a.Year}</span>`;
      btn.addEventListener("click", () => selectAlbum(a));
      li.appendChild(btn);
      resultsEl.appendChild(li);
    }
    resultsEl.classList.remove("hidden");
  };

  const runSearch = async (q) => {
    if (activeController) activeController.abort();
    activeController = new AbortController();

    try {
      const albums = await dashboardFetch(
        `${API.albums}?q=${encodeURIComponent(q)}`,
        { ...fetchOpts, signal: activeController.signal }
      ).then(async (res) => {
        if (!res.ok) throw new Error(await parseErrorResponse(res));
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      });
      renderResults(albums, "No albums match your search.");
    } catch (err) {
      if (shouldIgnoreFetchError(err)) return;
      renderResults([], err.message || "Search failed.");
    }
  };

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim();
    showSelected(null);
    albumIdInput.value = "";

    if (debounceTimer) clearTimeout(debounceTimer);

    if (!q) {
      hideResults();
      return;
    }

    debounceTimer = setTimeout(() => runSearch(q), 300);
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".album-search")) hideResults();
  });
}

function setSelectedAlbumFromSave(album) {
  const searchInput = document.getElementById("track-album-search");
  const albumIdInput = document.getElementById("track-meta-album-id");
  const selectedEl = document.getElementById("track-album-selected");
  if (!album?._albumId) return;
  if (albumIdInput) albumIdInput.value = album._albumId;
  if (searchInput) searchInput.value = album.Album || "";
  if (selectedEl) {
    selectedEl.textContent = `Selected: ${album.Album} (${album.Type}) · ${album._albumId}`;
    selectedEl.classList.remove("hidden");
  }
}

function showJsonPreview(previewEl, data) {
  previewEl.textContent = JSON.stringify(data, null, 2);
  previewEl.classList.remove("hidden");
}

function hideJsonPreview(previewEl) {
  previewEl.classList.add("hidden");
  previewEl.textContent = "";
}

const albumMetaForm = document.getElementById("album-meta-form");
const albumMetaStatus = document.getElementById("album-meta-status");
const albumMetaPreview = document.getElementById("album-meta-preview");
const albumMetaSubmit = document.getElementById("album-meta-submit");
const albumMetaSpinner = document.getElementById("album-meta-spinner");
const trackMetaAlbumIdOverride = document.getElementById("track-meta-album-id");

if (albumMetaForm) {
  document.getElementById("album-meta-reset")?.addEventListener("click", () => {
    albumMetaForm.reset();
    setAlbumAddedDateDefault();
    hideStatus(albumMetaStatus);
    hideJsonPreview(albumMetaPreview);
  });

  albumMetaForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideStatus(albumMetaStatus);

    const releaseInput = document.getElementById("album-release");
    const releaseDate = releaseInput?.value || "";
    if (!releaseDate) {
      showStatus(albumMetaStatus, "error", "Release date is required.");
      return;
    }

    const addedDate = getAlbumAddedDate("album-added-date");

    const albumId = document.getElementById("album-album-id")?.value.trim() || "";
    if (!/^[a-fA-F0-9]{24}$/.test(albumId)) {
      showStatus(albumMetaStatus, "error", "Generate an _albumId before saving.");
      return;
    }

    const album = {
      _albumId: albumId,
      Album: document.getElementById("album-name").value.trim(),
      AlbumArtist: document.getElementById("album-artist").value.trim(),
      Year: document.getElementById("album-year").value.trim(),
      Color: document.getElementById("album-color").value.trim(),
      releaseDate,
      addedDate,
      Thumbnail: document.getElementById("album-thumbnail").value.trim(),
      Type: document.getElementById("album-type").value,
    };

    const light = document.getElementById("album-light").value.trim();
    const dark = document.getElementById("album-dark").value.trim();
    if (light) album.LightColor = light;
    if (dark) album.DarkColor = dark;

    setLoading(albumMetaSubmit, albumMetaSpinner, true);
    showStatus(albumMetaStatus, "info", "Saving album…");

    try {
      const res = await dashboardFetch(API.album, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(album),
        ...fetchOpts,
      });
      if (!res.ok) throw new Error(await parseErrorResponse(res));

      const data = await res.json();
      const saved = data.album || data;
      showJsonPreview(albumMetaPreview, saved);
      showStatus(albumMetaStatus, "success", data.message || "Album saved.");
      setSelectedAlbumFromSave(saved);
    } catch (err) {
      if (shouldIgnoreFetchError(err)) return;
      showStatus(albumMetaStatus, "error", err.message || "Failed to save album.");
    } finally {
      setLoading(albumMetaSubmit, albumMetaSpinner, false);
    }
  });
}

const trackMetaForm = document.getElementById("track-meta-form");
const trackMetaStatus = document.getElementById("track-meta-status");
const trackMetaPreview = document.getElementById("track-meta-preview");

wireObjectIdButton("gen-album-id", "album-album-id", "albumId", albumMetaStatus);
wireObjectIdButton("gen-track-id", "track-meta-track-id", "trackId", trackMetaStatus);

setupAlbumSearch();

if (trackMetaForm) {
  document.getElementById("track-meta-reset")?.addEventListener("click", () => {
    trackMetaForm.reset();
    document.getElementById("track-meta-stream").value = "0";
    hideStatus(trackMetaStatus);
    hideJsonPreview(trackMetaPreview);
    const albumSearch = document.getElementById("track-album-search");
    if (albumSearch) albumSearch.value = "";
    document.getElementById("track-album-results")?.classList.add("hidden");
    const albumSelected = document.getElementById("track-album-selected");
    if (albumSelected) {
      albumSelected.classList.add("hidden");
      albumSelected.textContent = "";
    }
  });

  const trackMetaSubmit = document.getElementById("track-meta-submit");
  const trackMetaSpinner = document.getElementById("track-meta-spinner");

  trackMetaForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideStatus(trackMetaStatus);

    const albumId = trackMetaAlbumIdOverride?.value.trim() || "";
    if (!/^[a-fA-F0-9]{24}$/.test(albumId)) {
      showStatus(trackMetaStatus, "error", "Search and select an album first.");
      return;
    }

    const trackId = document.getElementById("track-meta-track-id")?.value.trim() || "";
    if (!/^[a-fA-F0-9]{24}$/.test(trackId)) {
      showStatus(trackMetaStatus, "error", "Enter or generate a _trackId before saving.");
      return;
    }

    const track = {
      _albumId: albumId,
      _trackId: trackId,
      Title: document.getElementById("track-meta-title").value.trim(),
      Artist: document.getElementById("track-meta-artist").value.trim(),
      url: document.getElementById("track-meta-url").value.trim(),
      Duration: document.getElementById("track-meta-duration").value.trim(),
      streamCount: parseInt(document.getElementById("track-meta-stream").value, 10) || 0,
    };

    if (document.getElementById("track-meta-lyrics").checked) track.lyrics = true;
    if (document.getElementById("track-meta-sync").checked) track.sync = true;

    setLoading(trackMetaSubmit, trackMetaSpinner, true);
    showStatus(trackMetaStatus, "info", "Saving track…");

    try {
      const res = await dashboardFetch(API.trackMeta, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(track),
        ...fetchOpts,
      });
      if (!res.ok) throw new Error(await parseErrorResponse(res));

      const data = await res.json();
      const saved = data.track || data;
      showJsonPreview(trackMetaPreview, saved);
      showStatus(trackMetaStatus, "success", data.message || "Track saved.");
    } catch (err) {
      if (shouldIgnoreFetchError(err)) return;
      showStatus(trackMetaStatus, "error", err.message || "Failed to save track.");
    } finally {
      setLoading(trackMetaSubmit, trackMetaSpinner, false);
    }
  });
}

// --- Track upload ---
const trackForm = document.getElementById("track-form");
const trackTitleInput = document.getElementById("track-title");
const trackFileInput = document.getElementById("track-file");
const trackDropzone = document.getElementById("track-dropzone");
const trackFileName = document.getElementById("track-file-name");
const trackSubmit = document.getElementById("track-submit");
const trackSpinner = document.getElementById("track-spinner");
const trackStatus = document.getElementById("track-status");

setupDropzone(trackDropzone, trackFileInput, trackFileName, (file) => {
  if (!file.name.toLowerCase().endsWith(".mp3") && file.type !== "audio/mpeg") {
    showStatus(trackStatus, "error", "Please select an MP3 file.");
    trackFileInput.value = "";
    trackDropzone.classList.remove("has-file");
    trackFileName.textContent = "No file selected";
    return;
  }
  hideStatus(trackStatus);

  if (!trackTitleInput.value.trim()) {
    const guessed = file.name.replace(/\.mp3$/i, "");
    trackTitleInput.value = guessed;
  }
});

trackTitleInput.addEventListener("input", () => {
  const metaTitle = document.getElementById("track-meta-title");
  if (metaTitle && !metaTitle.value.trim()) {
    metaTitle.value = trackTitleInput.value;
  }
  const metaUrl = document.getElementById("track-meta-url");
  if (metaUrl && !metaUrl.value.trim() && trackTitleInput.value.trim()) {
    metaUrl.value = `tracks/${convertTitleForFolder(trackTitleInput.value)}/output.m3u8`;
  }
});

trackForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideStatus(trackStatus);

  const title = trackTitleInput.value.trim();
  const file = trackFileInput.files?.[0];

  if (!title) {
    showStatus(trackStatus, "error", "Track title is required.");
    trackTitleInput.focus();
    return;
  }
  if (!file) {
    showStatus(trackStatus, "error", "Choose an MP3 file to upload.");
    return;
  }

  const formData = new FormData();
  formData.append("track_title", title);
  formData.append("file", file);

  setLoading(trackSubmit, trackSpinner, true);
  showStatus(trackStatus, "info", "Uploading and transcoding — this may take a minute…");

  try {
    const res = await dashboardFetch(API.trackUpload, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(await parseErrorResponse(res));
    }

    const data = await res.json();
    const loc = data.location ? ` Location: ${data.location}` : "";
    showStatus(
      trackStatus,
      "success",
      (data.message || "Track uploaded successfully.") + loc
    );
    trackForm.reset();
    trackDropzone.classList.remove("has-file");
    trackFileName.textContent = "No file selected";
  } catch (err) {
    if (shouldIgnoreFetchError(err)) return;
    showStatus(trackStatus, "error", err.message || "Upload failed.");
  } finally {
    setLoading(trackSubmit, trackSpinner, false);
  }
});

// --- Lyrics upload ---
const lyricsForm = document.getElementById("lyrics-form");
const lyricsFilenameInput = document.getElementById("lyrics-filename");
const lyricsFileInput = document.getElementById("lyrics-file");
const lyricsDropzone = document.getElementById("lyrics-dropzone");
const lyricsFileName = document.getElementById("lyrics-file-name");
const lyricsJsonEditor = document.getElementById("lyrics-json-editor");
const lyricsSubmit = document.getElementById("lyrics-submit");
const lyricsSpinner = document.getElementById("lyrics-spinner");
const lyricsStatus = document.getElementById("lyrics-status");
const lyricsModeTabs = document.querySelectorAll("[data-lyrics-mode]");
const lyricsModePanels = {
  editor: document.getElementById("lyrics-mode-editor"),
  file: document.getElementById("lyrics-mode-file"),
};

function getLyricsUploadMode() {
  return document.querySelector(".lyrics-mode-tab.active")?.dataset.lyricsMode || "editor";
}

function setLyricsUploadMode(mode) {
  lyricsModeTabs.forEach((tab) => {
    const active = tab.dataset.lyricsMode === mode;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", active ? "true" : "false");
  });
  Object.entries(lyricsModePanels).forEach(([key, panel]) => {
    if (!panel) return;
    panel.classList.toggle("active", key === mode);
    panel.classList.toggle("hidden", key !== mode);
  });
}

lyricsModeTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setLyricsUploadMode(tab.dataset.lyricsMode);
    hideStatus(lyricsStatus);
  });
});

function parseLyricsJson(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Paste lyrics JSON before uploading.");
  }

  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch (err) {
    throw new Error(`Invalid JSON: ${err.message}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Lyrics JSON must be an array.");
  }

  return parsed;
}

function formatLyricsJson(text) {
  const parsed = parseLyricsJson(text);
  return JSON.stringify(parsed, null, 2);
}

function normalizeLyricsFilename(raw) {
  const filename = raw.trim();
  if (!filename) {
    throw new Error("Filename is required.");
  }
  return filename;
}

function createLyricsJsonFile(jsonText, filename) {
  return new File([jsonText], filename, { type: "application/json" });
}

async function postLyricsUpload(file, filename) {
  const formData = new FormData();
  formData.append("filename", filename);
  formData.append("file", file);

  const res = await dashboardFetch(API.lyrics, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  return res.json();
}

function resetLyricsFileUpload() {
  lyricsFileInput.value = "";
  lyricsDropzone.classList.remove("has-file");
  lyricsFileName.textContent = "No file selected";
}

function resetLyricsEditorUpload() {
  if (lyricsJsonEditor) lyricsJsonEditor.value = "";
}

lyricsFilenameInput.addEventListener("input", () => {
  lyricsFilenameInput.dataset.auto = "false";
});

document.getElementById("lyrics-beautify")?.addEventListener("click", () => {
  hideStatus(lyricsStatus);

  try {
    const formatted = formatLyricsJson(lyricsJsonEditor.value);
    lyricsJsonEditor.value = formatted;
    showStatus(lyricsStatus, "success", "Valid JSON — formatted.");
  } catch (err) {
    showStatus(lyricsStatus, "error", err.message || "Invalid JSON.");
    lyricsJsonEditor.focus();
  }
});

setupDropzone(lyricsDropzone, lyricsFileInput, lyricsFileName, (file) => {
  const isJson =
    file.type === "application/json" ||
    file.name.toLowerCase().endsWith(".json");
  if (!isJson) {
    showStatus(lyricsStatus, "error", "Please select a JSON file.");
    lyricsFileInput.value = "";
    lyricsDropzone.classList.remove("has-file");
    lyricsFileName.textContent = "No file selected";
    return;
  }
  hideStatus(lyricsStatus);

  if (!lyricsFilenameInput.value.trim() || lyricsFilenameInput.dataset.auto === "true") {
    lyricsFilenameInput.value = file.name;
    lyricsFilenameInput.dataset.auto = "true";
  }
});

lyricsForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideStatus(lyricsStatus);

  let filename;
  try {
    filename = normalizeLyricsFilename(lyricsFilenameInput.value);
    lyricsFilenameInput.value = filename;
  } catch (err) {
    showStatus(lyricsStatus, "error", err.message);
    lyricsFilenameInput.focus();
    return;
  }

  const mode = getLyricsUploadMode();
  let uploadFile = null;

  try {
    if (mode === "editor") {
      const jsonText = formatLyricsJson(lyricsJsonEditor.value);
      lyricsJsonEditor.value = jsonText;
      uploadFile = createLyricsJsonFile(jsonText, filename);
    } else {
      uploadFile = lyricsFileInput.files?.[0];
      if (!uploadFile) {
        showStatus(lyricsStatus, "error", "Choose a JSON lyrics file.");
        return;
      }
    }

    setLoading(lyricsSubmit, lyricsSpinner, true);

    const data = await postLyricsUpload(uploadFile, filename);
    uploadFile = null;

    showStatus(
      lyricsStatus,
      "success",
      `Lyrics uploaded.${data.key ? ` Key: ${data.key}` : ""}`
    );

    if (mode === "editor") {
      resetLyricsEditorUpload();
    } else {
      resetLyricsFileUpload();
    }
  } catch (err) {
    if (shouldIgnoreFetchError(err)) return;
    showStatus(lyricsStatus, "error", err.message || "Upload failed.");
    if (mode === "editor") {
      lyricsJsonEditor.focus();
    }
  } finally {
    uploadFile = null;
    setLoading(lyricsSubmit, lyricsSpinner, false);
  }
});

// --- Edit tab ---

function hideEditPanels() {
  document.getElementById("edit-album-section")?.classList.add("hidden");
  document.getElementById("edit-track-section")?.classList.add("hidden");
  document.querySelectorAll(".edit-result-option.selected").forEach((el) => {
    el.classList.remove("selected");
  });
}

function renderEditResultList(listEl, items, emptyMessage, renderItem, onSelect) {
  if (!listEl) return;
  listEl.innerHTML = "";

  if (!items.length) {
    const li = document.createElement("li");
    li.className = "edit-result-empty";
    li.textContent = emptyMessage;
    listEl.appendChild(li);
    return;
  }

  for (const item of items) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "edit-result-option";
    btn.setAttribute("role", "option");
    btn.innerHTML = renderItem(item);
    btn.addEventListener("click", () => {
      listEl.querySelectorAll(".edit-result-option").forEach((el) => el.classList.remove("selected"));
      btn.classList.add("selected");
      onSelect(item);
    });
    li.appendChild(btn);
    listEl.appendChild(li);
  }
}

function setupEditSearch() {
  const searchInput = document.getElementById("edit-search");
  const resultsWrap = document.getElementById("edit-search-results");
  const albumResults = document.getElementById("edit-album-results");
  const trackResults = document.getElementById("edit-track-results");
  if (!searchInput || !resultsWrap) return;

  let debounceTimer = null;
  let activeController = null;

  const runSearch = async (q) => {
    if (activeController) activeController.abort();
    activeController = new AbortController();

    try {
      const res = await dashboardFetch(`${API.search}?q=${encodeURIComponent(q)}`, {
        ...fetchOpts,
        signal: activeController.signal,
      });
      if (!res.ok) throw new Error(await parseErrorResponse(res));
      const data = await res.json();
      const albums = Array.isArray(data.albums) ? data.albums : [];
      const tracks = Array.isArray(data.tracks) ? data.tracks : [];

      renderEditResultList(
        albumResults,
        albums,
        "No albums match.",
        (a) => `${a.Album}<span class="edit-result-option-meta">${a.AlbumArtist} · ${a.Type} · ${a.Year}</span>`,
        (a) => loadAlbumForEdit(a._albumId)
      );

      renderEditResultList(
        trackResults,
        tracks,
        "No tracks match.",
        (t) => `${t.Title}<span class="edit-result-option-meta">${t.Artist}${t.albumName ? ` · ${t.albumName}` : ""} · ${t.Duration || ""}</span>`,
        (t) => loadTrackForEdit(t._trackId)
      );

      resultsWrap.classList.remove("hidden");
    } catch (err) {
      if (shouldIgnoreFetchError(err)) return;
      renderEditResultList(albumResults, [], err.message || "Search failed.", () => "", () => {});
      renderEditResultList(trackResults, [], "", () => "", () => {});
      resultsWrap.classList.remove("hidden");
    }
  };

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim();
    hideEditPanels();

    if (debounceTimer) clearTimeout(debounceTimer);

    if (!q) {
      resultsWrap.classList.add("hidden");
      albumResults.innerHTML = "";
      trackResults.innerHTML = "";
      return;
    }

    debounceTimer = setTimeout(() => runSearch(q), 300);
  });
}

async function loadAlbumForEdit(albumId) {
  const section = document.getElementById("edit-album-section");
  const statusEl = document.getElementById("edit-album-status");
  const previewEl = document.getElementById("edit-album-preview");
  hideStatus(statusEl);
  hideJsonPreview(previewEl);
  document.getElementById("edit-track-section")?.classList.add("hidden");

  try {
    const res = await dashboardFetch(`${API.albumDetails}?albumId=${encodeURIComponent(albumId)}`, fetchOpts);
    if (!res.ok) throw new Error(await parseErrorResponse(res));
    const data = await res.json();
    const album = data.album || data;

    document.getElementById("edit-album-id").value = album._albumId || "";
    document.getElementById("edit-album-name").value = album.Album || "";
    document.getElementById("edit-album-artist").value = album.AlbumArtist || "";
    document.getElementById("edit-album-year").value = album.Year || "";
    document.getElementById("edit-album-type").value = album.Type || "Album";
    document.getElementById("edit-album-color").value = album.Color || "";
    document.getElementById("edit-album-release").value = (album.releaseDate || "").slice(0, 10);
    document.getElementById("edit-album-added-date").value =
      (album.addedDate || "").slice(0, 10) || todayDateString();
    document.getElementById("edit-album-light").value = album.LightColor || "";
    document.getElementById("edit-album-dark").value = album.DarkColor || "";
    document.getElementById("edit-album-thumbnail").value = album.Thumbnail || "";

    section?.classList.remove("hidden");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    if (shouldIgnoreFetchError(err)) return;
    showStatus(statusEl, "error", err.message || "Failed to load album.");
    section?.classList.remove("hidden");
  }
}

async function loadTrackForEdit(trackId) {
  const section = document.getElementById("edit-track-section");
  const statusEl = document.getElementById("edit-track-status");
  const previewEl = document.getElementById("edit-track-preview");
  hideStatus(statusEl);
  hideJsonPreview(previewEl);
  document.getElementById("edit-album-section")?.classList.add("hidden");

  try {
    const res = await dashboardFetch(`${API.trackDetails}?trackId=${encodeURIComponent(trackId)}`, fetchOpts);
    if (!res.ok) throw new Error(await parseErrorResponse(res));
    const data = await res.json();
    const track = data.track || data;

    document.getElementById("edit-track-id").value = track._trackId || "";
    document.getElementById("edit-track-album-id").value = track._albumId || "";
    document.getElementById("edit-track-title").value = track.Title || "";
    document.getElementById("edit-track-artist").value = track.Artist || "";
    document.getElementById("edit-track-url").value = track.url || "";
    document.getElementById("edit-track-duration").value = track.Duration || "";
    document.getElementById("edit-track-lyrics").checked = !!track.lyrics;
    document.getElementById("edit-track-sync").checked = !!track.sync;
    document.getElementById("edit-track-stream").value = String(track.streamCount ?? 0);

    section?.classList.remove("hidden");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    if (shouldIgnoreFetchError(err)) return;
    showStatus(statusEl, "error", err.message || "Failed to load track.");
    section?.classList.remove("hidden");
  }
}

setupEditSearch();

const editAlbumForm = document.getElementById("edit-album-form");
const editAlbumStatus = document.getElementById("edit-album-status");
const editAlbumPreview = document.getElementById("edit-album-preview");
const editAlbumSubmit = document.getElementById("edit-album-submit");
const editAlbumSpinner = document.getElementById("edit-album-spinner");

document.getElementById("edit-album-cancel")?.addEventListener("click", () => {
  document.getElementById("edit-album-section")?.classList.add("hidden");
  hideStatus(editAlbumStatus);
  hideJsonPreview(editAlbumPreview);
});

if (editAlbumForm) {
  editAlbumForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideStatus(editAlbumStatus);

    const releaseDate = document.getElementById("edit-album-release")?.value || "";
    if (!releaseDate) {
      showStatus(editAlbumStatus, "error", "Release date is required.");
      return;
    }

    const addedDate = getAlbumAddedDate("edit-album-added-date");

    const albumId = document.getElementById("edit-album-id")?.value.trim() || "";
    if (!/^[a-fA-F0-9]{24}$/.test(albumId)) {
      showStatus(editAlbumStatus, "error", "Invalid _albumId.");
      return;
    }

    const album = {
      _albumId: albumId,
      Album: document.getElementById("edit-album-name").value.trim(),
      AlbumArtist: document.getElementById("edit-album-artist").value.trim(),
      Year: document.getElementById("edit-album-year").value.trim(),
      Color: document.getElementById("edit-album-color").value.trim(),
      releaseDate,
      addedDate,
      Thumbnail: document.getElementById("edit-album-thumbnail").value.trim(),
      Type: document.getElementById("edit-album-type").value,
    };

    const light = document.getElementById("edit-album-light").value.trim();
    const dark = document.getElementById("edit-album-dark").value.trim();
    if (light) album.LightColor = light;
    if (dark) album.DarkColor = dark;

    setLoading(editAlbumSubmit, editAlbumSpinner, true);
    showStatus(editAlbumStatus, "info", "Saving album…");

    try {
      const res = await dashboardFetch(API.album, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(album),
        ...fetchOpts,
      });
      if (!res.ok) throw new Error(await parseErrorResponse(res));

      const data = await res.json();
      showJsonPreview(editAlbumPreview, data.album || data);
      showStatus(editAlbumStatus, "success", data.message || "Album updated.");
    } catch (err) {
      if (shouldIgnoreFetchError(err)) return;
      showStatus(editAlbumStatus, "error", err.message || "Failed to update album.");
    } finally {
      setLoading(editAlbumSubmit, editAlbumSpinner, false);
    }
  });
}

const editTrackForm = document.getElementById("edit-track-form");
const editTrackStatus = document.getElementById("edit-track-status");
const editTrackPreview = document.getElementById("edit-track-preview");
const editTrackSubmit = document.getElementById("edit-track-submit");
const editTrackSpinner = document.getElementById("edit-track-spinner");

document.getElementById("edit-track-cancel")?.addEventListener("click", () => {
  document.getElementById("edit-track-section")?.classList.add("hidden");
  hideStatus(editTrackStatus);
  hideJsonPreview(editTrackPreview);
});

if (editTrackForm) {
  editTrackForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideStatus(editTrackStatus);

    const albumId = document.getElementById("edit-track-album-id")?.value.trim() || "";
    const trackId = document.getElementById("edit-track-id")?.value.trim() || "";

    if (!/^[a-fA-F0-9]{24}$/.test(albumId)) {
      showStatus(editTrackStatus, "error", "Valid _albumId is required.");
      return;
    }
    if (!/^[a-fA-F0-9]{24}$/.test(trackId)) {
      showStatus(editTrackStatus, "error", "Valid _trackId is required.");
      return;
    }

    const track = {
      _albumId: albumId,
      _trackId: trackId,
      Title: document.getElementById("edit-track-title").value.trim(),
      Artist: document.getElementById("edit-track-artist").value.trim(),
      url: document.getElementById("edit-track-url").value.trim(),
      Duration: document.getElementById("edit-track-duration").value.trim(),
      streamCount: parseInt(document.getElementById("edit-track-stream").value, 10) || 0,
    };

    if (document.getElementById("edit-track-lyrics").checked) track.lyrics = true;
    if (document.getElementById("edit-track-sync").checked) track.sync = true;

    setLoading(editTrackSubmit, editTrackSpinner, true);
    showStatus(editTrackStatus, "info", "Saving track…");

    try {
      const res = await dashboardFetch(API.trackMeta, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(track),
        ...fetchOpts,
      });
      if (!res.ok) throw new Error(await parseErrorResponse(res));

      const data = await res.json();
      showJsonPreview(editTrackPreview, data.track || data);
      showStatus(editTrackStatus, "success", data.message || "Track updated.");
    } catch (err) {
      if (shouldIgnoreFetchError(err)) return;
      showStatus(editTrackStatus, "error", err.message || "Failed to update track.");
    } finally {
      setLoading(editTrackSubmit, editTrackSpinner, false);
    }
  });
}

// --- Users tab ---

function setupUserSearch() {
  const searchInput = document.getElementById("user-search");
  const resultsEl = document.getElementById("user-search-results");
  if (!searchInput || !resultsEl) return;

  let debounceTimer = null;
  let activeController = null;

  const runSearch = async (q) => {
    if (activeController) activeController.abort();
    activeController = new AbortController();

    try {
      const res = await dashboardFetch(`${API.usersSearch}?q=${encodeURIComponent(q)}`, {
        ...fetchOpts,
        signal: activeController.signal,
      });
      if (!res.ok) throw new Error(await parseErrorResponse(res));
      const data = await res.json();
      const users = Array.isArray(data.users) ? data.users : [];

      renderEditResultList(
        resultsEl,
        users,
        "No users match.",
        (u) => {
          const label = u.username || u.name || u.email;
          const meta = [u.email, u.username ? `@${u.username}` : "", u.status, u.accessType]
            .filter(Boolean)
            .join(" · ");
          return `${label}<span class="edit-result-option-meta">${meta}</span>`;
        },
        (u) => loadUserForEdit(u._id)
      );

      resultsEl.classList.remove("hidden");
    } catch (err) {
      if (shouldIgnoreFetchError(err)) return;
      renderEditResultList(resultsEl, [], err.message || "Search failed.", () => "", () => {});
      resultsEl.classList.remove("hidden");
    }
  };

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim();
    document.getElementById("edit-user-section")?.classList.add("hidden");

    if (debounceTimer) clearTimeout(debounceTimer);

    if (!q) {
      resultsEl.classList.add("hidden");
      resultsEl.innerHTML = "";
      return;
    }

    debounceTimer = setTimeout(() => runSearch(q), 300);
  });
}

const KOLKATA_TZ = "Asia/Kolkata";

function formatTimeLimitKolkata(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  const formatted = new Intl.DateTimeFormat("en-IN", {
    timeZone: KOLKATA_TZ,
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);

  return `${formatted} IST`;
}

function setUserTimeLimitDisplay(user) {
  const input = document.getElementById("edit-user-access-timelimit");
  if (!input) return;
  console.log("timelimit", user.accountAccess?.timeLimit);
  input.value = formatTimeLimitKolkata(user.accountAccess?.timeLimit);
}

function formatUserMeta(user) {
  const lines = [
    `username: ${user.username || "—"}`,
    `status: ${user.status || "—"}`,
    `email: ${user.email?.id || user.googleAccount?.email || "—"}`,
    `email.verificationStatus: ${user.email?.verificationStatus || "—"}`,
    `google: ${user.googleAccount?.name || "—"} · ${user.googleAccount?.email || "—"}`,
    `loggedIn: ${user.loggedIn || "—"}`,
    `accountAccess.type: ${user.accountAccess?.type || "—"}`,
    `hasPassword: ${user.hasPassword ? "yes" : "no"}`,
  ];
  if (user.installedVersion) {
    lines.push(
      `installedVersion: ${user.installedVersion.versionName} (${user.installedVersion.versionCode})`
    );
  }
  return lines.map((line) => `<p>${line}</p>`).join("");
}

function parseJsonField(raw, fieldName) {
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON in ${fieldName}.`);
  }
}

let editUserActiveSessions = [];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderActiveSessionsList(sessions) {
  const listEl = document.getElementById("edit-user-active-sessions-list");
  const emptyEl = document.getElementById("edit-user-active-sessions-empty");
  if (!listEl) return;

  editUserActiveSessions = (sessions || []).map((session) => ({
    seen: !!session.seen,
    device: session.device ?? null,
    sessionId: session.sessionId || "",
    lastUsed: session.lastUsed || "",
  }));

  listEl.innerHTML = "";

  if (!editUserActiveSessions.length) {
    emptyEl?.classList.remove("hidden");
    return;
  }

  emptyEl?.classList.add("hidden");

  editUserActiveSessions.forEach((session, index) => {
    const li = document.createElement("li");
    li.className = "session-card";
    li.innerHTML = `
      <div class="session-card-header">
        <h4 class="session-card-title">Session ${index + 1}</h4>
        <button type="button" class="btn-icon-danger" data-session-remove="${index}" aria-label="Remove session ${index + 1}">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
      <div class="session-card-body">
        <label class="session-seen-field">
          <input type="checkbox" data-session-seen="${index}" ${session.seen ? "checked" : ""} />
          <span>seen</span>
        </label>
        <div class="session-field">
          <span class="session-field-label">device</span>
          <span class="session-field-value">${escapeHtml(session.device || "—")}</span>
        </div>
        <div class="session-field session-field--full">
          <span class="session-field-label">sessionId</span>
          <span class="session-field-value session-field-value--mono">${escapeHtml(session.sessionId || "—")}</span>
        </div>
        <div class="session-field session-field--full">
          <span class="session-field-label">lastUsed</span>
          <span class="session-field-value session-field-value--mono">${escapeHtml(session.lastUsed || "—")}</span>
        </div>
      </div>
    `;
    listEl.appendChild(li);
  });

  listEl.querySelectorAll("[data-session-seen]").forEach((input) => {
    input.addEventListener("change", (e) => {
      const idx = Number(e.target.dataset.sessionSeen);
      if (Number.isNaN(idx) || !editUserActiveSessions[idx]) return;
      editUserActiveSessions[idx].seen = e.target.checked;
    });
  });

  listEl.querySelectorAll("[data-session-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.sessionRemove);
      if (Number.isNaN(idx)) return;
      editUserActiveSessions.splice(idx, 1);
      renderActiveSessionsList(editUserActiveSessions);
    });
  });
}

function getActiveSessionsPayload() {
  return editUserActiveSessions.map((session) => ({
    seen: !!session.seen,
    device: session.device,
    sessionId: session.sessionId,
    lastUsed: session.lastUsed,
  }));
}

async function loadUserForEdit(userId) {
  const section = document.getElementById("edit-user-section");
  const statusEl = document.getElementById("edit-user-status");
  const previewEl = document.getElementById("edit-user-preview");
  const metaEl = document.getElementById("edit-user-meta");
  hideStatus(statusEl);
  hideJsonPreview(previewEl);

  try {
    const res = await dashboardFetch(`${API.userDetails}?userId=${encodeURIComponent(userId)}`, fetchOpts);
    if (!res.ok) throw new Error(await parseErrorResponse(res));
    const data = await res.json();
    const user = data.user || data;

    document.getElementById("edit-user-id").value = user._id || "";
    document.getElementById("edit-user-access-duration").value = String(user.accountAccess?.duration ?? 0);
    document.getElementById("edit-user-recently-played").value = JSON.stringify(user.recentlyPlayed || [], null, 2);
    renderActiveSessionsList(user.activeSessions || []);
    setUserTimeLimitDisplay(user);
    if (metaEl) metaEl.innerHTML = formatUserMeta(user);

    section?.classList.remove("hidden");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    if (shouldIgnoreFetchError(err)) return;
    showStatus(statusEl, "error", err.message || "Failed to load user.");
    section?.classList.remove("hidden");
  }
}

setupUserSearch();

const editUserForm = document.getElementById("edit-user-form");
const editUserStatus = document.getElementById("edit-user-status");
const editUserPreview = document.getElementById("edit-user-preview");
const editUserSubmit = document.getElementById("edit-user-submit");
const editUserSpinner = document.getElementById("edit-user-spinner");

document.getElementById("edit-user-cancel")?.addEventListener("click", () => {
  document.getElementById("edit-user-section")?.classList.add("hidden");
  hideStatus(editUserStatus);
  hideJsonPreview(editUserPreview);
});

if (editUserForm) {
  editUserForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideStatus(editUserStatus);

    const userId = document.getElementById("edit-user-id")?.value.trim() || "";
    if (!/^[a-fA-F0-9]{24}$/.test(userId)) {
      showStatus(editUserStatus, "error", "Invalid user _id.");
      return;
    }

    let recentlyPlayed;

    try {
      recentlyPlayed = parseJsonField(
        document.getElementById("edit-user-recently-played").value,
        "recentlyPlayed"
      );
    } catch (err) {
      showStatus(editUserStatus, "error", err.message);
      return;
    }

    const payload = {
      _id: userId,
      accountAccess: {
        duration: parseInt(document.getElementById("edit-user-access-duration").value, 10) || 0,
      },
      recentlyPlayed,
      activeSessions: getActiveSessionsPayload(),
    };

    setLoading(editUserSubmit, editUserSpinner, true);
    showStatus(editUserStatus, "info", "Saving user…");

    try {
      const res = await dashboardFetch(API.user, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        ...fetchOpts,
      });
      if (!res.ok) throw new Error(await parseErrorResponse(res));

      const data = await res.json();
      const saved = data.user || data;
      showJsonPreview(editUserPreview, saved);
      document.getElementById("edit-user-recently-played").value = JSON.stringify(saved.recentlyPlayed || [], null, 2);
      renderActiveSessionsList(saved.activeSessions || []);
      setUserTimeLimitDisplay(saved);
      const metaEl = document.getElementById("edit-user-meta");
      if (metaEl) metaEl.innerHTML = formatUserMeta(saved);
      showStatus(editUserStatus, "success", data.message || "User updated.");
    } catch (err) {
      if (shouldIgnoreFetchError(err)) return;
      showStatus(editUserStatus, "error", err.message || "Failed to update user.");
    } finally {
      setLoading(editUserSubmit, editUserSpinner, false);
    }
  });
}

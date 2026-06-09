/**
 * Upload dashboard — calls POST /track and POST /lyrics.
 * Auth: session cookie (dashboard_jwt) sent via credentials: 'include'.
 */

const API = {
  albums: "/dashboard/api/albums",
  album: "/dashboard/api/album",
  trackMeta: "/dashboard/api/track",
  objectId: {
    albumId: "/dashboard/api/object-id/albumId",
    trackId: "/dashboard/api/object-id/trackId",
  },
  trackUpload: "/dashboard/track",
  lyrics: "/dashboard/lyrics",
};

const fetchOpts = { credentials: "include" };

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

function suggestLyricsFilename(trackTitle) {
  const base = convertTitleForFolder(trackTitle.trim());
  if (!base) return "";
  return base.endsWith(".json") ? base : `${base}.json`;
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

// --- Metadata forms (schema.ts → proxied /dashboard/api/*) ---

async function fetchObjectId(kind) {
  const url = API.objectId[kind];
  const res = await fetch(url, { ...fetchOpts });
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
      const albums = await fetch(
        `${API.albums}?q=${encodeURIComponent(q)}`,
        { ...fetchOpts, signal: activeController.signal }
      ).then(async (res) => {
        if (!res.ok) throw new Error(await parseErrorResponse(res));
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      });
      renderResults(albums, "No albums match your search.");
    } catch (err) {
      if (err.name === "AbortError") return;
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
      const res = await fetch(API.album, {
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
      const res = await fetch(API.trackMeta, {
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
    syncLyricsFilename();
  }
});

trackTitleInput.addEventListener("input", () => {
  syncLyricsFilename();
  const metaTitle = document.getElementById("track-meta-title");
  if (metaTitle && !metaTitle.value.trim()) {
    metaTitle.value = trackTitleInput.value;
  }
  const metaUrl = document.getElementById("track-meta-url");
  if (metaUrl && !metaUrl.value.trim() && trackTitleInput.value.trim()) {
    metaUrl.value = `tracks/${convertTitleForFolder(trackTitleInput.value)}/output.m3u8`;
  }
});

function syncLyricsFilename() {
  const lyricsFilename = document.getElementById("lyrics-filename");
  if (!lyricsFilename.value.trim() || lyricsFilename.dataset.auto === "true") {
    const suggested = suggestLyricsFilename(trackTitleInput.value);
    if (suggested) {
      lyricsFilename.value = suggested;
      lyricsFilename.dataset.auto = "true";
    }
  }
}

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
    const res = await fetch(API.trackUpload, {
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
const lyricsSubmit = document.getElementById("lyrics-submit");
const lyricsSpinner = document.getElementById("lyrics-spinner");
const lyricsStatus = document.getElementById("lyrics-status");

lyricsFilenameInput.addEventListener("input", () => {
  lyricsFilenameInput.dataset.auto = "false";
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
    let name = file.name;
    if (!name.toLowerCase().endsWith(".json")) name += ".json";
    lyricsFilenameInput.value = name;
    lyricsFilenameInput.dataset.auto = "true";
  }
});

lyricsForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideStatus(lyricsStatus);

  let filename = lyricsFilenameInput.value.trim();
  const file = lyricsFileInput.files?.[0];

  if (!filename) {
    showStatus(lyricsStatus, "error", "Filename is required.");
    lyricsFilenameInput.focus();
    return;
  }
  if (!filename.toLowerCase().endsWith(".json")) {
    filename += ".json";
    lyricsFilenameInput.value = filename;
  }
  if (!file) {
    showStatus(lyricsStatus, "error", "Choose a JSON lyrics file.");
    return;
  }

  const formData = new FormData();
  formData.append("filename", filename);
  formData.append("file", file);

  setLoading(lyricsSubmit, lyricsSpinner, true);

  try {
    const res = await fetch(API.lyrics, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(await parseErrorResponse(res));
    }

    const data = await res.json();
    showStatus(
      lyricsStatus,
      "success",
      `Lyrics uploaded.${data.key ? ` Key: ${data.key}` : ""}`
    );
    lyricsFileInput.value = "";
    lyricsDropzone.classList.remove("has-file");
    lyricsFileName.textContent = "No file selected";
  } catch (err) {
    showStatus(lyricsStatus, "error", err.message || "Upload failed.");
  } finally {
    setLoading(lyricsSubmit, lyricsSpinner, false);
  }
});

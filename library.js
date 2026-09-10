const PAGE_SIZE = 18;

const elements = {
  search: document.querySelector("#library-search"),
  issuer: document.querySelector("#library-category"),
  sort: document.querySelector("#library-sort"),
  list: document.querySelector("#document-list"),
  total: document.querySelector("#document-total"),
  status: document.querySelector("#library-status"),
  empty: document.querySelector("#library-empty"),
  emptyLabel: document.querySelector("#empty-label"),
  emptyTitle: document.querySelector("#empty-title"),
  emptyCopy: document.querySelector("#empty-copy"),
  clear: document.querySelector("#clear-filters"),
  pagination: document.querySelector("#library-pagination"),
  previous: document.querySelector("#previous-page"),
  next: document.querySelector("#next-page"),
  pageStatus: document.querySelector("#page-status"),
};

let credentials = [];
let currentPage = 1;

const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#039;",
  '"': "&quot;",
})[character]);

const safeUrl = (value) => {
  const url = String(value || "").trim();
  return /^(https:\/\/|assets\/pdfs\/)[^\s]+$/i.test(url) ? url : "";
};

const normaliseCredential = (credential, index) => ({
  id: String(credential.id || `credential-${index + 1}`).replace(/[^a-z0-9_-]/gi, "-"),
  title: String(credential.title || "Untitled credential"),
  description: String(credential.description || "Certificate of achievement"),
  issuer: String(credential.issuer || "Issuer not listed"),
  type: String(credential.type || "Certificate"),
  issued: String(credential.issued || credential.year || ""),
  year: Number(credential.year) || new Date().getFullYear(),
  credentialId: String(credential.credentialId || ""),
  file: safeUrl(credential.file),
  verificationUrl: safeUrl(credential.verificationUrl),
  featured: Boolean(credential.featured),
});

const makeCredentialCard = (credential, index) => {
  const number = String(index + 1).padStart(3, "0");
  const metadata = [credential.issued && `Issued ${credential.issued}`, credential.credentialId && `ID ${credential.credentialId}`].filter(Boolean);
  const verificationLink = credential.verificationUrl
    ? `<a href="${escapeHtml(credential.verificationUrl)}" target="_blank" rel="noreferrer">Verify <span aria-hidden="true">↗</span></a>`
    : "";

  return `
    <article class="document-card${credential.featured ? " is-featured" : ""}" id="${escapeHtml(credential.id)}">
      <div class="document-number" aria-hidden="true">${number}</div>
      <div class="document-icon" aria-hidden="true"><span>CERT</span></div>
      <div class="document-copy">
        <p class="document-category">${escapeHtml(credential.type)}${credential.featured ? " / Featured" : ""}</p>
        <h2>${escapeHtml(credential.title)}</h2>
        <p class="credential-issuer">Issued by <strong>${escapeHtml(credential.issuer)}</strong></p>
        <p>${escapeHtml(credential.description)}</p>
        <p class="document-meta">${metadata.map(escapeHtml).join(" <span aria-hidden=\"true\">·</span> ")}</p>
      </div>
      <div class="document-actions">
        <a href="${escapeHtml(credential.file)}" target="_blank" rel="noreferrer">View PDF <span aria-hidden="true">↗</span></a>
        ${verificationLink}
        <a class="download-button" href="${escapeHtml(credential.file)}" download>Download <span aria-hidden="true">↓</span></a>
      </div>
    </article>`;
};

const getFilteredCredentials = () => {
  const query = elements.search.value.trim().toLocaleLowerCase();
  const issuer = elements.issuer.value;
  const sort = elements.sort.value;

  const filtered = credentials.filter((credential) => {
    const searchableText = `${credential.title} ${credential.description} ${credential.issuer} ${credential.type} ${credential.credentialId}`.toLocaleLowerCase();
    return (!query || searchableText.includes(query)) && (issuer === "all" || credential.issuer === issuer);
  });

  return filtered.sort((a, b) => {
    if (sort === "oldest") return a.year - b.year || a.title.localeCompare(b.title);
    if (sort === "title") return a.title.localeCompare(b.title);
    return b.year - a.year || Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title);
  });
};

const focusLinkedCredential = () => {
  if (!window.location.hash) return;
  const linkedCredential = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
  if (!linkedCredential) return;
  linkedCredential.classList.add("is-linked");
  linkedCredential.scrollIntoView({ block: "center" });
  linkedCredential.setAttribute("tabindex", "-1");
  linkedCredential.focus({ preventScroll: true });
};

const render = () => {
  const filtered = getFilteredCredentials();
  const filtersActive = Boolean(elements.search.value.trim()) || elements.issuer.value !== "all";
  const linkedId = decodeURIComponent(window.location.hash.slice(1));
  const linkedIndex = filtersActive ? -1 : filtered.findIndex((credential) => credential.id === linkedId);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (linkedIndex >= 0) currentPage = Math.floor(linkedIndex / PAGE_SIZE) + 1;
  currentPage = Math.min(currentPage, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageCredentials = filtered.slice(start, start + PAGE_SIZE);

  elements.list.innerHTML = pageCredentials.map((credential, index) => makeCredentialCard(credential, start + index)).join("");
  elements.list.hidden = pageCredentials.length === 0;
  elements.clear.hidden = !filtersActive;
  elements.status.textContent = `${filtered.length} ${filtered.length === 1 ? "credential" : "credentials"}${filtersActive ? " found" : " published"}`;

  if (pageCredentials.length === 0) {
    elements.empty.hidden = false;
    if (credentials.length === 0) {
      elements.emptyLabel.textContent = "Archive ready";
      elements.emptyTitle.textContent = "Certificates are being prepared.";
      elements.emptyCopy.textContent = "Verified credentials will appear here as soon as they are published.";
    } else {
      elements.emptyLabel.textContent = "No matches";
      elements.emptyTitle.textContent = "No credentials match those filters.";
      elements.emptyCopy.textContent = "Try a different search term or clear the filters to see every credential.";
    }
  } else {
    elements.empty.hidden = true;
  }

  elements.pagination.hidden = filtered.length <= PAGE_SIZE;
  elements.pageStatus.textContent = `Page ${currentPage} of ${pageCount}`;
  elements.previous.disabled = currentPage === 1;
  elements.next.disabled = currentPage === pageCount;
  focusLinkedCredential();
};

const loadCredentials = async () => {
  try {
    const response = await fetch("assets/pdfs/library.json");
    if (!response.ok) throw new Error("The credential catalog could not be loaded.");
    const data = await response.json();
    credentials = (Array.isArray(data) ? data : data.credentials || data.documents || [])
      .map(normaliseCredential)
      .filter((credential) => credential.file);

    elements.total.textContent = String(credentials.length);
    const issuers = [...new Set(credentials.map((credential) => credential.issuer))].sort((a, b) => a.localeCompare(b));
    elements.issuer.insertAdjacentHTML("beforeend", issuers.map((issuer) => `<option value="${escapeHtml(issuer)}">${escapeHtml(issuer)}</option>`).join(""));
    render();
  } catch (error) {
    elements.status.textContent = "The credential archive is temporarily unavailable.";
    elements.empty.hidden = false;
    elements.emptyLabel.textContent = "Load error";
    elements.emptyTitle.textContent = "The certificates could not be opened.";
    elements.emptyCopy.textContent = "Please refresh the page or try again later.";
  }
};

[elements.search, elements.issuer, elements.sort].forEach((control) => {
  control.addEventListener("input", () => {
    currentPage = 1;
    render();
  });
});

elements.clear.addEventListener("click", () => {
  elements.search.value = "";
  elements.issuer.value = "all";
  currentPage = 1;
  render();
  elements.search.focus();
});

elements.previous.addEventListener("click", () => {
  currentPage -= 1;
  render();
  document.querySelector(".library-browser").scrollIntoView({ behavior: "smooth" });
});

elements.next.addEventListener("click", () => {
  currentPage += 1;
  render();
  document.querySelector(".library-browser").scrollIntoView({ behavior: "smooth" });
});

window.addEventListener("hashchange", focusLinkedCredential);
loadCredentials();

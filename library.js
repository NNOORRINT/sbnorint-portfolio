const PAGE_SIZE = 18;

const elements = {
  search: document.querySelector("#library-search"),
  category: document.querySelector("#library-category"),
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

let documents = [];
let currentPage = 1;

const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#039;",
  '"': "&quot;",
})[character]);

const normaliseDocument = (document, index) => ({
  id: String(document.id || `pdf-${index + 1}`),
  title: String(document.title || "Untitled document"),
  description: String(document.description || "PDF document"),
  category: String(document.category || "Other"),
  year: Number(document.year) || new Date().getFullYear(),
  pages: document.pages ? String(document.pages) : "",
  size: document.size ? String(document.size) : "",
  file: String(document.file || ""),
  featured: Boolean(document.featured),
});

const makeDocumentCard = (document, index) => {
  const number = String(index + 1).padStart(3, "0");
  const metadata = [document.year, document.pages && `${document.pages} pages`, document.size].filter(Boolean);
  const safeFile = escapeHtml(document.file);

  return `
    <article class="document-card${document.featured ? " is-featured" : ""}">
      <div class="document-number" aria-hidden="true">${number}</div>
      <div class="document-icon" aria-hidden="true"><span>PDF</span></div>
      <div class="document-copy">
        <p class="document-category">${escapeHtml(document.category)}${document.featured ? " / Featured" : ""}</p>
        <h2>${escapeHtml(document.title)}</h2>
        <p>${escapeHtml(document.description)}</p>
        <p class="document-meta">${metadata.map(escapeHtml).join(" <span aria-hidden=\"true\">·</span> ")}</p>
      </div>
      <div class="document-actions">
        <a href="${safeFile}" target="_blank" rel="noreferrer">Preview <span aria-hidden="true">↗</span></a>
        <a class="download-button" href="${safeFile}" download>Download <span aria-hidden="true">↓</span></a>
      </div>
    </article>`;
};

const getFilteredDocuments = () => {
  const query = elements.search.value.trim().toLocaleLowerCase();
  const category = elements.category.value;
  const sort = elements.sort.value;

  const filtered = documents.filter((document) => {
    const searchableText = `${document.title} ${document.description} ${document.category}`.toLocaleLowerCase();
    return (!query || searchableText.includes(query)) && (category === "all" || document.category === category);
  });

  return filtered.sort((a, b) => {
    if (sort === "oldest") return a.year - b.year || a.title.localeCompare(b.title);
    if (sort === "title") return a.title.localeCompare(b.title);
    return b.year - a.year || Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title);
  });
};

const render = () => {
  const filtered = getFilteredDocuments();
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  currentPage = Math.min(currentPage, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageDocuments = filtered.slice(start, start + PAGE_SIZE);
  const filtersActive = Boolean(elements.search.value.trim()) || elements.category.value !== "all";

  elements.list.innerHTML = pageDocuments.map((document, index) => makeDocumentCard(document, start + index)).join("");
  elements.list.hidden = pageDocuments.length === 0;
  elements.clear.hidden = !filtersActive;
  elements.status.textContent = `${filtered.length} ${filtered.length === 1 ? "document" : "documents"}${filtersActive ? " found" : " in the archive"}`;

  if (pageDocuments.length === 0) {
    elements.empty.hidden = false;
    if (documents.length === 0) {
      elements.emptyLabel.textContent = "Archive ready";
      elements.emptyTitle.textContent = "Documents are being prepared.";
      elements.emptyCopy.textContent = "PDFs will appear here as soon as they are published. Please check back soon.";
    } else {
      elements.emptyLabel.textContent = "No matches";
      elements.emptyTitle.textContent = "No documents match those filters.";
      elements.emptyCopy.textContent = "Try a different search term or clear the filters to see the full archive.";
    }
  } else {
    elements.empty.hidden = true;
  }

  elements.pagination.hidden = filtered.length <= PAGE_SIZE;
  elements.pageStatus.textContent = `Page ${currentPage} of ${pageCount}`;
  elements.previous.disabled = currentPage === 1;
  elements.next.disabled = currentPage === pageCount;
};

const loadLibrary = async () => {
  try {
    const response = await fetch("assets/pdfs/library.json");
    if (!response.ok) throw new Error("The PDF catalog could not be loaded.");
    const data = await response.json();
    documents = (Array.isArray(data) ? data : data.documents || [])
      .map(normaliseDocument)
      .filter((document) => document.file.toLocaleLowerCase().endsWith(".pdf") || /^https?:\/\//i.test(document.file));

    elements.total.textContent = String(documents.length);
    const categories = [...new Set(documents.map((document) => document.category))].sort((a, b) => a.localeCompare(b));
    elements.category.insertAdjacentHTML("beforeend", categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join(""));
    render();
  } catch (error) {
    elements.status.textContent = "The archive is temporarily unavailable.";
    elements.empty.hidden = false;
    elements.emptyLabel.textContent = "Load error";
    elements.emptyTitle.textContent = "The library could not be opened.";
    elements.emptyCopy.textContent = "Please refresh the page or try again later.";
  }
};

[elements.search, elements.category, elements.sort].forEach((control) => {
  control.addEventListener("input", () => {
    currentPage = 1;
    render();
  });
});

elements.clear.addEventListener("click", () => {
  elements.search.value = "";
  elements.category.value = "all";
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

loadLibrary();

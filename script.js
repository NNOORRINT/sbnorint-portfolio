const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

document.querySelectorAll(".project-gallery").forEach((gallery) => {
  const previewImages = [...gallery.querySelectorAll("img")].slice(0, 4);

  if (previewImages.length === 0) return;

  gallery.classList.add(`gallery-count-${previewImages.length}`);
  gallery.closest(".project-image").classList.add("has-gallery");
});

document.querySelectorAll(".evidence-media img").forEach((image) => {
  const updateImageState = () => {
    image.closest(".evidence-media").classList.toggle("is-missing", !image.naturalWidth);
  };

  if (image.complete) updateImageState();
  image.addEventListener("load", updateImageState);
  image.addEventListener("error", updateImageState);
});

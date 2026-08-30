# Son Borey Norint — Portfolio

A responsive, Apple-inspired personal portfolio built with plain HTML, CSS, and JavaScript.

## Run locally

Install dependencies once, then start the live preview:

```sh
npm install
npm run dev
```

Open <http://127.0.0.1:8080/>. Changes to the HTML, CSS, JavaScript, and assets
reload automatically in the browser.

Before publishing, replace the placeholder email, GitHub URL, résumé link, project copy, and `#` project links in `index.html` with your real details.

## Project evidence photos

Add every evidence photo for a project inside that project's `.project-gallery`
element in `index.html`. For example:

```html
<div class="project-gallery" aria-hidden="true">
  <img src="assets/emath/home-page.jpg" alt="" loading="lazy" decoding="async" />
  <img src="assets/emath/problem-page.jpg" alt="" loading="lazy" decoding="async" />
  <img src="assets/emath/solution-page.jpg" alt="" loading="lazy" decoding="async" />
  <img src="assets/emath/mobile-view.jpg" alt="" loading="lazy" decoding="async" />
  <img src="assets/emath/extra-evidence.jpg" alt="" loading="lazy" decoding="async" />
</div>
```

The project card automatically uses the first four photos on larger screens and
the first three on phones. Any later photos remain available for a future
project-detail gallery but are not shown in the card preview. Reorder the `img`
elements to choose which photos appear.

Each project also has its own detail page. Add the complete collection of photos
to the `.evidence-grid` on the matching page; unlike the home-page preview, this
gallery does not limit the number of images.

The E-Math page uses an alternating image-and-text case-study layout. Its six
image filenames and their required order are documented in
`assets/emath/README.md`.

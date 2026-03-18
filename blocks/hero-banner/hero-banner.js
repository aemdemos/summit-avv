export default function decorate(block) {
  const rows = [...block.children];

  if (!block.querySelector(':scope > div:first-child picture')) {
    block.classList.add('no-image');
  }

  // If 3 rows: image, content, announcement — mark the announcement row
  if (rows.length === 3) {
    rows[2].classList.add('hero-banner-announcement');
  }
}

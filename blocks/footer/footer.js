import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Label footer sections: links, also, copyright, social, disclaimer
  const sections = ['links', 'also', 'copyright', 'social', 'disclaimer'];
  sections.forEach((name, i) => {
    const section = footer.children[i];
    if (section) section.classList.add(`footer-${name}`);
  });

  // Wrap copyright + social sections in a flex row
  const copyrightSection = footer.querySelector('.footer-copyright');
  const socialSection = footer.querySelector('.footer-social');
  if (copyrightSection && socialSection) {
    const bottomRow = document.createElement('div');
    bottomRow.classList.add('footer-bottom');
    copyrightSection.before(bottomRow);
    bottomRow.append(copyrightSection, socialSection);
  }

  // Unwrap <p> tags from list items (DA wraps links in <p> tags)
  footer.querySelectorAll('li > p').forEach((p) => {
    const parent = p.parentElement;
    while (p.firstChild) parent.insertBefore(p.firstChild, p);
    p.remove();
  });

  // Remove button decoration from footer links
  footer.querySelectorAll('.button-container').forEach((bc) => {
    bc.classList.remove('button-container');
    const btn = bc.querySelector('.button');
    if (btn) btn.classList.remove('button');
  });

  // Wrap contact paragraphs (after the 3 lists) into a single div
  const linksSection = footer.querySelector('.footer-links .default-content-wrapper');
  if (linksSection) {
    const lastList = linksSection.querySelector('ul:last-of-type');
    if (lastList) {
      const contactDiv = document.createElement('div');
      contactDiv.classList.add('footer-contact');
      let next = lastList.nextElementSibling;
      while (next) {
        const current = next;
        next = next.nextElementSibling;
        contactDiv.append(current);
      }
      if (contactDiv.children.length) linksSection.append(contactDiv);
    }
  }

  block.append(footer);
}

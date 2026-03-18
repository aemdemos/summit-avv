import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // AVEVA header: 4 sections — brand, utility, sections, tools
  const classes = ['brand', 'utility', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // Unwrap <p> tags from list items (DA wraps links in <p> tags)
  nav.querySelectorAll('li > p').forEach((p) => {
    const parent = p.parentElement;
    while (p.firstChild) parent.insertBefore(p.firstChild, p);
    p.remove();
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  // Utility bar: remove button decoration from links
  const navUtility = nav.querySelector('.nav-utility');
  if (navUtility) {
    navUtility.querySelectorAll('.button-container').forEach((bc) => {
      bc.classList.remove('button-container');
      const btn = bc.querySelector('.button');
      if (btn) btn.classList.remove('button');
    });
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      // desktop: open dropdown on hover
      navSection.addEventListener('mouseenter', () => {
        if (isDesktop.matches) {
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', 'true');
        }
      });
      navSection.addEventListener('mouseleave', () => {
        if (isDesktop.matches) {
          navSection.setAttribute('aria-expanded', 'false');
        }
      });
    });
    navSections.querySelectorAll('.button-container').forEach((buttonContainer) => {
      buttonContainer.classList.remove('button-container');
      buttonContainer.querySelector('.button').classList.remove('button');
    });

    // Detect sub-groups within mega-menu columns
    // A column sub-item with a nested <ul> = sub-group with items
    // A column sub-item with <strong> as first child = standalone sub-group header
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li > ul > li > ul > li').forEach((subItem) => {
      if (subItem.querySelector(':scope > ul')) {
        subItem.classList.add('nav-subgroup');
      } else if (subItem.querySelector(':scope > strong')) {
        subItem.classList.add('nav-subgroup-header');
      }
      if (subItem.querySelector('picture, img')) {
        subItem.classList.add('nav-image');
      }
    });
  }

  // Language switcher: detect globe icon with nested language list
  if (navUtility) {
    const globeItem = navUtility.querySelector('.icon-globe');
    if (globeItem) {
      const globeLi = globeItem.closest('li');
      const langList = globeLi.querySelector('ul');
      if (langList) {
        globeLi.classList.add('nav-lang-switcher');
        langList.classList.add('nav-lang-dropdown');
        langList.setAttribute('aria-expanded', 'false');
        // move flag icons inside the links for proper layout
        langList.querySelectorAll('li').forEach((li) => {
          const icon = li.querySelector('.icon');
          const link = li.querySelector('a');
          if (icon && link) {
            link.prepend(icon);
          }
        });
        globeItem.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const expanded = langList.getAttribute('aria-expanded') === 'true';
          langList.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        });
        document.addEventListener('click', (e) => {
          if (!globeLi.contains(e.target)) {
            langList.setAttribute('aria-expanded', 'false');
          }
        });
      }
    }
  }

  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    navTools.querySelectorAll('.button-container').forEach((bc) => {
      bc.classList.remove('button-container');
      const btn = bc.querySelector('.button');
      if (btn) btn.classList.remove('button');
    });
    const search = navTools.querySelector('a[href*="search"]');
    if (search) {
      search.setAttribute('aria-label', 'Search');
    }
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  // Search form: intercept search icon click and show search bar
  if (navTools) {
    const searchLink = navTools.querySelector('a[href*="search"]');
    if (searchLink) {
      const searchBar = document.createElement('div');
      searchBar.className = 'nav-search-bar';
      searchBar.setAttribute('aria-expanded', 'false');
      searchBar.innerHTML = `
        <div class="nav-search-bar-content">
          <span class="icon icon-search nav-search-icon"><img data-icon-name="search" src="/icons/search.svg" alt="" loading="lazy"></span>
          <input type="text" class="nav-search-input" placeholder="Search by product name or partner or keyword" aria-label="Search">
          <button type="button" class="nav-search-close" aria-label="Close search">
            <span class="icon icon-close"><img data-icon-name="close" src="/icons/close.svg" alt="" loading="lazy"></span>
          </button>
        </div>
      `;
      const searchOverlay = document.createElement('div');
      searchOverlay.className = 'nav-search-overlay';

      const openSearch = () => {
        searchBar.setAttribute('aria-expanded', 'true');
        searchOverlay.classList.add('active');
        searchBar.querySelector('.nav-search-input').focus();
      };
      const closeSearch = () => {
        searchBar.setAttribute('aria-expanded', 'false');
        searchOverlay.classList.remove('active');
        searchBar.querySelector('.nav-search-input').value = '';
      };

      searchLink.addEventListener('click', (e) => {
        e.preventDefault();
        openSearch();
      });
      searchBar.querySelector('.nav-search-close').addEventListener('click', closeSearch);
      searchOverlay.addEventListener('click', closeSearch);
      searchBar.querySelector('.nav-search-input').addEventListener('keydown', (e) => {
        if (e.code === 'Enter') {
          const query = e.target.value.trim();
          if (query) window.location.href = `/search?q=${encodeURIComponent(query)}`;
        }
        if (e.code === 'Escape') closeSearch();
      });

      navWrapper.append(searchBar);
      navWrapper.append(searchOverlay);
    }
  }
}

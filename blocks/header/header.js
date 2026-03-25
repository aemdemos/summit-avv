import { getMetadata, DOMPURIFY, decorateIcons } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { ensureDOMPurify } from '../../scripts/scripts.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 1024px)');

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
    // On mobile, null relatedTarget means focus was lost due to DOM/CSS changes
    // (e.g. hiding an element), not the user clicking outside — don't close.
    if (!isDesktop.matches && !e.relatedTarget) return;
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

function resetMobileSubMenus(nav) {
  nav.querySelectorAll('.mobile-expanded').forEach((el) => el.classList.remove('mobile-expanded'));
  nav.querySelectorAll('.mobile-toggle').forEach((btn) => { btn.textContent = '+'; });
  nav.classList.remove('mobile-lang-open');
}

function lockBodyScroll(lock) {
  document.documentElement.classList.toggle('nav-open', lock);
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
  lockBodyScroll(!(expanded || isDesktop.matches));
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  // reset mobile sub-menu state when closing
  if (expanded) resetMobileSubMenus(nav);
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

function decorateNavBrand(nav) {
  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }
}

function decorateNavUtility(nav) {
  const navUtility = nav.querySelector('.nav-utility');
  if (!navUtility) return;
  navUtility.querySelectorAll('.button-container').forEach((bc) => {
    bc.classList.remove('button-container');
    const btn = bc.querySelector('.button');
    if (btn) btn.classList.remove('button');
  });
}

function getPageOverlay() {
  let overlay = document.querySelector('.page-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'page-overlay';
    overlay.addEventListener('click', () => { overlay.classList.remove('active'); });
    document.body.append(overlay);
  }
  return overlay;
}

function setupMobileSubMenus(nav) {
  const navSections = nav.querySelector('.nav-sections');
  if (!navSections) return;

  navSections.querySelectorAll(':scope .default-content-wrapper > ul > li.nav-drop').forEach((l1) => {
    const subMenu = l1.querySelector(':scope > ul');
    if (!subMenu) return;

    // Create L1 toggle button
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'mobile-toggle';
    toggle.textContent = '+';
    toggle.setAttribute('aria-label', 'Expand submenu');
    toggle.addEventListener('click', () => {
      if (isDesktop.matches) return;
      const expanded = l1.classList.toggle('mobile-expanded');
      toggle.textContent = expanded ? '\u2212' : '+';
    });
    l1.insertBefore(toggle, l1.firstChild);

    // Setup L2 toggles for items with sub-menus
    subMenu.querySelectorAll(':scope > li').forEach((l2) => {
      const l2Sub = l2.querySelector(':scope > ul');
      if (!l2Sub) return;

      const l2Toggle = document.createElement('button');
      l2Toggle.type = 'button';
      l2Toggle.className = 'mobile-toggle mobile-toggle-l2';
      l2Toggle.textContent = '+';
      l2Toggle.setAttribute('aria-label', 'Expand submenu');
      l2Toggle.addEventListener('click', () => {
        if (isDesktop.matches) return;
        const expanded = l2.classList.toggle('mobile-expanded');
        l2Toggle.textContent = expanded ? '\u2212' : '+';
      });
      l2.insertBefore(l2Toggle, l2.firstChild);
    });
  });
}

function decorateNavSections(nav) {
  const navSections = nav.querySelector('.nav-sections');
  if (!navSections) return;
  navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
    if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
    navSection.addEventListener('mouseenter', () => {
      if (isDesktop.matches) {
        toggleAllNavSections(navSections);
        navSection.setAttribute('aria-expanded', 'true');
        getPageOverlay().classList.add('active');
      }
    });
    navSection.addEventListener('mouseleave', () => {
      if (isDesktop.matches) {
        navSection.setAttribute('aria-expanded', 'false');
        getPageOverlay().classList.remove('active');
      }
    });
  });
  navSections.querySelectorAll('.button-container').forEach((buttonContainer) => {
    buttonContainer.classList.remove('button-container');
    buttonContainer.querySelector('.button').classList.remove('button');
  });
  navSections.querySelectorAll(':scope .default-content-wrapper > ul > li > ul > li > ul > li').forEach((subItem) => {
    if (subItem.querySelector(':scope > ul')) subItem.classList.add('nav-subgroup');
    else if (subItem.querySelector(':scope > strong')) subItem.classList.add('nav-subgroup-header');
    if (subItem.querySelector('picture, img')) subItem.classList.add('nav-image');
  });
}

function decorateLanguageSwitcher(nav) {
  const navUtility = nav.querySelector('.nav-utility');
  if (!navUtility) return;
  let langTrigger = navUtility.querySelector('a[href="#lang"]');
  if (!langTrigger) {
    navUtility.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((li) => {
      if (langTrigger) return;
      const link = li.querySelector(':scope > a');
      const spanIcon = li.querySelector(':scope > span.icon, :scope > .icon');
      const hasLangList = li.querySelector(':scope > ul');
      if (link && link.querySelector('.icon') && !link.textContent.trim() && hasLangList) {
        langTrigger = link;
      } else if (spanIcon && hasLangList) {
        langTrigger = spanIcon;
      }
    });
  }
  if (!langTrigger) return;
  const langLi = langTrigger.closest('li');
  const langList = langLi.querySelector('ul');
  if (!langList) return;
  langLi.classList.add('nav-lang-switcher');
  langList.classList.add('nav-lang-dropdown');
  langList.setAttribute('aria-expanded', 'false');
  langList.querySelectorAll('li').forEach((item) => {
    const icon = item.querySelector(':scope > span.icon, :scope > .icon');
    const link = item.querySelector(':scope > a');
    if (icon && link) link.insertBefore(icon, link.firstChild);
  });
  if (langTrigger.tagName === 'SPAN') {
    langTrigger.setAttribute('role', 'button');
    langTrigger.setAttribute('tabindex', '0');
    langTrigger.setAttribute('aria-label', 'Language');
    langTrigger.setAttribute('aria-expanded', 'false');
    langTrigger.setAttribute('aria-haspopup', 'true');
  }
  const setExpanded = (expanded) => {
    langList.setAttribute('aria-expanded', expanded);
    if (langTrigger.tagName === 'SPAN') langTrigger.setAttribute('aria-expanded', expanded);
  };
  langTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded(langList.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
  });
  langTrigger.addEventListener('keydown', (e) => {
    if (e.code === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      setExpanded(langList.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
    }
  });
  document.addEventListener('click', (e) => {
    if (!langLi.contains(e.target)) setExpanded('false');
  });
}

function buildMobileLangSwitcher(nav) {
  const langSwitcher = nav.querySelector('.nav-lang-switcher');
  if (!langSwitcher) return;

  const langList = langSwitcher.querySelector('.nav-lang-dropdown');
  if (!langList) return;

  // Determine current language from the list (match current path)
  let currentLang = 'English';
  langList.querySelectorAll('li a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href && window.location.pathname.startsWith(href.replace(/\/$/, ''))) {
      currentLang = a.textContent.trim();
    }
  });

  // Bottom bar trigger (globe icon + "English" + right arrow)
  const mobileLang = document.createElement('div');
  mobileLang.className = 'nav-mobile-lang';

  const globeSpan = document.createElement('span');
  globeSpan.className = 'icon icon-globe';
  const globeImg = document.createElement('img');
  globeImg.setAttribute('data-icon-name', 'globe');
  globeImg.src = '/icons/globe.svg';
  globeImg.alt = '';
  globeImg.loading = 'lazy';
  globeSpan.append(globeImg);

  const langText = document.createElement('span');
  langText.className = 'nav-mobile-lang-text';
  langText.textContent = currentLang;

  const langArrow = document.createElement('span');
  langArrow.className = 'nav-mobile-lang-arrow';

  mobileLang.append(globeSpan, langText, langArrow);

  // Language selection panel (hidden by default, shown when trigger is clicked)
  const langPanel = document.createElement('div');
  langPanel.className = 'nav-mobile-lang-panel';

  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'mobile-back-btn';
  const backArrow = document.createElement('span');
  backArrow.className = 'mobile-back-arrow';
  backBtn.append(backArrow);
  backBtn.append('Back');
  langPanel.append(backBtn);

  const panelList = document.createElement('ul');
  langList.querySelectorAll('li').forEach((li) => {
    const a = li.querySelector('a');
    if (!a) return;
    const newLi = document.createElement('li');
    const newA = document.createElement('a');
    newA.href = a.getAttribute('href') || '#';
    const icon = li.querySelector('.icon');
    if (icon) newA.append(icon.cloneNode(true));
    const nameSpan = document.createElement('span');
    nameSpan.className = 'nav-mobile-lang-name';
    nameSpan.textContent = a.textContent.trim();
    newA.append(nameSpan);
    if (a.textContent.trim() === currentLang) {
      const check = document.createElement('span');
      check.className = 'nav-mobile-lang-check';
      newA.append(check);
    }
    newLi.append(newA);
    panelList.append(newLi);
  });
  langPanel.append(panelList);

  // Open lang panel
  mobileLang.addEventListener('click', () => {
    nav.classList.add('mobile-lang-open');
  });

  // Close lang panel (back button)
  backBtn.addEventListener('click', () => {
    nav.classList.remove('mobile-lang-open');
  });

  nav.append(mobileLang, langPanel);
}

function decorateNavTools(nav) {
  const navTools = nav.querySelector('.nav-tools');
  if (!navTools) return;
  navTools.querySelectorAll('.button-container').forEach((bc) => {
    bc.classList.remove('button-container');
    const btn = bc.querySelector('.button');
    if (btn) btn.classList.remove('button');
  });
  const search = navTools.querySelector('a[href*="search"]');
  if (search) search.setAttribute('aria-label', 'Search');
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  await ensureDOMPurify();

  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  ['brand', 'utility', 'sections', 'tools'].forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  nav.querySelectorAll('li > p').forEach((p) => {
    const parent = p.parentElement;
    while (p.firstChild) parent.insertBefore(p.firstChild, p);
    p.remove();
  });

  decorateNavBrand(nav);
  decorateNavUtility(nav);
  decorateNavSections(nav);
  setupMobileSubMenus(nav);
  decorateLanguageSwitcher(nav);
  buildMobileLangSwitcher(nav);
  decorateNavTools(nav);
  decorateIcons(nav);

  const navSections = nav.querySelector('.nav-sections');
  const navTools = nav.querySelector('.nav-tools');

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = window.DOMPurify.sanitize(`<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`, DOMPURIFY);
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
      searchBar.innerHTML = window.DOMPurify.sanitize(`
        <div class="nav-search-bar-content">
          <span class="icon icon-search nav-search-icon"><img data-icon-name="search" src="/icons/search.svg" alt="" loading="lazy"></span>
          <input type="text" class="nav-search-input" placeholder="Search by product name or partner or keyword" aria-label="Search">
          <button type="button" class="nav-search-close" aria-label="Close search">
            <span class="icon icon-close"><img data-icon-name="close" src="/icons/close.svg" alt="" loading="lazy"></span>
          </button>
        </div>
      `, DOMPURIFY);
      const pageOverlay = getPageOverlay();

      const openSearch = () => {
        searchBar.setAttribute('aria-expanded', 'true');
        pageOverlay.classList.add('active');
        searchBar.querySelector('.nav-search-input').focus();
      };
      const closeSearch = () => {
        searchBar.setAttribute('aria-expanded', 'false');
        pageOverlay.classList.remove('active');
        searchBar.querySelector('.nav-search-input').value = '';
      };

      searchLink.addEventListener('click', (e) => {
        e.preventDefault();
        openSearch();
      });
      searchBar.querySelector('.nav-search-close').addEventListener('click', closeSearch);
      pageOverlay.addEventListener('click', closeSearch);
      searchBar.querySelector('.nav-search-input').addEventListener('keydown', (e) => {
        if (e.code === 'Enter') {
          const input = e.target;
          if (input !== null && input !== undefined && input instanceof HTMLInputElement) {
            const val = input.value;
            const query = typeof val === 'string' ? val.trim() : '';
            if (query.length > 0) {
              window.location.href = `/search?q=${encodeURIComponent(query)}`;
            }
          }
        }
        if (e.code === 'Escape') closeSearch();
      });

      navWrapper.append(searchBar);
    }
  }
}

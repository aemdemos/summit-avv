var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-banner.js
  function parse(element, { document }) {
    const bgImage = element.querySelector(":scope > img") || element.querySelector(":scope > picture") || element.querySelector(":scope > picture img");
    const heading = element.querySelector(".heading h1, .heading h2");
    const description = element.querySelector(".description.rte-content p");
    const ctaLinks = [...element.querySelectorAll(".hero-banner-btn-wrapper .smartbutton a")].filter(
      (a) => a.textContent.trim().length > 0
    ).map((a) => {
      const strong = document.createElement("strong");
      strong.appendChild(a);
      return strong;
    });
    const root = element.ownerDocument || document;
    const announcementEl = heading && heading.tagName === "H1" ? root.querySelector(".announcement .cmp-text p") : null;
    const cells = [];
    if (bgImage) {
      cells.push([bgImage]);
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);
    contentCell.push(...ctaLinks);
    cells.push(contentCell);
    if (announcementEl) {
      cells.push([announcementEl]);
      const announcementBlock = announcementEl.closest(".announcement");
      if (announcementBlock) {
        const parent = announcementBlock.parentElement;
        announcementBlock.remove();
        if (parent && parent.children.length === 0 && parent.textContent.trim() === "") {
          parent.remove();
        }
      }
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/promo-banner.js
  function parse2(element, { document }) {
    const bgImage = element.querySelector(":scope > img") || element.querySelector(":scope > picture") || element.querySelector(":scope > picture img");
    const heading = element.querySelector(".heading h2");
    const description = element.querySelector(".description.rte-content p");
    const ctaLinks = [...element.querySelectorAll(".hero-banner-btn-wrapper .smartbutton a")].filter(
      (a) => a.textContent.trim().length > 0
    ).map((a) => {
      const strong = document.createElement("strong");
      strong.appendChild(a);
      return strong;
    });
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);
    contentCell.push(...ctaLinks);
    const cells = [];
    if (bgImage) {
      cells.push([bgImage]);
    }
    cells.push(contentCell);
    const blockName = bgImage ? "promo-banner" : "promo-banner dark";
    const block = WebImporter.Blocks.createBlock(document, { name: blockName, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-highlight.js
  function parse3(element, { document }) {
    const cols = [...element.querySelectorAll(":scope > .col")];
    if (cols.length < 2) return;
    const cellContents = cols.map((col) => {
      const cellItems = [];
      const img = col.querySelector('.cmp-image__image, img[class*="cmp-image"]');
      if (img) {
        cellItems.push(img);
        return cellItems;
      }
      const headings = [...col.querySelectorAll(".cmp-text h2, .cmp-text h3")];
      headings.forEach((h) => cellItems.push(h));
      const paragraphs = [...col.querySelectorAll(".cmp-text p")].filter(
        (p) => p.textContent.trim().length > 0 && p.textContent.trim() !== "\xA0"
      );
      paragraphs.forEach((p) => cellItems.push(p));
      const ctaLinks = [...col.querySelectorAll(".smartbutton a")].filter(
        (a) => a.textContent.trim().length > 0
      );
      ctaLinks.forEach((a) => {
        const isGhost = a.classList.contains("ghost-btn");
        const wrapper = document.createElement(isGhost ? "em" : "strong");
        wrapper.appendChild(a);
        cellItems.push(wrapper);
      });
      return cellItems;
    });
    const cells = [cellContents];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-highlight", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-feature.js
  function parse4(element, { document }) {
    const cards = [...element.querySelectorAll(".card-v3.clickable-card, .card-v2-t1.clickable-card")];
    if (cards.length === 0) return;
    const cells = [];
    cards.forEach((card) => {
      const isV3 = card.classList.contains("card-v3");
      const img = card.querySelector(
        isV3 ? "img.card-v3__img" : "img.card-v2-t1__img"
      );
      const heading = card.querySelector(
        isV3 ? "h3.card-v3__heading" : "h3.card-v2-t1__heading"
      );
      const descEl = card.querySelector(
        isV3 ? ".card-v3__description p" : ".card-v2-t1__desciption p"
      );
      let ctaLink = null;
      if (isV3) {
        const cardContainer = card.closest(".card-images");
        if (cardContainer) {
          ctaLink = cardContainer.querySelector(".smartbutton a");
        }
      } else {
        ctaLink = card.querySelector(".card-v2-t1__link .smartbutton a");
      }
      const imageCell = img ? [img] : [];
      const textCell = [];
      if (heading) textCell.push(heading);
      if (descEl) textCell.push(descEl);
      if (ctaLink && ctaLink.textContent.trim().length > 0) textCell.push(ctaLink);
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/aveva-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        ".uw-sl",
        ".uwy.userway_p5",
        ".uwif",
        ".uwaw-dictionary-tooltip",
        ".uw-s10-bottom-ruler-guide",
        ".uw-s10-right-ruler-guide",
        ".uw-s10-left-ruler-guide",
        ".uw-s10-reading-guide",
        ".uw-s12-tooltip"
      ]);
      WebImporter.DOMUtils.remove(element, ["#consent_blackbar"]);
      WebImporter.DOMUtils.remove(element, [".modal.fade.image-popup-modal"]);
      WebImporter.DOMUtils.remove(element, [".interactive-content"]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        ".cmp-experiencefragment--header-3",
        "header.global-header-container"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".cmp-experiencefragment--footer",
        "footer.global-footer"
      ]);
      WebImporter.DOMUtils.remove(element, ["a.skip"]);
      WebImporter.DOMUtils.remove(element, [".announcement"]);
      WebImporter.DOMUtils.remove(element, ["iframe", "link", "noscript"]);
    }
  }

  // tools/importer/transformers/aveva-sections.js
  var H2 = { after: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === H2.after) {
      const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document: element.getRootNode() };
      const sections = payload && payload.template && payload.template.sections;
      if (!sections || sections.length < 2) return;
      const reversedSections = [...sections].reverse();
      for (const section of reversedSections) {
        const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
        let sectionEl = null;
        for (const sel of selectors) {
          try {
            sectionEl = element.querySelector(sel);
          } catch (e) {
          }
          if (sectionEl) break;
        }
        if (!sectionEl) continue;
        if (section.style) {
          const metaBlock = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(metaBlock);
        }
        if (section.id !== "section-1") {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-banner": parse,
    "promo-banner": parse2,
    "columns-highlight": parse3,
    "cards-feature": parse4
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "AVEVA corporate homepage with hero, product highlights, and call-to-action sections",
    urls: [
      "https://www.aveva.com/"
    ],
    blocks: [
      {
        name: "hero-banner",
        instances: [
          "section.hero-banner.u-hero-height-large"
        ]
      },
      {
        name: "promo-banner",
        instances: [
          "section.hero-banner.u-hero-height-small"
        ]
      },
      {
        name: "columns-highlight",
        instances: [
          "#getAgileSection .column-control .row.coltype-2",
          "section.background-container .column-control .row.coltype-2"
        ]
      },
      {
        name: "cards-feature",
        instances: [
          ".row.coltype-21:has(.card-v3)",
          ".row.coltype-3:has(.card-v2-t1)"
        ]
      }
    ],
    sections: [
      { id: "section-1", name: "Hero", selector: "section.hero-banner.u-hero-height-large", style: null, blocks: ["hero-banner"], defaultContent: [] },
      { id: "section-3", name: "Get Agile", selector: "#getAgileSection", style: null, blocks: ["columns-highlight"], defaultContent: [] },
      { id: "section-4", name: "Expand Collaboration", selector: ["section.background-container:has(.cmp-text h2:first-child)", "#getAgileSection ~ .background-container .column-control"], style: "light-gray", blocks: ["columns-highlight"], defaultContent: [] },
      { id: "section-5", name: "Gartner Recognition", selector: "section.hero-banner.u-hero-height-small:nth-of-type(1)", style: null, blocks: ["promo-banner"], defaultContent: [] },
      { id: "section-6", name: "Advance Sustainability", selector: "section.background-container:has(h2:first-child)", style: null, blocks: ["columns-highlight"], defaultContent: [] },
      { id: "section-7", name: "CONNECT Effect Banner", selector: ".image.aem-GridColumn .cmp-image__link[href*='connect-effect']", style: "full-bleed", blocks: [], defaultContent: [".cmp-image__link[href*='connect-effect']"] },
      { id: "section-8", name: "Customer Success", selector: "section.background-container:has(.background-container__heading:first-child)", style: "light-gray", blocks: ["cards-feature"], defaultContent: [".background-container__heading"] },
      { id: "section-9", name: "Our Industrial Life", selector: "section.hero-banner:has(h2)", style: null, blocks: ["promo-banner"], defaultContent: [] },
      { id: "section-10", name: "Industrial Ingenuity", selector: "section.background-container:has(.card-v2-t1)", style: "light-gray", blocks: ["cards-feature"], defaultContent: [".background-container__heading"] },
      { id: "section-11", name: "Speak with Expert", selector: "section.hero-banner:last-of-type", style: null, blocks: ["promo-banner"], defaultContent: [] }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach((element) => {
            pageBlocks.push({
              name: blockDef.name,
              selector,
              element
            });
          });
        } catch (e) {
          console.warn(`Invalid selector for block "${blockDef.name}": ${selector}`);
        }
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      WebImporter.rules.transformBackgroundImages(main, document);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      [...main.querySelectorAll("hr")].forEach((h) => {
        let next = h.nextElementSibling;
        while (next && next.tagName === "HR") {
          const toRemove = next;
          next = next.nextElementSibling;
          toRemove.remove();
        }
      });
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();

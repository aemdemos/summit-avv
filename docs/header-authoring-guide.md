# Header Authoring Guide

This document describes the authoring conventions for the site header (navigation). These conventions allow the header block to detect and render interactive components without hardcoding specific icon names.

## Navigation Document Structure

The navigation document (`/nav`) has 4 sections, in order:

| Section | Purpose |
|---------|---------|
| 1. Brand | Site logo linking to homepage |
| 2. Utility bar | Top bar with secondary links, language switcher |
| 3. Main navigation | Primary nav links with mega-menu dropdowns |
| 4. Tools | Search icon and other tools |

## Language Switcher

The language switcher is a dropdown menu in the utility bar that lets users switch between site languages.

### How it works

The header JavaScript detects the language switcher by looking for a link with `href="#lang"` in the utility bar. Any icon can be used — the detection is based on the link target, not the icon.

### Authoring in Document Authoring (DA)

In your nav document, create a list item in the **utility bar section** with:

1. A link pointing to `#lang` containing any icon (e.g., `:globe:`, `:map:`, `:language:`)
2. A nested list of language options, each linking to the localized site

```
- [Partners](/en/about/partners/)
- [Academia](/en/academia/)
- ...
- [:globe:](#lang)
  - [:flag-en: English](/en/)
  - [:flag-cn: Chinese](https://www.aveva.cn/)
  - [:flag-de: German](/de-de/)
  - [:flag-fr: French](/fr-fr/)
```

### Key rules

- **`#lang` is required** — This is how the header identifies the language switcher. Without it, the dropdown behavior won't activate.
- **Icon is flexible** — Use any icon that makes sense for your design (`:globe:`, `:map:`, `:world:`, etc.). The header doesn't check which icon is used.
- **Nested list is required** — The language options must be a nested `<ul>` under the `#lang` list item.
- **Flag icons are optional** — Language items can include flag icons (e.g., `:flag-en:`) but they aren't required.

### Changing the icon

To change the language switcher icon, simply replace the icon in the link. For example:

| Icon | Authoring |
|------|-----------|
| Globe | `[:globe:](#lang)` |
| Map | `[:map:](#lang)` |
| Language | `[:language:](#lang)` |

The `#lang` part stays the same — only the icon changes.

## Search

The search icon in the **tools section** is detected by its link target. Any link containing `search` in the href will activate the search bar behavior.

### Authoring

```
- [:search:](/search)
```

## Mega-menu Dropdowns

Main navigation items with nested lists automatically become mega-menu dropdowns on desktop.

### Column headings

- **Linked heading**: `[Engineering](/en/solutions/engineering/)` — clickable, shows hover highlight
- **Non-linked heading**: `**Featured Solutions**` (bold text) — acts as a label, not clickable

### Sub-groups

Within a mega-menu column, you can create sub-groups by nesting additional lists:

```
- [Engineering](/en/solutions/engineering/)
  - [E3D Design](/en/products/e3d-design/)
  - [Unified Engineering](/en/products/unified-engineering/)
  - [**Operations**](/en/solutions/operations/)
    - [System Platform](/en/products/system-platform/)
    - [InTouch HMI](/en/products/intouch-hmi/)
```

## Summary of Conventions

| Feature | Convention | Detection Method |
|---------|-----------|-----------------|
| Language switcher | Link to `#lang` | `a[href="#lang"]` |
| Search | Link containing "search" | `a[href*="search"]` |
| Mega-menu dropdown | Nested list under nav item | Presence of child `<ul>` |
| Column heading (linked) | Regular link | `<a>` element |
| Column heading (label) | Bold text | `<strong>` element |

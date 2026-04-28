# HTML Creative Style Spec for AI (Editable)

This spec is designed for generating **production-usable** HTML preview styles for this project.
Output must be directly importable by the UI importer.

## 1) Output Contract (Strict)

You must return either **Text Format** or **JSON Format**.

### Text Format (recommended)

```text
id: editorial-pro
name-en: Editorial Pro
name-zh: 专业杂志风
css:
.html-creative-preview {
  font-family: Georgia, "Times New Roman", serif;
  background: #fffdf8;
  color: #1f1f1f;
  padding: 48px;
  line-height: 1.8;
}
```

### JSON Format

```json
{
  "id": "editorial-pro",
  "nameEn": "Editorial Pro",
  "nameZh": "专业杂志风",
  "css": ".html-creative-preview { background: #fffdf8; color: #1f1f1f; }"
}
```

## 2) Required Fields

- `id`: required, unique, lowercase letters/numbers/hyphen only, e.g. `neo-print-v2`
- `name-en`: required, concise style name in English
- `name-zh`: required, concise style name in Chinese
- `css`: required, full style CSS

## 3) CSS Safety Rules

- Scope all rules under `.html-creative-preview`.
- Do not style global tags without prefix.
- Avoid fixed viewport heights that clip content.
- Keep code blocks horizontally scrollable (`overflow-x: auto`).
- Ensure contrast is readable for body text and links.
- Do not import external JS.

## 4) Must Cover These Elements

The style should include clear rules for:

- `h1`~`h6`
- `p`
- `ul`, `ol`, `li`
- `blockquote`
- `pre`, `code`
- `a` and hover
- `table`, `th`, `td`
- `img`
- `hr`

## 5) Design Quality Guidelines

- Strong visual direction (not generic gray default).
- Coherent typography hierarchy.
- Purposeful spacing rhythm.
- Distinctive but readable accent colors.
- Respect long documents and mixed Chinese/English content.

## 6) Recommended Skeleton

```css
.html-creative-preview {
  /* layout + typography + base colors */
}

.html-creative-preview h1,
.html-creative-preview h2,
.html-creative-preview h3,
.html-creative-preview h4,
.html-creative-preview h5,
.html-creative-preview h6 {
  /* heading hierarchy */
}

.html-creative-preview p { }
.html-creative-preview ul,
.html-creative-preview ol { }
.html-creative-preview li { }

.html-creative-preview blockquote { }

.html-creative-preview pre { overflow-x: auto; }
.html-creative-preview code { }
.html-creative-preview pre code { }

.html-creative-preview a { }
.html-creative-preview a:hover { }

.html-creative-preview table { }
.html-creative-preview th,
.html-creative-preview td { }

.html-creative-preview img { max-width: 100%; }
.html-creative-preview hr { }
```

## 7) AI Prompt Template

Use this prompt to request a new style:

```text
Generate an importable HTML preview style for a Markdown-to-Word tool.
Return in TEXT FORMAT with fields: id, name-en, name-zh, css.
Theme direction: [describe tone, e.g. "clean financial report"]
Primary color: [hex]
Background style: [flat/gradient/pattern]
Typography mood: [editorial/technical/minimal]
Constraints:
- scope every rule under .html-creative-preview
- include h1-h6, p, list, blockquote, code, links, table, image, hr
- ensure readability for long Chinese + English mixed content
```

## 8) Acceptance Checklist

Before returning, verify:

- [ ] `id` valid and unique-like
- [ ] both `name-en` and `name-zh` present
- [ ] CSS fully scoped under `.html-creative-preview`
- [ ] all required elements covered
- [ ] no obvious clipping / overflow issues
- [ ] color contrast is readable

## 9) Versioning Suggestion

- If refining existing style, keep same `id` to overwrite.
- If making a new variant, suffix id like `editorial-pro-v2`.

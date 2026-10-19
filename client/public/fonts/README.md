Self-hosted Latin subsets from Google Fonts, all licensed under the SIL Open Font License 1.1:

- Bricolage Grotesque (optical size pinned at 96, weights 500–800) — display headings
- Geist (400–600) — body text
- Geist Mono (400–500) — labels, code
- Instrument Serif Italic — accent words

The site serves these with a year-long cache (`client/vercel.json`), so browsers never ask for them
again: a font that changes gets a new file name, and the pages that load it change with it.

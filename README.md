# quarto-revealjs-tldraw

A [Quarto](https://quarto.org) RevealJS extension that lets you draw on your slides using [tldraw](https://tldraw.dev) v4.

## Installation

```bash
quarto add EmilHvitfeldt/quarto-revealjs-tldraw
```

## Usage

Add the plugin to your presentation's YAML frontmatter:

```yaml
format:
  revealjs: default
revealjs-plugins:
  - tldraw
```

### Activating drawing mode

- Press **T** to toggle drawing mode on/off
- Or open the hamburger menu (☰) → **Tools** → **Toggle Drawing**
- Press **Escape** or **T** to exit drawing mode

When drawing mode is active, tldraw's full toolbar appears and slide navigation is paused. Each slide has its own drawing layer. Drawings are automatically saved to `localStorage`.

## Related

- [Quarto Chalkboard](https://quarto.org/docs/presentations/revealjs/presenting.html#chalkboard) — Quarto's built-in drawing plugin, a lighter-weight alternative with a chalkboard aesthetic
- [tldreveal](https://github.com/arthurrump/tldreveal) — a plain Reveal.js plugin with a similar approach, which inspired this extension

## Development

The extension bundle is built from TypeScript source using esbuild. After cloning:

```bash
npm install
npm run build   # production build → _extensions/tldraw/tldraw.js
npm run watch   # rebuild on changes
```

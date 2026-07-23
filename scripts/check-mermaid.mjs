/**
 * Validates every ```mermaid fence in the MDX content tree.
 *
 * Mermaid syntax errors do not fail `next build` — diagrams are rendered on the
 * client, so a bad chart only surfaces as a broken page in the browser. This
 * runs mermaid's own parser over each fence so breakage is caught in CI.
 *
 * Note: this checks syntax only. jsdom has no `getBBox`, so mermaid's layout
 * pass cannot run headlessly; visual regressions still need a browser.
 *
 * Usage:
 *   bun run check:mermaid              # whole content tree
 *   node scripts/check-mermaid.mjs a.mdx b.mdx
 */
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  pretendToBeVisual: true,
  url: 'http://localhost/',
});

globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Element = dom.window.Element;
globalThis.SVGElement = dom.window.SVGElement;
globalThis.Node = dom.window.Node;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.DOMParser = dom.window.DOMParser;
globalThis.NodeFilter = dom.window.NodeFilter;
globalThis.getComputedStyle = dom.window.getComputedStyle;
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
});

const { default: mermaid } = await import('mermaid');
mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.name.endsWith('.mdx') ? [full] : [];
  });
}

const files = process.argv.slice(2);
const targets = files.length > 0 ? files : walk('content');

let checked = 0;
const failures = [];

for (const file of targets) {
  const src = fs.readFileSync(file, 'utf8');

  for (const [i, match] of [...src.matchAll(/```mermaid\r?\n([\s\S]*?)```/g)].entries()) {
    // line number of the fence, so failures point somewhere useful
    const line = src.slice(0, match.index).split('\n').length;
    checked++;

    try {
      await mermaid.parse(match[1]);
    } catch (e) {
      failures.push(`${file}:${line} [diagram ${i + 1}] ${e.message.split('\n')[0]}`);
    }
  }
}

if (failures.length > 0) {
  console.error(`\n${failures.length} of ${checked} diagram(s) failed to parse:\n`);
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log(`${checked} mermaid diagram(s) parsed successfully`);

import { JSDOM } from 'jsdom';
import fs from 'node:fs';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  pretendToBeVisual: true,
  url: 'http://localhost/',
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
});
globalThis.Element = dom.window.Element;
globalThis.SVGElement = dom.window.SVGElement;
globalThis.Node = dom.window.Node;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.DOMParser = dom.window.DOMParser;
globalThis.NodeFilter = dom.window.NodeFilter;
globalThis.getComputedStyle = dom.window.getComputedStyle;
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);

const { default: mermaid } = await import('mermaid');
mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });

const files = process.argv.slice(2);
let failures = 0;

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const fences = [...src.matchAll(/```mermaid\r?\n([\s\S]*?)```/g)];
  if (fences.length === 0) continue;

  for (const [i, match] of fences.entries()) {
    const chart = match[1];
    try {
      await mermaid.parse(chart);
      console.log(`OK    ${file} [diagram ${i + 1}]`);
    } catch (e) {
      failures++;
      console.log(`FAIL  ${file} [diagram ${i + 1}]: ${e.message}`);
    }
  }
}

console.log(failures === 0 ? '\nall diagrams parsed' : `\n${failures} diagram(s) failed`);
process.exit(failures === 0 ? 0 : 1);

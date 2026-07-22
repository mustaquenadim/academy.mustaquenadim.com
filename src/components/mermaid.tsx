'use client';

import { use, useEffect, useId, useState } from 'react';
import { useTheme } from 'next-themes';
import { Maximize2, X } from 'lucide-react';
import { Dialog, VisuallyHidden } from 'radix-ui';
import { buttonVariants } from './ui/button';
import { cn } from '@/lib/utils';

/**
 * Renders a Mermaid diagram. Authored in MDX as a ```mermaid code fence —
 * `remarkMdxMermaid` rewrites those fences into this component at build time.
 */
export function Mermaid({ chart }: { chart: string }) {
  const [mounted, setMounted] = useState(false);

  // mermaid renders against the DOM, so wait until we're on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return <MermaidContent chart={chart} />;
}

const cache = new Map<string, Promise<unknown>>();

function cachePromise<T>(key: string, setPromise: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  if (cached) return cached as Promise<T>;

  const promise = setPromise();
  cache.set(key, promise);
  return promise;
}

function MermaidContent({ chart }: { chart: string }) {
  const renderId = useId().replaceAll(':', '');
  const { resolvedTheme } = useTheme();
  const { default: mermaid } = use(cachePromise('mermaid', () => import('mermaid')));

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    fontFamily: 'inherit',
    themeCSS: 'margin: 0 auto;',
    theme: resolvedTheme === 'dark' ? 'dark' : 'default',
  });

  const { svg, bindFunctions } = use(
    cachePromise(`${chart}-${resolvedTheme}`, () =>
      mermaid.render(renderId, chart.replaceAll('\\n', '\n')),
    ),
  );

  // the expanded copy lives in the DOM at the same time as the inline one, so
  // rewrite mermaid's generated ids to keep marker/gradient refs unambiguous
  const expandedSvg = svg.replaceAll(renderId, `${renderId}-expanded`);

  return (
    <Dialog.Root>
      <figure className="group/mermaid relative not-prose my-6 rounded-xl border bg-fd-card">
        <div
          className="overflow-auto p-4 [&_svg]:mx-auto [&_svg]:max-w-full"
          ref={(container) => {
            if (container) bindFunctions?.(container);
          }}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: mermaid returns rendered SVG markup
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <Dialog.Trigger
          aria-label="Expand diagram"
          title="Expand diagram"
          className={cn(
            buttonVariants({ variant: 'secondary', size: 'icon-sm' }),
            'absolute top-2 end-2 z-10 text-fd-muted-foreground backdrop-blur-sm transition-opacity',
            // always reachable on touch, quiet until hover on pointer devices
            'md:opacity-0 md:group-hover/mermaid:opacity-100 md:focus-visible:opacity-100',
          )}
        >
          <Maximize2 className="size-4" />
        </Dialog.Trigger>
      </figure>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-fd-background/80 backdrop-blur-sm data-[state=closed]:animate-fd-fade-out data-[state=open]:animate-fd-fade-in" />
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col focus:outline-none">
          <VisuallyHidden.Root>
            <Dialog.Title>Diagram</Dialog.Title>
          </VisuallyHidden.Root>

          <Dialog.Close
            aria-label="Close diagram"
            className={cn(
              buttonVariants({ variant: 'secondary', size: 'icon' }),
              'absolute top-4 end-4 z-10 text-fd-muted-foreground',
            )}
          >
            <X className="size-4" />
          </Dialog.Close>

          <div
            className="flex-1 overflow-auto p-6 md:p-12 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:w-full [&_svg]:max-w-[1400px]"
            ref={(container) => {
              if (container) bindFunctions?.(container);
            }}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: mermaid returns rendered SVG markup
            dangerouslySetInnerHTML={{ __html: expandedSvg }}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { Accordion, Accordions } from './accordion';
import { Callout } from './callout';
import { Card, Cards } from './card';
import { CodeBlock, Pre } from './codeblock';
import { File, Files, Folder } from './files';
import { Step, Steps } from './steps';
import { Tab, Tabs } from './tabs';
import { TypeTable } from './type-table';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    // Register local authoring components so lessons can use them in MDX.
    Accordion,
    Accordions,
    Callout,
    Card,
    Cards,
    File,
    Files,
    Folder,
    Step,
    Steps,
    Tab,
    Tabs,
    TypeTable,
    pre: (props) => (
      <CodeBlock {...props}>
        <Pre>{props.children}</Pre>
      </CodeBlock>
    ),
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}

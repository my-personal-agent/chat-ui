"use client";

import { prettyOptions } from "@/lib/pretty-options";
import { useTheme } from "next-themes";
import { MarkdownHooks } from "react-markdown";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

interface MarkdownProps {
  content: string;
}

export function Markdown({ content }: MarkdownProps) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";

  // Override the theme for rehype-pretty-code
  const rehypeOpts = {
    ...prettyOptions,
    theme:
      prettyOptions.theme?.[theme as keyof typeof prettyOptions.theme] ??
      "dark",
  };

  return (
    <div
      className="markdown-content"
      style={
        {
          "--level-1-bullet": "disc",
          "--level-2-bullet": "circle",
          "--level-3-bullet": "square",
        } as React.CSSProperties
      }
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .markdown-content ul {
            list-style-type: var(--level-1-bullet);
          }
          .markdown-content ul ul {
            list-style-type: var(--level-2-bullet);
          }
          .markdown-content ul ul ul {
            list-style-type: var(--level-3-bullet);
          }
        `,
        }}
      />

      <MarkdownHooks
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[
          rehypeRaw,
          rehypeSanitize,
          [rehypePrettyCode, rehypeOpts],
        ]}
        components={{
          hr: () => <hr className="my-8 border-muted" />,
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              {...props}
            >
              {children}
            </a>
          ),
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          ul: ({ children, ...props }) => (
            <ul className="space-y-4 ml-6 list-outside" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-4 list-decimal list-outside ml-6">
              {children}
            </ol>
          ),
          li: ({ children }) => {
            return <li className="[&>p]:contents leading-loose">{children}</li>;
          },
          blockquote: ({ children }) => (
            <blockquote className="space-y-4 border-l-4 pl-4 italic text-muted-foreground my-8">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          pre: ({ children }) => (
            <pre className="overflow-x-auto max-w-2xl border p-6 rounded-lg mb-8 border-border bg-muted/50 min-w-0">
              {children}
            </pre>
          ),
          code({ className, children, ...props }) {
            const isBlock = props.style?.display === "grid";
            if (!isBlock) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-sm border"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mb-6 mt-8">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold mb-5 mt-7">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-medium mb-4 mt-6">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-medium mb-4 mt-5">{children}</h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-base font-medium mb-3 mt-4">{children}</h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-sm font-medium mb-3 mt-4">{children}</h6>
          ),
        }}
        fallback={<div>Loading preview…</div>}
      >
        {content}
      </MarkdownHooks>
    </div>
  );
}

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
            className="text-primary underline"
            {...props}
          >
            {children}
          </a>
        ),
        p: ({ children }) => <p className="leading-loose">{children}</p>,
        ul: ({ children }) => (
          <ul className="space-y-2 list-disc list-inside">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="space-y-2 list-decimal list-inside">{children}</ol>
        ),
        li: ({ children }) => {
          return <li className="mb-2 list-disc [&>p]:contents">{children}</li>;
        },
        blockquote: ({ children }) => (
          <blockquote className="space-y-2 border-l-4 pl-4 italic text-muted-foreground">
            {children}
          </blockquote>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        pre: ({ children }) => (
          <pre className="overflow-x-auto max-w-2xl border p-4 rounded-lg mb-4 border-border bg-muted/50 min-w-0">
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
      }}
      fallback={<div>Loading preview…</div>}
    >
      {content}
    </MarkdownHooks>
  );
}

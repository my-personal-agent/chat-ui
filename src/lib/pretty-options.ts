import type { LineElement, Options } from "rehype-pretty-code";

export const prettyOptions: Options = {
  theme: {
    light: "github-light",
    dark: "github-dark",
  },
  keepBackground: false,
  defaultLang: "text",
  onVisitLine(node: LineElement) {
    if (node.children.length === 0)
      node.children = [{ type: "text", value: " " }];
  },
  onVisitHighlightedLine(node: LineElement) {
    node.properties.className = node.properties.className ?? [];
    node.properties.className.push("line--highlighted");
  },
  onVisitHighlightedChars(node: LineElement) {
    node.properties.className = ["word--highlighted"];
  },
};

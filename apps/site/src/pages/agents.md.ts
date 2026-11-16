// /agents.md: the committed agents/README.md (generated from docs-src/agents/README.md), byte for byte.
const [doc] = Object.values(
  import.meta.glob("../../../../agents/README.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
) as string[];

export const GET = () =>
  new Response(doc, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });

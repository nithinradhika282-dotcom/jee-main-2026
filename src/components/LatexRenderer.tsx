"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface LatexRendererProps {
  content?: string;
  latex?: string;
  className?: string;
}

// In-memory cache for rendered KaTeX strings for instant rendering
const katexCache = new Map<string, string>();

const RAW_LATEX_REGEX = /(\\[a-zA-Z]+|[_^]\{?[0-9a-zA-Z]|\\times|\\pm|\\leq|\\geq|\\neq|\\approx)/;

const LatexRenderer = function LatexRenderer({ content, latex, className = "" }: LatexRendererProps) {
  const textSource = content ?? latex ?? "";

  const renderedHtml = useMemo(() => {
    if (!textSource) return "";

    const cacheKey = textSource;
    if (katexCache.has(cacheKey)) {
      return katexCache.get(cacheKey)!;
    }

    try {
      const text = textSource.trim();

      // Case 1: The entire content has NO $ or $$, but contains LaTeX commands (e.g. "\frac{u^2}{2g}", "20 \mu\text{F}")
      if (!text.includes("$") && RAW_LATEX_REGEX.test(text)) {
        try {
          const rendered = `<span class="inline-block px-0.5 text-sky-200 font-serif break-words">${katex.renderToString(
            text,
            { displayMode: false, throwOnError: false }
          )}</span>`;
          katexCache.set(cacheKey, rendered);
          return rendered;
        } catch {
          // If direct full render fails, proceed to mixed parser
        }
      }

      // Case 2: Normalize LaTeX bracket delimiters \[...\] -> $$...$$ and \(...\) -> $...$
      const normalized = text
        .replace(/\\\[([\s\S]*?)\\\]/g, "$$$$$1$$$$")
        .replace(/\\\(([\s\S]*?)\\\)/g, "$$$1$$");

      // Step 1: Split by block math $$...$$
      const parts = normalized.split(/(\$\$[\s\S]*?\$\$)/g);

      const html = parts
        .map((part) => {
          if (part.startsWith("$$") && part.endsWith("$$")) {
            const math = part.slice(2, -2).trim();
            try {
              return `<div class="my-2 overflow-x-auto py-1 text-center font-serif text-sky-300 break-words">${katex.renderToString(
                math,
                { displayMode: true, throwOnError: false }
              )}</div>`;
            } catch {
              return `<div class="my-2 text-center text-red-400 font-mono text-xs">${escapeHtml(
                math
              )}</div>`;
            }
          }

          // Step 2: Split by inline math $...$
          const inlineParts = part.split(/(\$[^\$]+?\$)/g);
          return inlineParts
            .map((subPart) => {
              if (subPart.startsWith("$") && subPart.endsWith("$") && subPart.length > 2) {
                const math = subPart.slice(1, -1);
                try {
                  return `<span class="inline-block px-0.5 text-sky-200 font-serif break-words">${katex.renderToString(
                    math,
                    { displayMode: false, throwOnError: false }
                  )}</span>`;
                } catch {
                  return `<code class="text-xs text-red-400 font-mono">${escapeHtml(math)}</code>`;
                }
              }

              // Check if this subpart itself contains un-delimited LaTeX macros (e.g. \frac, \mu, \Omega)
              if (RAW_LATEX_REGEX.test(subPart)) {
                try {
                  return `<span class="inline-block px-0.5 text-sky-200 font-serif break-words">${katex.renderToString(
                    subPart.trim(),
                    { displayMode: false, throwOnError: false }
                  )}</span>`;
                } catch {
                  // Fall back to regular text
                }
              }

              // Regular text: support bold **text** and newlines
              return escapeHtml(subPart)
                .replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold text-slate-100'>$1</strong>")
                .replace(/\n/g, "<br/>");
            })
            .join("");
        })
        .join("");

      katexCache.set(cacheKey, html);
      return html;
    } catch {
      return escapeHtml(textSource).replace(/\n/g, "<br/>");
    }
  }, [textSource]);

  return (
    <div
      className={`leading-relaxed tracking-normal select-text break-words ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

export default React.memo(LatexRenderer);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

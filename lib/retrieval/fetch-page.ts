import * as cheerio from "cheerio";

import { validateExternalUrl } from "./validate-url";

import { isAllowedByRobots } from "./robots";

export interface PageLink {
  url: string;
  text: string;
}

export interface RetrievedPage {
  url: string;
  title: string;
  text: string;
  links: PageLink[];
}

const MAX_PAGE_BYTES = 1_500_000;

export async function fetchPage(
  rawUrl: string,
  timeoutMs = 10000,
): Promise<RetrievedPage> {
  const validatedUrl = await validateExternalUrl(rawUrl);

  const allowed = await isAllowedByRobots(validatedUrl.toString());

  if (!allowed) {
    throw new Error(`Blocked by robots.txt: ${validatedUrl}`);
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(validatedUrl, {
      signal: controller.signal,

      headers: {
        "User-Agent": "InterviewPrepKit/1.0",
        Accept: "text/html,application/xhtml+xml",
      },

      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${validatedUrl}: ${response.status}`);
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (
      !contentType.includes("text/html") &&
      !contentType.includes("application/xhtml+xml")
    ) {
      throw new Error(`Unsupported content type: ${contentType}`);
    }

    const contentLength = Number(response.headers.get("content-length"));

    if (Number.isFinite(contentLength) && contentLength > MAX_PAGE_BYTES) {
      throw new Error("Page exceeds maximum allowed size");
    }

    /*
     * Read using ArrayBuffer so we can
     * enforce an actual byte limit even
     * when Content-Length is missing.
     */
    const buffer = await response.arrayBuffer();

    if (buffer.byteLength > MAX_PAGE_BYTES) {
      throw new Error("Page exceeds maximum allowed size");
    }

    const html = new TextDecoder().decode(buffer);

    const $ = cheerio.load(html);

    $("script, style, noscript, svg, iframe").remove();

    const title = $("title").first().text().replace(/\s+/g, " ").trim();

    const text = $("body").text().replace(/\s+/g, " ").trim();

    const links = new Map<string, string>();

    $("a[href]").each((_, element) => {
      const href = $(element).attr("href");

      if (!href) return;

      try {
        const resolved = new URL(href, validatedUrl);

        if (resolved.protocol !== "http:" && resolved.protocol !== "https:") {
          return;
        }

        resolved.hash = "";

        const linkText = $(element).text().replace(/\s+/g, " ").trim();

        if (!links.has(resolved.toString())) {
          links.set(resolved.toString(), linkText);
        }
      } catch {
        // malformed URL
      }
    });

    return {
      url: validatedUrl.toString(),

      title,

      text,

      links: [...links.entries()].map(([url, text]) => ({
        url,
        text,
      })),
    };
  } finally {
    clearTimeout(timeout);
  }
}

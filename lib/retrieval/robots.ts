interface RobotsRules {
  disallowed: string[];
}

const cache = new Map<string, RobotsRules>();

export async function getRobotsRules(pageUrl: string): Promise<RobotsRules> {
  const url = new URL(pageUrl);

  const origin = url.origin;

  if (cache.has(origin)) {
    return cache.get(origin)!;
  }

  try {
    const robotsUrl = new URL("/robots.txt", origin);

    const response = await fetch(robotsUrl, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      const rules = {
        disallowed: [],
      };

      cache.set(origin, rules);

      return rules;
    }

    const text = await response.text();

    const lines = text.split(/\r?\n/);

    const disallowed: string[] = [];

    let appliesToUs = false;

    for (const rawLine of lines) {
      const line = rawLine.split("#")[0].trim();

      if (!line) continue;

      const colon = line.indexOf(":");

      if (colon === -1) continue;

      const key = line.slice(0, colon).trim().toLowerCase();

      const value = line.slice(colon + 1).trim();

      if (key === "user-agent") {
        appliesToUs =
          value === "*" || value.toLowerCase().includes("interviewprepkit");

        continue;
      }

      if (key === "disallow" && appliesToUs && value) {
        disallowed.push(value);
      }
    }

    const rules = {
      disallowed,
    };

    cache.set(origin, rules);

    return rules;
  } catch {
    /*
     * robots.txt failure should not
     * crash the entire research run.
     */
    return {
      disallowed: [],
    };
  }
}

export async function isAllowedByRobots(pageUrl: string) {
  const url = new URL(pageUrl);

  const rules = await getRobotsRules(pageUrl);

  return !rules.disallowed.some(
    (path) => path === "/" || url.pathname.startsWith(path),
  );
}

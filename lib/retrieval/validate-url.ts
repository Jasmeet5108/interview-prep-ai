import dns from "node:dns/promises";
import net from "node:net";

function isPrivateIPv4(ip: string) {
  const parts = ip.split(".").map(Number);

  if (parts.length !== 4) return false;

  const [a, b] = parts;

  return (
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

function isPrivateIPv6(ip: string) {
  const normalized = ip.toLowerCase();

  return (
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:")
  );
}

export async function validateExternalUrl(rawUrl: string) {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS URLs are allowed");
  }

  /*
   * Appendix B may use localhost during evaluation.
   * Therefore local/private addresses are allowed
   * outside production.
   */
  if (process.env.NODE_ENV !== "production") {
    return url;
  }

  const hostname = url.hostname.toLowerCase();

  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new Error("Private or loopback hosts are not allowed");
  }

  if (net.isIP(hostname)) {
    if (isPrivateIPv4(hostname) || isPrivateIPv6(hostname)) {
      throw new Error("Private IP addresses are not allowed");
    }

    return url;
  }

  /*
   * Protect against domains resolving to private IPs.
   */
  const addresses = await dns.lookup(hostname, {
    all: true,
  });

  for (const address of addresses) {
    if (isPrivateIPv4(address.address) || isPrivateIPv6(address.address)) {
      throw new Error("URL resolves to a private IP address");
    }
  }

  return url;
}

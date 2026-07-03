import fs from "fs";
import path from "path";

let cachedLogo: Buffer | null = null;

/** Reads the brand logo from disk once and caches it for @react-pdf/renderer <Image> sources. */
export function getLogoBuffer(): Buffer {
  if (!cachedLogo) {
    cachedLogo = fs.readFileSync(path.join(process.cwd(), "public", "logo-quiroga.png"));
  }
  return cachedLogo;
}

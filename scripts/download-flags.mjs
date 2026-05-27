import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const countriesPath = path.join(rootDir, "src", "data", "countries.json");
const flagsDir = path.join(rootDir, "public", "flags");

const countries = JSON.parse(fs.readFileSync(countriesPath, "utf8"));

if (!fs.existsSync(flagsDir)) {
  fs.mkdirSync(flagsDir, { recursive: true });
}

async function downloadFlag(country) {
  const fileName = `${country.iso}.svg`;
  const filePath = path.join(flagsDir, fileName);

  if (fs.existsSync(filePath)) {
    return { iso: country.iso, status: "skipped" };
  }

  const url = `https://flagcdn.com/${country.iso}.svg`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { iso: country.iso, status: "failed", reason: response.statusText };
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    return { iso: country.iso, status: "downloaded" };
  } catch (error) {
    return {
      iso: country.iso,
      status: "failed",
      reason: error instanceof Error ? error.message : "unknown",
    };
  }
}

async function main() {
  const batchSize = 10;
  const results = [];

  for (let index = 0; index < countries.length; index += batchSize) {
    const batch = countries.slice(index, index + batchSize);
    const batchResults = await Promise.all(batch.map(downloadFlag));
    results.push(...batchResults);
    process.stdout.write(`\rProgresso: ${Math.min(index + batchSize, countries.length)}/${countries.length}`);
  }

  process.stdout.write("\n");

  const downloaded = results.filter((item) => item.status === "downloaded").length;
  const skipped = results.filter((item) => item.status === "skipped").length;
  const failed = results.filter((item) => item.status === "failed");

  console.log(`Baixadas: ${downloaded} | Já existiam: ${skipped} | Falhas: ${failed.length}`);

  if (failed.length > 0) {
    console.log("Falhas:", failed.map((item) => `${item.iso} (${item.reason})`).join(", "));
  }
}

main();

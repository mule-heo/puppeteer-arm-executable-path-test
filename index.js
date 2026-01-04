import puppeteer from "puppeteer";
import process from "process";
import fs from "fs";

const isArm = process.arch === "arm64" || process.arch === "arm";
if (isArm) {
  console.warn(
    "Warning: You are running on an ARM architecture. Puppeteer may have limited support on ARM-based systems."
  );
}

const findExecutablePath = () => {
  if (isArm) {
    return puppeteer.executablePath();
  }
  const paths = [
    "/usr/bin/chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
  ];
  return paths.find((p) => fs.existsSync(p));
};

const run = async () => {
  console.log(puppeteer.executablePath());
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: findExecutablePath(),
    });
    const page = await browser.newPage();
    await page.goto("https://example.com");
    const title = await page.title();
    console.log(`Title: ${title}`);
    await browser.close();
  } catch (error) {
    console.error("Error launching Puppeteer:", error);
  }
  // Keep the process alive for inspection
  setInterval(() => {}, 1000);
};

await run();

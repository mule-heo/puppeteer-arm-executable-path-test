import playwright from "playwright";
import process from "process";
import fs from "fs";

const isArm = process.arch === "arm64" || process.arch === "arm";
if (isArm) {
  console.warn(
    "Warning: You are running on an ARM architecture. Puppeteer may have limited support on ARM-based systems."
  );
}

const findExecutablePath = () => {
  // if (isArm) {
  //   return puppeteer.executablePath();
  // }
  const paths = [
    "/usr/bin/chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
  ];
  return paths.find((p) => fs.existsSync(p));
};

const run = async () => {
  try {
    const browser = await playwright.chromium.launch({
      headless: true,
      executablePath: undefined,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto("https://example.com");
    const title = await page.title();
    console.log(`Title: ${title}`);
    await browser.close();
  } catch (error) {
    console.error("Error launching Playwright:", error);
  }
  // Keep the process alive for inspection
  setInterval(() => {}, 1000);
};

await run();

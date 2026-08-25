import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, devices } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const deploymentsPath = path.join(root, "resources/deploymentsList.json");
const outDir = path.join(root, "public/images/deployments");

const DESKTOP_VIEWPORT = { width: 1440, height: 900 };

function getMobileProfile(item) {
  if (item.mobileOrientation === "landscape" || item.id === "tituah-staging") {
    return {
      ...devices["iPhone 14 landscape"],
      locale: "en-US",
    };
  }

  return {
    ...devices["iPhone 14"],
    locale: "en-US",
  };
}

function getMobileZoom(item) {
  if (typeof item.mobileCaptureZoom === "number") return item.mobileCaptureZoom;
  if (item.id === "construmates-staging") return 0.82;
  return 1;
}

function getWaitMs(item, kind) {
  if (kind === "mobile" && item.id === "construmates-staging") return 4500;
  if (kind === "mobile" && item.id === "tituah-staging") return 3500;
  return 2000;
}

async function capture(context, url, outFile, waitMs, { zoom = 1 } = {}) {
  const page = await context.newPage();

  const takeShot = async () => {
    if (zoom !== 1) {
      await page.evaluate((scale) => {
        document.documentElement.style.zoom = String(scale);
      }, zoom);
      await page.waitForTimeout(400);
    }
    await page.screenshot({ path: outFile, fullPage: false });
  };

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    await page.waitForTimeout(waitMs);
    await takeShot();
    return { ok: true, zoom: zoom !== 1 ? zoom : undefined };
  } catch (error) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(Math.max(1200, waitMs - 500));
      await takeShot();
      return { ok: true, note: "domcontentloaded fallback", zoom: zoom !== 1 ? zoom : undefined };
    } catch (fallbackError) {
      return { ok: false, error: fallbackError.message || String(fallbackError) };
    }
  } finally {
    await page.close();
  }
}

async function main() {
  const raw = await readFile(deploymentsPath, "utf8");
  const deployments = JSON.parse(raw);
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const item of deployments) {
    if (!item.url) continue;

    const desktopFile = `${item.id}-desktop.png`;
    const mobileFile = `${item.id}-mobile.png`;
    const desktopPath = `/images/deployments/${desktopFile}`;
    const mobilePath = `/images/deployments/${mobileFile}`;

    process.stdout.write(`Capturing ${item.name} (${item.url})\n`);

    const desktopContext = await browser.newContext({
      viewport: DESKTOP_VIEWPORT,
      locale: "en-US",
    });
    const desktopResult = await capture(
      desktopContext,
      item.url,
      path.join(outDir, desktopFile),
      getWaitMs(item, "desktop")
    );
    await desktopContext.close();
    console.log(
      `  desktop: ${desktopResult.ok ? "saved" : `failed (${desktopResult.error})`}${
        desktopResult.note ? ` (${desktopResult.note})` : ""
      }`
    );

    const mobileContext = await browser.newContext(getMobileProfile(item));
    const mobileZoom = getMobileZoom(item);
    const mobileResult = await capture(
      mobileContext,
      item.url,
      path.join(outDir, mobileFile),
      getWaitMs(item, "mobile"),
      { zoom: mobileZoom }
    );
    await mobileContext.close();
    console.log(
      `  mobile:  ${mobileResult.ok ? "saved" : `failed (${mobileResult.error})`}${
        mobileResult.note ? ` (${mobileResult.note})` : ""
      }${mobileZoom !== 1 ? ` [zoom ${mobileZoom}]` : ""}${
        item.mobileOrientation === "landscape" || item.id === "tituah-staging" ? " [landscape]" : ""
      }`
    );

    if (desktopResult.ok) {
      item.imagesDesktop = [desktopPath];
    } else {
      delete item.imagesDesktop;
    }

    if (mobileResult.ok) {
      item.imagesMobile = [mobilePath];
    } else {
      delete item.imagesMobile;
    }

    delete item.images;

    results.push({
      id: item.id,
      desktop: desktopResult.ok,
      mobile: mobileResult.ok,
      imagesDesktop: item.imagesDesktop || [],
      imagesMobile: item.imagesMobile || [],
    });
  }

  await browser.close();

  await writeFile(deploymentsPath, `${JSON.stringify(deployments, null, 2)}\n`, "utf8");

  const okCount = results.filter((r) => r.desktop && r.mobile).length;
  console.log(`\nDone: ${okCount}/${results.length} sites with both desktop + mobile screenshots.`);
  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

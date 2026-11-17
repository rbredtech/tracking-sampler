const puppeteer = require("puppeteer");

// app.ts serves the sampler with an in-sample range of 5-20 and this device on the list
const LISTED_DID = "00000000-0000-4000-8000-000000000001";
const UNLISTED_DID = "00000000-0000-4000-8000-000000000002";
const NON_IFRAME_USER_AGENT = "HbbTV/1.1.1 (+PVR;Humax;HD FOX+;1.00.20;1.0;)CE-HTML/1.0 ANTGalio/3.3.0.26.03";

function call(page, method, ...args) {
  return page.evaluate(
    (method, args) =>
      new Promise((resolve) => {
        window.__tvi_sampler[method].apply(null, args.concat([resolve]));
      }),
    method,
    args,
  );
}

describe.each([true, false])("Sampler eligibility - iFrame: %s", (iFrame) => {
  let page;
  let eligibilityScriptRequests;
  let setEligibleRequests;

  beforeEach(async () => {
    const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    page = await browser.newPage();
    if (!iFrame) {
      await page.setUserAgent(NON_IFRAME_USER_AGENT);
    }
    eligibilityScriptRequests = [];
    setEligibleRequests = [];
    page.on("request", (request) => {
      if (request.url().indexOf("/test/eligibility.js") !== -1) eligibilityScriptRequests.push(request.url());
      if (request.url().indexOf("/set_eligible.js") !== -1) setEligibleRequests.push(request.url());
    });
    await page.goto("http://localhost:8000");
  }, 10000);

  afterEach(async () => {
    await page.browser().close();
  }, 5000);

  async function reloadOutOfSample(did) {
    if (did) {
      await page.setCookie({ name: "did", value: did, url: "http://localhost:8000" });
    }
    await call(page, "setValidTechCookie");
    await call(page, "setPercentile", 50);
    await page.reload();
  }

  // In iframe mode, the page only gets _shouldCheckEligibility once the sampler iframe has loaded
  async function roundStored() {
    await page.waitForFunction(() => typeof window.__tvi_sampler._shouldCheckEligibility === "function");
    for (let i = 0; i < 30; i++) {
      if (!(await call(page, "_shouldCheckEligibility"))) return;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error("The eligibility round was not stored");
  }

  async function settle() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  it("should not check a device in sample", async () => {
    await settle();

    expect(await call(page, "checkInSample")).toBe(true);
    expect(eligibilityScriptRequests).toEqual([]);
  }, 10000);

  it("should mark a device on the list eligible", async () => {
    const answered = page.waitForResponse((response) => response.url().indexOf("/set_eligible.js") !== -1);
    await reloadOutOfSample(LISTED_DID);
    await answered;
    await page.waitForFunction(() => new Promise((resolve) => window.__tvi_sampler.checkInSample(resolve)), { timeout: 3000 });

    expect(setEligibleRequests).toHaveLength(1);
    expect(setEligibleRequests[0]).toMatch(new RegExp(`/set_eligible\\.js\\?did=${LISTED_DID}&ts=\\d+$`));
  }, 10000);

  it("should not mark a device that is not on the list, nor ask again in the same round", async () => {
    const answered = page.waitForResponse((response) => response.url().indexOf("/set_eligible.js") !== -1);
    await reloadOutOfSample(UNLISTED_DID);
    await answered;
    await roundStored();

    expect(await call(page, "checkInSample")).toBe(false);

    await page.reload();
    await settle();

    expect(eligibilityScriptRequests).toHaveLength(1);
    expect(setEligibleRequests).toHaveLength(1);
  }, 10000);

  it("should not ask the backend without a device ID, nor ask again in the same round", async () => {
    await reloadOutOfSample();
    await roundStored();
    await page.reload();
    await settle();

    expect(await call(page, "checkInSample")).toBe(false);
    expect(eligibilityScriptRequests).toHaveLength(1);
    expect(setEligibleRequests).toEqual([]);
  }, 10000);

  it("should check again once the testing module is reset", async () => {
    await reloadOutOfSample();
    await roundStored();
    await call(page, "reset");
    await call(page, "setValidTechCookie");
    await call(page, "setPercentile", 50);
    await page.reload();
    await settle();

    expect(eligibilityScriptRequests).toHaveLength(2);
  }, 10000);
});

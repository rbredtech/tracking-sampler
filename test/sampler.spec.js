const puppeteer = require("puppeteer");

let page;

describe.each([true, false])("Tracking Sampler - iFrame: %s", (iFrame) => {
  beforeAll(async () => {
    const userAgent = !iFrame ? "HbbTV/1.1.1 (+PVR;Humax;HD FOX+;1.00.20;1.0;)CE-HTML/1.0 ANTGalio/3.3.0.26.03" : undefined;
    const browser = await puppeteer.launch({ dumpio: false, args: ["--disable-gpu"] });
    page = await browser.newPage();
    if (userAgent) {
      await page.setUserAgent(userAgent);
    }
  }, 10000);

  afterAll(async () => {
    await page.browser().close();
  }, 10000);

  beforeEach(async () => {
    await page.goto(`http://localhost:8080`);
    await page.waitForFunction(() => document.readyState === "complete");
  }, 10000);

  it("should start off with out-of-sample (tech cookie invalid)", async () => {
    const techCookieValid = await page.evaluate(() => {
      return new Promise((resolve) => {
        window.__tvi_sampler.isTechCookieValid(resolve);
      });
    });
    expect(techCookieValid).toBe(false);

    const inSample = await page.evaluate(() => {
      return new Promise((resolve) => {
        window.__tvi_sampler.checkInSample(resolve);
      });
    });
    expect(inSample).toBe(false);
  });

  describe("after technical cookie has become valid", () => {
    beforeAll(async () => {
      await page.evaluate(() => {
        return new Promise((resolve) => {
          window.__tvi_sampler.setValidTechCookie(resolve);
        });
      });
      await page.reload();
    }, 10000);

    describe("and percentile is below threshold", () => {
      beforeAll(async () => {
        await page.evaluate(() => {
          return new Promise((resolve) => {
            window.__tvi_sampler.setPercentile(5, resolve);
          });
        });
        await page.reload();
      }, 10000);

      it("should be in-sample", async () => {
        const inSample = await page.evaluate(() => {
          return new Promise((resolve) => {
            window.__tvi_sampler.checkInSample(resolve);
          });
        });
        expect(inSample).toBe(true);
      });
    });

    describe("and percentile is above threshold", () => {
      beforeAll(async () => {
        await page.evaluate(() => {
          return new Promise((resolve) => {
            window.__tvi_sampler.setPercentile(50, resolve);
          });
        });
        await page.reload();
      }, 10000);

      it("should be out-of-sample", async () => {
        const inSample = await page.evaluate(() => {
          return new Promise((resolve) => {
            window.__tvi_sampler.checkInSample(resolve);
          });
        });
        expect(inSample).toBe(false);
      });
    });
  });
});

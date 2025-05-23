const puppeteer = require("puppeteer");

let page;

const cases = [true, false];

describe.each(cases)("Tracking Sampler - iFrame: %s", (iFrame) => {
  beforeAll(async () => {
    const userAgent = !iFrame ? "HbbTV/1.1.1 (+PVR;Humax;HD FOX+;1.00.20;1.0;)CE-HTML/1.0 ANTGalio/3.3.0.26.03" : undefined;
    const browser = await puppeteer.launch({ dumpio: false, args: ["--disable-gpu", "--no-sandbox"] });
    page = await browser.newPage();
    if (userAgent) {
      await page.setUserAgent(userAgent);
    }
    await page.goto(`http://localhost:8080`);
    await page.waitForFunction(() => document.readyState === "complete");
  }, 5000);

  afterAll(async () => {
    await page.browser().close();
  }, 5000);

  describe("before tech cookie becomes valid", () => {
    it("should always be in sample", async () => {
      const techCookieValid = await page.evaluate(() => {
        return new Promise((resolve) => {
          window.__tvi_sampler.isTechCookieValid(resolve);
        });
      });
      const inSample = await page.evaluate(() => {
        return new Promise((resolve) => {
          window.__tvi_sampler.checkInSample(resolve);
        });
      });
      const percentile = await page.evaluate(() => {
        return new Promise((resolve) => {
          window.__tvi_sampler.getPercentile(resolve);
        });
      });

      expect(techCookieValid).toBe(false);
      expect(inSample).toBe(true);
      expect(percentile).toBe(undefined);
    });
  });

  describe("after technical cookie has become valid", () => {
    beforeAll(async () => {
      await page.evaluate(() => {
        return new Promise((resolve) => {
          window.__tvi_sampler.setValidTechCookie(resolve);
        });
      });
      await page.reload();
    }, 5000);

    describe("and percentile is below threshold", () => {
      beforeAll(async () => {
        await page.evaluate(() => {
          return new Promise((resolve) => {
            window.__tvi_sampler.setPercentile(5, resolve);
          });
        });
        await page.reload();
      }, 5000);

      it("should be in-sample", async () => {
        const techCookieValid = await page.evaluate(() => {
          return new Promise((resolve) => {
            window.__tvi_sampler.isTechCookieValid(resolve);
          });
        });
        const percentile = await page.evaluate(() => {
          return new Promise((resolve) => {
            window.__tvi_sampler.getPercentile(resolve);
          });
        });
        const inSample = await page.evaluate(() => {
          return new Promise((resolve) => {
            window.__tvi_sampler.checkInSample(resolve);
          });
        });

        expect(techCookieValid).toBe(true);
        expect(percentile).toBe(5);
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
      }, 5000);

      it("should be out-of-sample", async () => {
        const techCookieValid = await page.evaluate(() => {
          return new Promise((resolve) => {
            window.__tvi_sampler.isTechCookieValid(resolve);
          });
        });
        const percentile = await page.evaluate(() => {
          return new Promise((resolve) => {
            window.__tvi_sampler.getPercentile(resolve);
          });
        });
        const inSample = await page.evaluate(() => {
          return new Promise((resolve) => {
            window.__tvi_sampler.checkInSample(resolve);
          });
        });

        expect(techCookieValid).toBe(true);
        expect(percentile).toBe(50);
        expect(inSample).toBe(false);
      });
    });
  });
});

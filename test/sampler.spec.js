const puppeteer = require("puppeteer");

let page;

const cases = [
  [true, true], // [iFrame, localStorage]
  [true, false],
  [false, true],
  [false, false],
];

describe.each(cases)("Tracking Sampler - iFrame: %s, localStorage: %s", (iFrame, localStorage) => {
  beforeAll(async () => {
    const args = ["--no-sandbox", "--disable-setuid-sandbox"];
    if (!localStorage) {
      args.push("--disable-local-storage");
    }
    const browser = await puppeteer.launch({ args });
    page = await browser.newPage();
    if (!iFrame) {
      await page.setUserAgent("HbbTV/1.1.1 (+PVR;Humax;HD FOX+;1.00.20;1.0;)CE-HTML/1.0 ANTGalio/3.3.0.26.03");
    }
    await page.goto(`http://localhost:8000`);
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

    // app.ts serves the sampler with an in-sample range of 5-20
    describe.each([
      ["below lower bound", 4, false],
      ["at lower bound", 5, true],
      ["within range", 12, true],
      ["at upper bound", 20, true],
      ["above upper bound", 21, false],
      ["far above upper bound", 50, false],
    ])("and percentile is %s (%i)", (_, storedPercentile, expectedInSample) => {
      beforeAll(async () => {
        await page.evaluate((p) => {
          return new Promise((resolve) => {
            window.__tvi_sampler.setPercentile(p, resolve);
          });
        }, storedPercentile);
        await page.reload();
      }, 5000);

      it(`should be ${expectedInSample ? "in-sample" : "out-of-sample"}`, async () => {
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
        expect(percentile).toBe(storedPercentile);
        expect(inSample).toBe(expectedInSample);
      });
    });

    describe("and device is set eligible while percentile is above threshold", () => {
      let eligible;

      beforeAll(async () => {
        eligible = await page.evaluate(() => {
          return new Promise((resolve) => {
            window.__tvi_sampler._setEligible(true, resolve);
          });
        });
      }, 5000);

      it("should report the device as eligible", () => {
        expect(eligible).toBe(true);
      });

      it("should be in-sample without a reload", async () => {
        const inSample = await page.evaluate(() => {
          return new Promise((resolve) => {
            window.__tvi_sampler.checkInSample(resolve);
          });
        });

        expect(inSample).toBe(true);
      });
    });

    describe("and page is reloaded while device is eligible", () => {
      beforeAll(async () => {
        await page.reload();
      }, 5000);

      it("should be in-sample", async () => {
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

        expect(percentile).toBe(50);
        expect(inSample).toBe(true);
      });
    });

    describe("and eligibility is removed again", () => {
      let eligible;

      beforeAll(async () => {
        eligible = await page.evaluate(() => {
          return new Promise((resolve) => {
            window.__tvi_sampler._setEligible(false, resolve);
          });
        });
      }, 5000);

      it("should report the device as not eligible", () => {
        expect(eligible).toBe(false);
      });

      it("should be out-of-sample without a reload", async () => {
        const inSample = await page.evaluate(() => {
          return new Promise((resolve) => {
            window.__tvi_sampler.checkInSample(resolve);
          });
        });

        expect(inSample).toBe(false);
      });
    });

    describe("and page is reloaded after eligibility was removed", () => {
      beforeAll(async () => {
        await page.reload();
      }, 5000);

      it("should be out-of-sample", async () => {
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

        expect(percentile).toBe(50);
        expect(inSample).toBe(false);
      });
    });

    describe("and testing module is reset while device is eligible", () => {
      beforeAll(async () => {
        await page.evaluate(() => {
          return new Promise((resolve) => {
            window.__tvi_sampler._setEligible(true, resolve);
          });
        });
        await page.evaluate(() => {
          return new Promise((resolve) => {
            window.__tvi_sampler.reset(resolve);
          });
        });
        await page.evaluate(() => {
          return new Promise((resolve) => {
            window.__tvi_sampler.setValidTechCookie(resolve);
          });
        });
        await page.evaluate(() => {
          return new Promise((resolve) => {
            window.__tvi_sampler.setPercentile(50, resolve);
          });
        });
        await page.reload();
      }, 5000);

      it("should no longer be eligible", async () => {
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

describe.each([true, false])("Tracking Sampler without storage - iFrame: %s", (iFrame) => {
  beforeAll(async () => {
    const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-local-storage"] });
    page = await browser.newPage();
    const cdp = await page.createCDPSession();
    await cdp.send("Emulation.setDocumentCookieDisabled", { disabled: true });
    if (!iFrame) {
      await page.setUserAgent("HbbTV/1.1.1 (+PVR;Humax;HD FOX+;1.00.20;1.0;)CE-HTML/1.0 ANTGalio/3.3.0.26.03");
    }
    await page.goto(`http://localhost:8000`);
  }, 5000);

  afterAll(async () => {
    await page.browser().close();
  }, 5000);

  it("should not report the device as eligible when the flag cannot be stored", async () => {
    const eligible = await page.evaluate(() => {
      return new Promise((resolve) => {
        window.__tvi_sampler._setEligible(true, resolve);
      });
    });

    expect(eligible).toBe(false);
  });
});

describe.each([true, false])("Tracking Sampler with a malformed host app cookie - iFrame: %s", (iFrame) => {
  beforeAll(async () => {
    const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    page = await browser.newPage();
    if (!iFrame) {
      await page.setUserAgent("HbbTV/1.1.1 (+PVR;Humax;HD FOX+;1.00.20;1.0;)CE-HTML/1.0 ANTGalio/3.3.0.26.03");
    }
    // not valid URI encoding, as written by e.g. escape("ä") or a raw "%"
    await page.setCookie({ name: "host_app", value: "100%", url: "http://localhost:8000" });
    await page.goto(`http://localhost:8000`);
  }, 5000);

  afterAll(async () => {
    await page.browser().close();
  }, 5000);

  it("should still answer checkInSample", async () => {
    const inSample = await page.evaluate(() => {
      return new Promise((resolve) => {
        window.__tvi_sampler.checkInSample(resolve);
      });
    });

    expect(typeof inSample).toBe("boolean");
  });
});

// Chrome honours max-age, so check the written cookie strings for the expires date older browsers depend on
describe("Tracking Sampler cookie expiry - iFrame: false", () => {
  beforeAll(async () => {
    const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-local-storage"] });
    page = await browser.newPage();
    await page.setUserAgent("HbbTV/1.1.1 (+PVR;Humax;HD FOX+;1.00.20;1.0;)CE-HTML/1.0 ANTGalio/3.3.0.26.03");
    await page.evaluateOnNewDocument(() => {
      const cookie = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");
      window.__cookieWrites = [];
      Object.defineProperty(document, "cookie", {
        get: () => cookie.get.call(document),
        set: (value) => {
          window.__cookieWrites.push(value);
          cookie.set.call(document, value);
        },
      });
    });
    await page.goto(`http://localhost:8000`);
  }, 5000);

  afterAll(async () => {
    await page.browser().close();
  }, 5000);

  it("should set an expires date about 2 years ahead when storing", async () => {
    const writes = await page.evaluate(() => window.__cookieWrites);
    const techCookieWrite = writes.find((write) => write.indexOf("x-sampler-t=") === 0);
    const expires = /expires=([^;]+)/.exec(techCookieWrite);

    expect(expires).not.toBeNull();
    expect(new Date(expires[1]).getTime()).toBeGreaterThan(Date.now() + 1000 * 60 * 60 * 24 * 365);
  });

  it("should set an expires date in the past when deleting", async () => {
    await page.evaluate(() => {
      return new Promise((resolve) => {
        window.__tvi_sampler.reset(resolve);
      });
    });
    const writes = await page.evaluate(() => window.__cookieWrites);
    const techCookieDelete = writes.find((write) => write.indexOf("x-sampler-t=;") === 0);
    const expires = /expires=([^;]+)/.exec(techCookieDelete);

    expect(expires).not.toBeNull();
    expect(new Date(expires[1]).getTime()).toBeLessThan(Date.now());
  });
});

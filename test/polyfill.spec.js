const puppeteer = require("puppeteer");

let page;

beforeAll(async () => {
  const browser = await puppeteer.launch({ dumpio: false, args: ["--disable-gpu", "--no-sandbox"] });
  page = await browser.newPage();
  await page.goto(`http://localhost:8080`);
  await page.waitForFunction(() => document.readyState === "complete");
}, 5000);

afterAll(async () => {
  await page.browser().close();
}, 5000);

describe("Polyfills", () => {
  test("verify native JSON APIs are not available", async () => {
    const nativeJsonApi = await page.evaluate(
      () =>
        new Promise((resolve) => {
          resolve(window.JSON);
        }),
    );
    expect(nativeJsonApi).toEqual(null);
  });

  describe("JSON.stringify polyfill (window.jsonStringify)", () => {
    test("should create correct string representation of object", async () => {
      const stringified = await page.evaluate(
        () =>
          new Promise((resolve) => {
            resolve(
              window.jsonStringify({
                name: "Zwonimir",
                number: 29,
                infinity: Infinity,
                boolean: true,
                null: null,
                undefined: undefined,
                nAn: NaN,
                stringArray: ["html", "css", "react"],
                numberArray: [1, 2, 3],
                object: {
                  city: "Salzburg",
                  state: "Salzburg",
                  zip: 5023,
                  anotherArray: ["test", 1],
                },
              }),
            );
          }),
      );
      expect(stringified).toEqual(
        JSON.stringify({
          name: "Zwonimir",
          number: 29,
          infinity: Infinity,
          boolean: true,
          null: null,
          undefined: undefined,
          nAn: NaN,
          stringArray: ["html", "css", "react"],
          numberArray: [1, 2, 3],
          object: {
            city: "Salzburg",
            state: "Salzburg",
            zip: 5023,
            anotherArray: ["test", 1],
          },
        }),
      );
    });
  });

  describe("JSON.parse polyfill (window.jsonParse)", () => {
    test("should parse string representation of object correctly", async () => {
      const parsed = await page.evaluate(
        () =>
          new Promise((resolve) => {
            resolve(
              window.jsonParse(
                '{"name":"Zwonimir","number":29,"infinity":null,"boolean":true,"null":null,"nAn":null,"stringArray":["html","css","react"],"numberArray":[1,2,3],"object":{"city":"Salzburg","state":"Salzburg","zip":5023,"anotherArray":["test",1]}}',
              ),
            );
          }),
      );
      expect(parsed).toEqual(
        JSON.parse(
          '{"name":"Zwonimir","number":29,"infinity":null,"boolean":true,"null":null,"nAn":null,"stringArray":["html","css","react"],"numberArray":[1,2,3],"object":{"city":"Salzburg","state":"Salzburg","zip":5023,"anotherArray":["test",1]}}',
        ),
      );
    });
  });
});

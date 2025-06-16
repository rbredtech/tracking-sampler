import ejs, { renderFile } from "ejs";
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';

ejs.delimiter = "*";
ejs.openDelimiter = "__ejs(/";
ejs.closeDelimiter = "/);";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { HTTP_PORT, SAMPLER_HOST, SAMPLER_PATH, COOKIE_DOMAIN, TECH_COOKIE_NAME, PERCENTILE_COOKIE_NAME, TECHNICAL_COOKIE_MIN_AGE } = process.env;

const app = express();

app.set("views", path.join(__dirname, "/src"));
app.engine("html", renderFile);
app.engine("js", renderFile);
app.set("view engine", "ejs");

app.get("*", async function(req, res) {
  const techCookieValue = parseInt(req.query.x || req.cookies?.[String(TECH_COOKIE_NAME)] || Date.now());
  if (!req.cookies?.[String(TECH_COOKIE_NAME)]) {
    res.cookie(String(TECH_COOKIE_NAME), techCookieValue, {
      maxAge: 63072000000,
      domain: COOKIE_DOMAIN,
    });
  }

  const techCookieMinAge = TECHNICAL_COOKIE_MIN_AGE ? parseInt(TECHNICAL_COOKIE_MIN_AGE) : (1000 * 60 * 60 * 24 * 2);
  const techCookiePassed = Date.now() - techCookieMinAge > techCookieValue;

  const percentileCookieValue = parseInt(req.query.p || req.cookies?.[String(PERCENTILE_COOKIE_NAME)] || 0);

  if (techCookiePassed && !req.cookies?.[String(PERCENTILE_COOKIE_NAME)]) {
    res.cookie(String(PERCENTILE_COOKIE_NAME), percentileCookieValue, {
      maxAge: 63072000000,
      domain: COOKIE_DOMAIN,
    });
  }

  try {
    const rendered = (await renderFile(path.join(__dirname, "src", req.url), {
      IN_SAMPLE_PERCENTILE: 10,
      IN_SAMPLE_WITHOUT_TC: true,
      __CONFIG_NAME: null,
    }))
      .replaceAll("{{SAMPLER_HOST}}", SAMPLER_HOST ?? "localhost:4000")
      .replaceAll("{{SAMPLER_PATH}}", SAMPLER_PATH ?? "/")
      .replaceAll("{{TECH_COOKIE_NAME}}", TECH_COOKIE_NAME ?? "x-sampler-t")
      .replaceAll("{{TECH_COOKIE_VALUE}}", techCookieValue.toString())
      .replaceAll("{{TECHNICAL_COOKIE_MIN_AGE}}", techCookieMinAge.toString())
      .replaceAll("{{PERCENTILE_COOKIE_NAME}}", PERCENTILE_COOKIE_NAME ?? "x-sampler-p")
      .replaceAll("{{PERCENTILE_COOKIE_VALUE}}", percentileCookieValue.toString());

    res.send(rendered);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
});

app.listen(HTTP_PORT ?? 4000);
console.info(`serving sampler scripts at http://localhost:${HTTP_PORT ?? 4000}`);

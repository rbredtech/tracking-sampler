import cookieParser from "cookie-parser";
import ejs, { renderFile } from "ejs";
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';

ejs.delimiter = "*";
ejs.openDelimiter = "__ejs(/";
ejs.closeDelimiter = "/);";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { HTTP_PORT, SAMPLER_HOST, SAMPLER_PATH, COOKIE_DOMAIN, TECH_COOKIE_NAME, PERCENTILE_COOKIE_NAME, TECH_COOKIE_MIN_AGE } = process.env;
const img = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNiYAAAAAkAAxkR2eQAAAAASUVORK5CYII=", "base64");

const app = express();

app.set("views", path.join(__dirname, "/src"));
app.engine("html", renderFile);
app.engine("js", renderFile);
app.set("view engine", "ejs");
app.use(cookieParser());

const techCookieName = TECH_COOKIE_NAME ?? "x-sampler-t";
const percentileCookieName = PERCENTILE_COOKIE_NAME ?? "x-sampler-p"

app.get("/set-percentile", async function(req, res) {
  if (!req.query.p) {
    res.status(400).send("No percentile submitted");
    return;
  }

  const percentile = parseInt(req.query.p.toString());

  res.cookie(percentileCookieName, percentile, {
    maxAge: 63072000000,
    domain: COOKIE_DOMAIN,
  });

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Length", img.length);
  res.send(img);
});

app.get("/set-valid-tech-cookie", async function(req, res) {
  if (!req.query.x) {
    res.status(400).send("No tech cookie submitted");
    return;
  }

  const techCookieValue = parseInt(req.query.x.toString());

  res.cookie(techCookieName, techCookieValue, {
    maxAge: 63072000000,
    domain: COOKIE_DOMAIN,
  });

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Length", img.length);
  res.send(img);
});

app.get("/reset", async function(_, res) {
  res.cookie(techCookieName, "", {
    maxAge: 0,
    domain: COOKIE_DOMAIN,
  });
  res.cookie(percentileCookieName, "", {
    maxAge: 0,
    domain: COOKIE_DOMAIN,
  });

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Length", img.length);
  res.send(img);
});

app.get("*", async function(req, res) {
  const techCookieValue = parseInt(req.query.x || req.cookies?.[techCookieName] || Date.now());
  if (!req.cookies?.[techCookieName]) {
    res.cookie(techCookieName, techCookieValue, {
      maxAge: 63072000000,
      domain: COOKIE_DOMAIN,
    });
  }

  const techCookieMinAge = TECH_COOKIE_MIN_AGE ? parseInt(TECH_COOKIE_MIN_AGE) : (1000 * 60 * 60 * 24 * 2);
  const techCookiePassed = Date.now() - techCookieMinAge > techCookieValue;

  const percentileCookieValue = parseInt(req.query.p || req.cookies?.[percentileCookieName] || Math.floor(Math.random() * 100) + 1);

  if (techCookiePassed && !req.cookies?.[percentileCookieName]) {
    res.cookie(percentileCookieName, percentileCookieValue, {
      maxAge: 63072000000,
      domain: COOKIE_DOMAIN,
    });
  }

  try {
    const rendered = (await renderFile(path.join(__dirname, "src", req.path), {
      IN_SAMPLE_PERCENTILE: 10,
      IN_SAMPLE_WITHOUT_TC: true,
      __CONFIG_NAME: null,
    }))
      .replaceAll("{{SAMPLER_HOST}}", SAMPLER_HOST ?? "localhost:4000")
      .replaceAll("{{SAMPLER_PATH}}", SAMPLER_PATH ?? "/")
      .replaceAll("{{TECH_COOKIE_NAME}}", techCookieName)
      .replaceAll("{{TECH_COOKIE_VALUE}}", techCookieValue.toString())
      .replaceAll("{{TECH_COOKIE_MIN_AGE}}", techCookieMinAge.toString())
      .replaceAll("{{PERCENTILE_COOKIE_NAME}}", percentileCookieName)
      .replaceAll("{{PERCENTILE_COOKIE_VALUE}}", techCookiePassed ? percentileCookieValue.toString() : "");

    res.send(rendered);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
});

app.listen(HTTP_PORT ?? 4000);
console.info(`serving sampler scripts at http://localhost:${HTTP_PORT ?? 4000}`);

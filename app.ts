import ejs, { renderFile } from "ejs";
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';

ejs.delimiter = "*";
ejs.openDelimiter = "__ejs(/";
ejs.closeDelimiter = "/);";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { HTTP_PORT, SAMPLER_HOST, SAMPLER_PATH, ELIGIBILITY_ROUND, ELIGIBILITY_SCRIPT, ELIGIBLE_DEVICE_IDS } = process.env;
const eligibleDeviceIds = (ELIGIBLE_DEVICE_IDS ?? "00000000-0000-4000-8000-000000000001").split(",");

const app = express();

app.set("views", path.join(__dirname, "/src"));
app.engine("html", renderFile);
app.engine("js", renderFile);
app.set("view engine", "ejs");

// Stands in for the tracking script's eligibility.js
app.get("/test/eligibility.js", function(_req, res) {
  res.sendFile(path.join(__dirname, "test", "eligibility.js"));
});

app.get("*", async function(req, res) {
  try {
    const rendered = (await renderFile(path.join(__dirname, "src", req.path), {
      IN_SAMPLE_PERCENTILE_MIN: 5,
      IN_SAMPLE_PERCENTILE_MAX: 20,
      TECH_COOKIE_MIN_AGE: 1000 * 60 * 60 * 24 * 2,
      TECH_COOKIE_NAME: "x-sampler-t",
      PERCENTILE_COOKIE_NAME: "x-sampler-p",
      ELIGIBILITY_COOKIE_NAME: "x-sampler-e",
      ELIGIBILITY_ROUND_COOKIE_NAME: "x-sampler-r",
      IN_SAMPLE_WITHOUT_TC: true,
      __CONFIG_NAME: null,
    }))
      .replaceAll("{{SAMPLER_HOST}}", SAMPLER_HOST ?? "localhost:4000")
      .replaceAll("{{SAMPLER_PATH}}", SAMPLER_PATH ?? "/")
      .replaceAll("{{ELIGIBILITY_ROUND}}", ELIGIBILITY_ROUND ?? "round-1")
      .replaceAll("{{ELIGIBILITY_SCRIPT}}", ELIGIBILITY_SCRIPT ?? "localhost:4000/test/eligibility.js")
      .replaceAll("{{ELIGIBLE}}", String(eligibleDeviceIds.includes(String(req.query.did))))

    res.send(rendered);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
});

app.listen(HTTP_PORT ?? 4000);
console.info(`serving sampler scripts at http://localhost:${HTTP_PORT ?? 4000}`);

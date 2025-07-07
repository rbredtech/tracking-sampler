import ejs, { renderFile } from "ejs";
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';

ejs.delimiter = "*";
ejs.openDelimiter = "__ejs(/";
ejs.closeDelimiter = "/);";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { HTTP_PORT, SAMPLER_HOST, SAMPLER_PATH } = process.env;

const app = express();

app.set("views", path.join(__dirname, "/src"));
app.engine("html", renderFile);
app.engine("js", renderFile);
app.set("view engine", "ejs");

app.get("*", async function(req, res) {
  try {
    const rendered = (await renderFile(path.join(__dirname, "src", req.path), {
      IN_SAMPLE_PERCENTILE: 10,
      IN_SAMPLE_WITHOUT_TC: true,
      TECH_COOKIE_NAME: "x-sampler-t",
      TECH_COOKIE_MIN_AGE: 172800000,
      PERCENTILE_COOKIE_NAME: "x-sampler-p",
      __CONFIG_NAME: null,
    }))
      .replaceAll("{{SAMPLER_HOST}}", SAMPLER_HOST ?? "localhost:4000")
      .replaceAll("{{SAMPLER_PATH}}", SAMPLER_PATH ?? "/")

    res.send(rendered);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
});

app.listen(HTTP_PORT ?? 4000);
console.info(`serving sampler scripts at http://localhost:${HTTP_PORT ?? 4000}`);

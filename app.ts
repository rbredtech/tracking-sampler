import ejs, { renderFile } from "ejs";
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';

ejs.delimiter = "*";
ejs.openDelimiter = "__ejs(/";
ejs.closeDelimiter = "/);";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("views", path.join(__dirname, "/src"));
app.engine("html", renderFile);
app.engine("js", renderFile);
app.set("view engine", "ejs");

app.get("*", function(req, res) {
  res.render(__dirname + "/src" + req.url, {
    SAMPLER_HOST: "localhost:4000",
    IN_SAMPLE_PERCENTILE: 10,
    TECHNICAL_COOKIE_MIN_AGE: 1000 * 60 * 60 * 24 * 2,
    TECHNICAL_COOKIE_NAME: "x-sampler-t",
    PERCENTILE_COOKIE_NAME: "x-sampler-p",
    IN_SAMPLE_WITHOUT_TC: true,
    __CONFIG_NAME: null,
  });
});

app.listen(4000);
console.info(`serving sampler scripts at http://localhost:4000`);

import { renderFile } from "ejs";
import express from "express";
import path from "path";

const app = express();

app.set("views", path.join(__dirname, "./src"));
app.engine("html", renderFile);
app.engine("js", renderFile);
app.set("view engine", "ejs");

app.get("*", function(req, res) {
  res.render(__dirname + "/src" + req.url, {
    SAMPLER_HOST: "localhost:4000",
    MAX_PERCENTILE: 10,
    TECHNICAL_COOKIE_MIN_AGE: 1000 * 60 * 60 * 24 * 2,
    TECHNICAL_COOKIE_NAME: "x-sampler-t",
    PERCENTILE_COOKIE_NAME: "x-sampler-p",
    __CONFIG_NAME: null,
  });
});

app.listen(4000);
console.info(`serving sampler scripts at http://localhost:4000`);

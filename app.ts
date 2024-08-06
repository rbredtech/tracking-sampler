import express from "express";
import path from "path";
import { renderFile } from "ejs";

const app = express();

app.set("views", path.join(__dirname, "./src"));
app.engine("html", renderFile);
app.engine("js", renderFile);
app.set("view engine", "ejs");

app.get("*", function(req, res) {
  res.render(__dirname + "/src" + req.url, {
    SAMPLER_HOST: "localhost:4000",
    MAX_PERCENTILE: 10,
  });
});

app.listen(4000);
console.info(`serving sampler scripts at http://localhost:4000`);

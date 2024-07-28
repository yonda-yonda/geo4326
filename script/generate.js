const fs = require("fs");
const path = require("path");

const epsgIndexAll = require("epsg-index/all.json");

const baseDir = "./src/_generated";
fs.mkdirSync(baseDir, { recursive: true });

const subset = {};
for (const key in epsgIndexAll) {
  subset[key] = epsgIndexAll[key].proj4;
}

let content = `/* eslint-disable */\n\n`;

const license = fs.readFileSync(
  require.resolve("epsg-index/license.md"),
  "utf-8"
);
content += `/*\n\nhttps://github.com/derhuerst/epsg-index\n\n${license}\n\n*/\n\n`;

content += `export const epsgIndex = ${JSON.stringify(subset, null, 2)}`;

fs.writeFileSync(path.resolve(baseDir, "epsg-index.ts"), content);

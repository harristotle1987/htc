const fs = require("fs");
const path = require("path");
const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith(".tsx")) {
        results.push(file);
      }
    }
  });
  return results;
};
const tsxFiles = walk(path.join(__dirname, "src"));
const srcDir = path.join(__dirname, "src");
const srcDepth = srcDir.split(path.sep).length;
for (const file of tsxFiles) {
  let content = fs.readFileSync(file, "utf8");
  if (content.includes("fetch(")) {
    if (!content.includes("apiFetch")) {
      content = 'import { apiFetch } from "@/lib/api";\n' + content;
    }
    content = content.replace(/([^.]|^)fetch\(/g, "$1apiFetch(");
    content = content.replace(/window\.apiFetch\(/g, "window.fetch(");
    const depth = file.split(path.sep).length - srcDepth - 1;
    let importPath = "";
    for (let i = 0; i < depth; i++) importPath += "../";
    importPath += "lib/api";
    if (depth === 0) importPath = "./lib/api";
    content = content.replace(/@\/lib\/api/g, importPath);
    fs.writeFileSync(file, content, "utf8");
  }
}

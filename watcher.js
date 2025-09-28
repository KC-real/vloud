// watcher.js
const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");

const ROOT = path.join(__dirname, "files");
const OUTPUT = path.join(ROOT, "files.json");

function build(dir, base="files") {
  const obj = { type: "directory", children: {} };
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item), stats = fs.statSync(full);
    if (stats.isDirectory()) {
      obj.children[item] = build(full, path.join(base, item));
    } else {
      obj.children[item] = {
        type: "file",
        mimeType: getMime(item),
        size: stats.size,
        lastModified: stats.mtime.toISOString(),
        url: path.join(base, item).replace(/\\/g, "/")
      };
    }
  }
  return obj;
}

function getMime(f) {
  const ext = path.extname(f).toLowerCase();
  if ([".png",".jpg",".jpeg",".gif",".webp"].includes(ext)) return "image/"+(ext==".jpg"?"jpeg":ext.slice(1));
  if ([".mp4",".webm",".mov"].includes(ext)) return "video/"+ext.slice(1);
  if ([".mp3",".wav",".ogg"].includes(ext)) return "audio/"+ext.slice(1);
  if (ext==".pdf") return "application/pdf";
  if ([".zip",".rar",".7z",".tar",".gz"].includes(ext)) return "application/zip";
  if ([".txt",".md",".json"].includes(ext)) return "text/plain";
  return "application/octet-stream";
}

function regenerate() {
  const tree = build(ROOT);
  fs.writeFileSync(OUTPUT, JSON.stringify(tree, null, 2));
  console.log("✅ files.json regenerated at " + new Date().toLocaleTimeString());
}

// Initial run
regenerate();

// Watch for changes
chokidar.watch(ROOT, { ignoreInitial: true }).on("all", () => {
  regenerate();
});

const fs = require("fs");
const path = require("path");

// Create upload directories
const directories = [
  "uploads",
  "uploads/images",
  "uploads/pdfs"
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
});

console.log("Upload directories setup complete!");

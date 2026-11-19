const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");

if (fs.existsSync(".env") && typeof process.loadEnvFile === "function") {
  process.loadEnvFile(".env");
}

const testDir = path.join(__dirname);
const testFiles = fs
  .readdirSync(testDir)
  .filter((f) => f.endsWith(".test.ts") || f.endsWith(".test.tsx"))
  .map((f) => path.join(testDir, f));

if (testFiles.length === 0) {
  console.log("No test files found in tests/");
  process.exit(0);
}

console.log(`Running ${testFiles.length} test suite(s)...`);

for (const testFile of testFiles) {
  console.log(`\n• Suite: ${path.basename(testFile)}`);
  const result = esbuild.buildSync({
    entryPoints: [testFile],
    bundle: true,
    platform: "node",
    format: "cjs",
    external: ["remotion", "react", "react-dom"],
    write: false,
  });

  if (result.errors && result.errors.length > 0) {
    console.error("Build failed:", result.errors);
    process.exit(1);
  }

  // Execute bundled test in-process with Node.js test runner
  const code = result.outputFiles[0].text;
  const mod = new Function("require", "module", "exports", "__dirname", "__filename", code);
  const dummyModule = { exports: {} };
  mod(require, dummyModule, dummyModule.exports, path.dirname(testFile), testFile);
}

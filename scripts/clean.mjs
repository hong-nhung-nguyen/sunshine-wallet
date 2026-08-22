import { rm } from "node:fs/promises";

const generatedDirectories = [".next", "coverage", "out", "test-results"];

await Promise.all(
  generatedDirectories.map((directory) =>
    rm(directory, { recursive: true, force: true }),
  ),
);

console.log(`Removed ${generatedDirectories.join(", ")}.`);

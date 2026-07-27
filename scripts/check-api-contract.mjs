import { execFileSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const output = join(tmpdir(), `mikozi-openapi-${process.pid}.ts`);

try {
  execFileSync(
    "pnpm",
    [
      "exec",
      "openapi-typescript",
      "../backend/openapi/mikozi.v1.json",
      "-o",
      output,
    ],
    { stdio: "inherit" },
  );

  const generated = readFileSync(output, "utf8");
  const committed = readFileSync("src/lib/api/generated.ts", "utf8");

  if (generated !== committed) {
    console.error(
      "The generated REST contract is stale. Run `pnpm api:generate`.",
    );
    process.exitCode = 1;
  }
} finally {
  rmSync(output, { force: true });
}

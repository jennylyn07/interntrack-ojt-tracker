import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // ── SQL-injection guard ───────────────────────────────────────────────────
  // Prisma's structured API (findMany, create, …) always uses parameterized
  // queries and is safe by design.  The raw-query escape hatches below are
  // dangerous when user-supplied data is interpolated into the string.
  //
  // Rules:
  //  1. $queryRawUnsafe / $executeRawUnsafe — ALWAYS banned; no safe usage.
  //  2. $queryRaw / $executeRaw with a plain-string argument — banned; must
  //     use Prisma's tagged-template form (prisma.$queryRaw`…`) which still
  //     parameterizes values.
  {
    rules: {
      "no-restricted-syntax": [
        "error",
        // 1. Unconditionally forbidden methods
        {
          selector:
            "MemberExpression[property.name='$queryRawUnsafe']",
          message:
            "prisma.$queryRawUnsafe() is forbidden — it bypasses parameterization and enables SQL injection. Use prisma.$queryRaw`` (tagged template) instead.",
        },
        {
          selector:
            "MemberExpression[property.name='$executeRawUnsafe']",
          message:
            "prisma.$executeRawUnsafe() is forbidden — it bypasses parameterization and enables SQL injection. Use prisma.$executeRaw`` (tagged template) instead.",
        },
        // 2. $queryRaw / $executeRaw called as a regular function (not tagged
        //    template), e.g. prisma.$queryRaw("SELECT " + userInput)
        {
          selector:
            "CallExpression[callee.property.name='$queryRaw']:not(TaggedTemplateExpression)",
          message:
            "Call prisma.$queryRaw as a tagged template (prisma.$queryRaw`…`), not as a regular function — regular calls don't parameterize values.",
        },
        {
          selector:
            "CallExpression[callee.property.name='$executeRaw']:not(TaggedTemplateExpression)",
          message:
            "Call prisma.$executeRaw as a tagged template (prisma.$executeRaw`…`), not as a regular function — regular calls don't parameterize values.",
        },
      ],
    },
  },
]);

export default eslintConfig;

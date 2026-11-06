// scripts/deploy.mjs: manual deploy from this laptop (`npm run deploy`), same result as the GitHub workflow.
// Builds against the REAL Firebase project (not the emulators, whatever .env.local says), then uploads out/
// to Firebase Hosting. Values set here win over .env.local because process.env has priority in Next.js.
//   npm run deploy            → https://pinjamtedi.web.app (live)
//   npm run deploy -- preview → temporary preview URL (7 days), live site untouched

import { execSync } from "node:child_process";

const preview = process.argv.includes("preview");
const env = {
  ...process.env,
  NEXT_PUBLIC_USE_EMULATORS: "false",
  NEXT_PUBLIC_SITE_URL: "https://pinjamtedi.web.app",
  NEXT_PUBLIC_DEMO_LOGIN: "true",
};
const run = (command) => execSync(command, { stdio: "inherit", env });

run("npm run build");
run(preview ? "firebase hosting:channel:deploy preview --expires 7d --project pinjamtedi" : "firebase deploy --only hosting --project pinjamtedi");

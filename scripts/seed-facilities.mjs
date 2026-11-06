// scripts/seed-facilities.mjs
//
// Writes every facility of FACILITIES (app/data/facilities.ts) to Firestore `facilities/{id}`,
// with `order` = its position (catalog display order). Existing documents are replaced, so this is also
// "reset the stock to the defaults".
//
//   npm run seed           → the local emulator (127.0.0.1:8080; start it first with `npm run emulators`)
//   npm run seed -- --cloud → the real project, signed in as your `firebase login` account
//
// Uses the Firestore REST API, so no service-account key is needed:
// the emulator accepts "Bearer owner", the cloud gets an access token from firebase-tools.

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { FACILITIES } from "../app/data/facilities.ts";

const CLOUD = process.argv.includes("--cloud");
const PROJECT = JSON.parse(readFileSync(".firebaserc", "utf8")).projects.default;
const BASE = CLOUD ? "https://firestore.googleapis.com/v1" : "http://127.0.0.1:8080/v1";
const DB = `projects/${PROJECT}/databases/(default)/documents`;

async function accessToken() {
  if (!CLOUD) return "owner";
  // the token of the account used by `firebase login` (firebase-tools is installed globally)
  const root = execSync("npm root -g", { encoding: "utf8" }).trim();
  const require = createRequire(join(root, "firebase-tools", "package.json"));
  const auth = require("./lib/auth.js");
  const account = auth.getGlobalDefaultAccount();
  if (!account?.tokens?.refresh_token) throw new Error("Not signed in. Run `firebase login` first.");
  const token = await auth.getAccessToken(account.tokens.refresh_token, []);
  return token.access_token;
}

/** JS value → Firestore REST value */
function toValue(v) {
  if (v === null) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "string") return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
  return { mapValue: { fields: toFields(v) } };
}
const toFields = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined).map(([k, v]) => [k, toValue(v)]));

const writes = FACILITIES.map(({ id, ...data }, order) => ({
  update: { name: `${DB}/facilities/${id}`, fields: toFields({ ...data, order }) },
  updateTransforms: [{ fieldPath: "updatedAt", setToServerValue: "REQUEST_TIME" }],
}));

const token = await accessToken();
const response = await fetch(`${BASE}/projects/${PROJECT}/databases/(default)/documents:commit`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  body: JSON.stringify({ writes }),
}).catch((error) => {
  console.error(CLOUD ? error : "Emulator not reachable on 127.0.0.1:8080. Start it with `npm run emulators`.");
  process.exit(1);
});

if (!response.ok) {
  console.error(`Seed failed (${response.status}):`, await response.text());
  process.exit(1);
}
console.log(`Seeded ${writes.length} facilities into ${CLOUD ? `the cloud project "${PROJECT}"` : "the emulator"}.`);

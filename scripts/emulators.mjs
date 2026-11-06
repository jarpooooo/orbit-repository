// scripts/emulators.mjs  (npm run emulators)
//
// Starts the Firebase Emulator Suite with Java 21+, even when the terminal's PATH still points at an older
// Java (e.g. Oracle Java 8, or a terminal opened before JDK 21 was installed).
// Looks for a JDK 21+ in JAVA_HOME and the usual install folders, puts its bin/ first on PATH, then runs
// `firebase emulators:start` with the same arguments as before (keeps test data in ./emulator-data).

import { spawn, spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const isWindows = process.platform === "win32";
const javaExe = (home) => join(home, "bin", isWindows ? "java.exe" : "java");

/** Major version of the java binary in `home`, or 0. (`java -version` prints to stderr.) */
function javaMajor(home) {
  const r = spawnSync(javaExe(home), ["-version"], { encoding: "utf8" });
  return parseMajor(`${r.stderr ?? ""}${r.stdout ?? ""}`);
}
const parseMajor = (text) => {
  const m = /version "(\d+)(?:\.(\d+))?/.exec(text);
  if (!m) return 0;
  return m[1] === "1" ? Number(m[2]) : Number(m[1]); // "1.8.0" → 8, "21.0.13" → 21
};

/** JDK folders to try, best first. */
function candidates() {
  const list = [];
  if (process.env.JAVA_HOME) list.push(process.env.JAVA_HOME);
  const roots = isWindows
    ? ["C:\\Program Files\\Eclipse Adoptium", "C:\\Program Files\\Java", "C:\\Program Files\\Microsoft", "C:\\Program Files\\Zulu"]
    : ["/usr/lib/jvm", "/Library/Java/JavaVirtualMachines"];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    for (const name of readdirSync(root).sort().reverse()) {
      const home = join(root, name);
      list.push(existsSync(join(home, "Contents", "Home")) ? join(home, "Contents", "Home") : home);
    }
  }
  return list.filter((home) => existsSync(javaExe(home)));
}

const home = candidates().find((h) => javaMajor(h) >= 21);
if (!home) {
  console.error("Java 21 atau lebih baru tidak ditemukan. Pasang JDK 21 (mis. `winget install EclipseAdoptium.Temurin.21.JDK`), lalu coba lagi.");
  process.exit(1);
}

const env = { ...process.env, JAVA_HOME: home, PATH: `${join(home, "bin")}${isWindows ? ";" : ":"}${process.env.PATH ?? process.env.Path ?? ""}` };
if (isWindows) delete env.Path; // Windows env is case-insensitive; keep a single PATH entry
console.log(`Memakai Java ${javaMajor(home)} dari ${home}`);

const args = ["emulators:start", "--import=./emulator-data", "--export-on-exit", ...process.argv.slice(2)];
// one command string: on Windows `firebase` is a .cmd shim, which needs a shell (the arguments are fixed flags)
const child = spawn(["firebase", ...args].join(" "), { stdio: "inherit", env, shell: true });
// let Ctrl+C reach firebase so it can export the data before exiting
process.on("SIGINT", () => {});
child.on("exit", (code) => process.exit(code ?? 0));

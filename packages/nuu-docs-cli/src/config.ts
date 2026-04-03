import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export interface NuuDocsConfig {
  docsRepoPath: string;
}

const CONFIG_DIR = path.join(os.homedir(), ".nuucognition");
const CONFIG_PATH = path.join(CONFIG_DIR, ".nuu-docs.json");

export function getConfigPath(): string {
  return CONFIG_PATH;
}

export function readConfig(): NuuDocsConfig | null {
  if (!fs.existsSync(CONFIG_PATH)) {
    return null;
  }
  const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
  return JSON.parse(raw) as NuuDocsConfig;
}

export function writeConfig(config: NuuDocsConfig): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");
}

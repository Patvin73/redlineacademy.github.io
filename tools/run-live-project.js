const http = require("http");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const project = process.argv[2];
const extraArgs = process.argv.slice(3);
const listMode = extraArgs.includes("--list");
const helpMode = extraArgs.includes("--help") || extraArgs.includes("-h");
const versionMode = extraArgs.includes("--version") || extraArgs.includes("-v");

if (!project) {
  // eslint-disable-next-line no-console
  console.error("Usage: node tools/run-live-project.js <project> [playwright args]");
  process.exit(1);
}

const playwrightCli = path.join(
  rootDir,
  "node_modules",
  "@playwright",
  "test",
  "cli.js"
);
const staticServerScript = path.join(rootDir, "tools", "static-server.js");
const liveServerUrl = "http://127.0.0.1:8000";
const runTargets = {
  "local-regression": {
    config: "playwright.local.config.js",
    args: []
  },
  "local-smoke": {
    config: "playwright.local.config.js",
    args: ["--grep", "@critical"]
  },
  "live-core": {
    config: "playwright.live.config.js",
    args: ["--project", "live-core"]
  },
  "live-audit": {
    config: "playwright.live.config.js",
    args: ["--project", "live-audit"]
  }
};

if (!runTargets[project]) {
  // eslint-disable-next-line no-console
  console.error(
    `Unknown Playwright target "${project}". Expected one of: ${Object.keys(runTargets).join(", ")}`
  );
  process.exit(1);
}

function log(message) {
  // eslint-disable-next-line no-console
  console.log(`[live-runner] ${message}`);
}

function isServerReachable() {
  return new Promise((resolve) => {
    const request = http.get(liveServerUrl, (res) => {
      res.resume();
      resolve(!!res.statusCode && res.statusCode < 500);
    });

    request.on("error", () => resolve(false));
    request.setTimeout(1500, () => {
      request.destroy();
      resolve(false);
    });
  });
}

function runPlaywright() {
  const target = runTargets[project];
  log(`running Playwright project "${project}"`);
  const result = spawnSync(
    process.execPath,
    [
      playwrightCli,
      "test",
      ...extraArgs,
      `--config=${target.config}`,
      ...target.args,
    ],
    {
      cwd: rootDir,
      stdio: "inherit",
      env: process.env,
    }
  );

  log(`Playwright project "${project}" finished with exit code ${result.status ?? 1}`);
  return typeof result.status === "number" ? result.status : 1;
}

function waitForServer(timeoutMs = 30000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const attempt = () => {
      http
        .get(liveServerUrl, (res) => {
          res.resume();
          if (res.statusCode && res.statusCode < 500) {
            resolve();
            return;
          }
          retry();
        })
        .on("error", retry);
    };

    const retry = () => {
      if (Date.now() - startedAt >= timeoutMs) {
        reject(new Error(`Timed out waiting for ${liveServerUrl}`));
        return;
      }
      setTimeout(attempt, 250);
    };

    attempt();
  });
}

async function main() {
  if (listMode || helpMode || versionMode) {
    log(`delegating direct Playwright command for "${project}"`);
    process.exit(runPlaywright());
    return;
  }

  const alreadyRunning = await isServerReachable();
  let server = null;

  if (!alreadyRunning) {
    log(`starting static server for "${project}"`);
    server = spawn(process.execPath, [staticServerScript], {
      cwd: rootDir,
      stdio: "inherit",
      env: process.env,
    });
  } else {
    log(`reusing existing static server for "${project}"`);
  }

  const stopServer = () => {
    if (!server || server.killed) {
      return;
    }

    server.kill();
    setTimeout(() => {
      if (!server.killed) {
        server.kill("SIGKILL");
      }
    }, 2000);
  };

  process.on("SIGINT", () => {
    stopServer();
    process.exit(130);
  });

  process.on("SIGTERM", () => {
    stopServer();
    process.exit(143);
  });

  try {
    log(`waiting for ${liveServerUrl}`);
    await waitForServer();
    log(`server ready for "${project}"`);
    process.exitCode = runPlaywright();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    log(`stopping static server for "${project}"`);
    stopServer();
  }
}

main();

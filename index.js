#!/usr/bin/env node

const program = require("commander");
const path = require("path");
const fse = require("fs-extra");
const { spawn } = require("child_process");
const rdl = require("readline");
const package = require("./package.json");
const store = path.join(process.env.HOME, ".epm", "node_modules");

program
  .name("epm")
  .version(package.version, "-v, --version", "output the current version");
program
  .command("install")
  .description("Install the npm package at the desired location.");
program
  .command("i")
  .description("Install the npm package at the desired location.");
program.option(
  "-d, --dir <path>",
  "Where to Install the Package",
  "entry_modules"
);
program.parse(process.argv);

async function clean() {
  await fse.remove(store);
  await fse.remove(path.join(store, "..", "package-lock.json"));
  await fse.remove(path.join(store, "..", "package.json"));
}
const progress = ["-", "\\", "|", "/"];
let cursor = 0;
function showProgress() {
  return setInterval(() => {
    rdl.cursorTo(process.stdout, 0);
    process.stdout.write(progress[cursor]);
    cursor++;
    if (cursor >= progress.length) {
      cursor = 0;
    }
  }, 100);
}

function hideProgress(interval) {
  if (interval) {
    clearInterval(interval);
    rdl.cursorTo(process.stdout, 0);
    process.stdout.write("");
  }
}
async function install(args, dest = program.dir) {
  const interval = showProgress();
  console.log("install packages");
  const child = spawn("npm", args);
  child.stdout.on("data", data => {
    hideProgress(interval);
    console.log(`${data}`);
  });
  child.stderr.on("data", async data => {
    hideProgress(interval);
    console.error(`stderr: ${data}`);
  });
  child.on("close", async code => {
    hideProgress(interval);
    console.log(`child process exited with code ${code}`);
    await fse.copy(store, dest, {
      overwrite: true,
      errorOnExist: false,
      filter: (src, dest) => {
        return !src.includes("node_modules/.bin");
      }
    });
    await clean();
  });
}

async function setup() {
  const { dependencies, directory } = require(path.join(
    process.cwd(),
    "epackage.json"
  ));
  const pkgs = Object.entries(dependencies).map(([key, value]) => {
    return `${key}@${value}`;
  });
  await fse.copyFile(
    path.join(process.cwd(), "package.json"),
    path.join(process.env.HOME, ".epm", "package.json")
  );
  await install(["i", ...pkgs, "--prefix", "~/.epm"], directory);
}

async function main(cmd, ...pkgs) {
  if (cmd === "install" || cmd === "i") {
    await clean();
    if (pkgs.length === 1) {
      await install(["i", pkgs[0], "--prefix", "~/.epm"]);
    } else if (pkgs.length > 1) {
      await install(["i", ...pkgs, "--prefix", "~/.epm"]);
    } else {
      await setup();
    }
  }
}
main(...program.args);

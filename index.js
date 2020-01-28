#!/usr/bin/env node

const program = require("commander");
const path = require("path");
const fse = require("fs-extra");
const { spawn } = require("child_process");
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
}

async function install(args, dest = program.dir) {
  await clean();
  const child = spawn("npm", args);
  child.stdout.on("data", chunk => {
    console.log(chunk.toString("utf8"));
  });
  child.on("close", async code => {
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
  const { dependency } = require(path.join(process.cwd(), "epackage.json"));
  const pkgs = Object.entries(dependency).map(([key, value]) => {
    return `${key}@${value}`;
  });
  await install(["i", ...pkgs, "--prefix", "~/.epm"]);
}

async function main(cmd, ...pkgs) {
  if (cmd === "install" || cmd === "i") {
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

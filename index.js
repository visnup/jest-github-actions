#!/usr/bin/env node
const {issueCommand} = require("@actions/core/lib/command");

const cwd = new RegExp(process.cwd() + "/", "g");
const regex = /^    at .*?\(?([^\s:]+):(\d+):(\d+)\)?$/;
class GitHubActionsReporter {
  onTestResult(_test, {testResults}) {
    for (const {failureMessages, fullName, status} of testResults) {
      if (status !== "failed") continue;
      for (const message of failureMessages) {
        const local = message.replace(cwd, "");
        const stack = local.split("\n");
        let match;
        while (
          !match ||
          (match[1].match(/^(internal|node_modules)\//) && stack.length)
        )
          match = stack.shift().match(regex);
        const [, file, line, col] = match;
        issueCommand("error", {file, line, col}, `${fullName}\n\n${local}`);
      }
    }
  }
}

module.exports = GitHubActionsReporter;

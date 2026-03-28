#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [, , tagArg, outFileArg] = process.argv;

function run(command) {
  return execSync(command, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}

function resolveTargetTag(input) {
  if (input) {
    return input.trim();
  }

  const latestTag = run("git describe --tags --abbrev=0");
  if (!latestTag) {
    throw new Error("릴리즈 태그를 찾지 못했습니다. 태그를 인자로 전달해 주세요.");
  }

  return latestTag;
}

function previousTagOf(target) {
  const tags = run("git tag --sort=-creatordate")
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean);

  const index = tags.indexOf(target);
  if (index === -1) {
    return undefined;
  }

  return tags[index + 1];
}

function normalizeCommitMessage(message) {
  return message.trim().replace(/^\[.*?\]\s*/, "");
}

function classify(message) {
  const normalized = message.toLowerCase();
  const matched = normalized.match(/^([a-z]+)(\([^)]+\))?:/);
  const type = matched?.[1];

  switch (type) {
    case "feat":
      return "feat";
    case "fix":
      return "fix";
    case "docs":
      return "docs";
    case "test":
      return "test";
    case "refactor":
      return "refactor";
    case "build":
      return "build";
    default:
      return "chore";
  }
}

function toMarkdownList(items) {
  if (items.length === 0) {
    return "- 해당 구간 변경사항 없음";
  }

  return items
    .map((item) => `- ${item.replace(/^[-*]/u, "\\$&")}`)
    .join("\n");
}

try {
  const tag = resolveTargetTag(tagArg);
  const previousTag = previousTagOf(tag);
  const gitLogCommand = previousTag
    ? `git log --oneline --no-decorate ${previousTag}..${tag}`
    : `git log --oneline --no-decorate -20 ${tag}`;

  const commitLog = run(gitLogCommand)
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [sha, ...rest] = line.trim().split(" ");
      return {
        sha,
        message: rest.join(" "),
      };
    });

  const grouped = {
    feat: [],
    fix: [],
    chore: [],
    docs: [],
    test: [],
    refactor: [],
    build: [],
  };

  for (const commit of commitLog) {
    const normalizedMessage = normalizeCommitMessage(commit.message);
    const kind = classify(normalizedMessage);
    const entry = normalizedMessage.length > 0
      ? `${normalizedMessage} (${commit.sha})`
      : `변경사항 업데이트 (${commit.sha})`;
    grouped[kind].push(entry);
  }

  const output = [
    `# Wedding Release Notes (${tag})`,
    "",
    `- 기준 태그: ${previousTag ?? "(초기 릴리스 또는 태그 미확인)"}`,
    `- 배포 시각: ${new Date().toISOString()}`,
    "",
    "## Summary",
    toMarkdownList([
      ...grouped.feat,
      ...grouped.fix,
      ...grouped.chore,
    ].slice(0, 8)),
    "",
    "## Details",
    "",
    "### Features",
    toMarkdownList(grouped.feat),
    "",
    "### Fixes",
    toMarkdownList(grouped.fix),
    "",
    "### Chores",
    toMarkdownList(grouped.chore),
    "",
    "### Docs/Tests/Refactor",
    toMarkdownList([...grouped.docs, ...grouped.test, ...grouped.refactor, ...grouped.build]),
  ].join("\n");

  const outputPath = outFileArg || path.join(process.cwd(), "dist", "releases", `wedding_${tag}_release_notes.md`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output, "utf8");
  console.log(outputPath);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

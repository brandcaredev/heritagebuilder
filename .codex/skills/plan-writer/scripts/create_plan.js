#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function parseArgs(argv) {
  const args = {
    title: "",
    slug: "",
    dir: "agent-plans",
    owner: "TBD",
    targetDate: "TBD",
    relatedLinks: "TBD",
    date: formatLocalDate(new Date()),
    withProgress: false,
    force: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);

    if (key === "with-progress") {
      args.withProgress = true;
      continue;
    }
    if (key === "force") {
      args.force = true;
      continue;
    }
    if (key === "help") {
      args.help = true;
      continue;
    }

    const value = argv[i + 1];
    if (!value || value.startsWith("--")) continue;
    i += 1;

    switch (key) {
      case "title":
        args.title = value;
        break;
      case "slug":
        args.slug = value;
        break;
      case "dir":
        args.dir = value;
        break;
      case "owner":
        args.owner = value;
        break;
      case "target-date":
        args.targetDate = value;
        break;
      case "related":
        args.relatedLinks = value;
        break;
      case "date":
        args.date = value;
        break;
      default:
        break;
    }
  }

  return args;
}

function printHelp() {
  process.stdout.write(`create_plan.js

Usage:
  node skills/plan-writer/scripts/create_plan.js --title "..." [options]

Options:
  --slug "..."           Optional; derived from title if omitted
  --dir agent-plans      Output dir (default: agent-plans)
  --owner "TBD"          Owner line (default: TBD)
  --target-date "TBD"    Target date line (default: TBD)
  --related "TBD"        Related links line (default: TBD)
  --date YYYY-MM-DD      Override created date (default: today, local)
  --with-progress        Also create a matching .progress.md file
  --force                Overwrite existing files
`);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function fillTemplate(template, vars) {
  return template
    .replaceAll("{{TITLE}}", vars.title)
    .replaceAll("{{DATE}}", vars.date)
    .replaceAll("{{OWNER}}", vars.owner)
    .replaceAll("{{TARGET_DATE}}", vars.targetDate)
    .replaceAll("{{RELATED_LINKS}}", vars.relatedLinks)
    .replaceAll("{{PLAN_PATH}}", vars.planPath);
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (!args.title) {
    process.stderr.write('Missing required flag: --title "..."\n');
    printHelp();
    process.exit(1);
  }

  const slug = args.slug ? slugify(args.slug) : slugify(args.title);
  if (!slug) {
    process.stderr.write(
      "Could not derive a slug from the provided title/slug.\n",
    );
    process.exit(1);
  }

  const outDir = path.resolve(process.cwd(), args.dir);
  await fs.mkdir(outDir, { recursive: true });

  const planFilename = `${args.date}--${slug}.plan.md`;
  const planPath = path.join(outDir, planFilename);

  if (!args.force && (await fileExists(planPath))) {
    process.stderr.write(`Refusing to overwrite existing file: ${planPath}\n`);
    process.stderr.write(
      "Re-run with --force or choose a different --slug/--date.\n",
    );
    process.exit(1);
  }

  const planTemplatePath = new URL("../assets/plan-template.md", import.meta.url);
  const planTemplate = await fs.readFile(planTemplatePath, "utf8");
  const planContent = fillTemplate(planTemplate, {
    title: args.title,
    date: args.date,
    owner: args.owner,
    targetDate: args.targetDate,
    relatedLinks: args.relatedLinks,
    planPath: path.relative(process.cwd(), planPath),
  });
  await fs.writeFile(planPath, planContent, "utf8");

  if (args.withProgress) {
    const progressFilename = `${args.date}--${slug}.progress.md`;
    const progressPath = path.join(outDir, progressFilename);

    if (!args.force && (await fileExists(progressPath))) {
      process.stderr.write(
        `Refusing to overwrite existing file: ${progressPath}\n`,
      );
      process.exit(1);
    }

    const progressTemplatePath = new URL(
      "../assets/progress-template.md",
      import.meta.url,
    );
    const progressTemplate = await fs.readFile(progressTemplatePath, "utf8");
    const progressContent = fillTemplate(progressTemplate, {
      title: args.title,
      date: args.date,
      owner: args.owner,
      targetDate: args.targetDate,
      relatedLinks: args.relatedLinks,
      planPath: path.relative(process.cwd(), planPath),
    });
    await fs.writeFile(progressPath, progressContent, "utf8");
  }

  process.stdout.write(
    `Created: ${path.relative(process.cwd(), planPath)}\n`,
  );
  if (args.withProgress) {
    const createdProgressPath = path.relative(
      process.cwd(),
      path.join(outDir, `${args.date}--${slug}.progress.md`),
    );
    process.stdout.write(`Created: ${createdProgressPath}\n`);
  }
}

main().catch((err) => {
  process.stderr.write(`${err?.stack || String(err)}\n`);
  process.exit(1);
});

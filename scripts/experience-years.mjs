#!/usr/bin/env node
// Rewrites the "years of experience" figure in the built page from the role
// dates already published in the Experience section, so the headline number
// can never drift from the CV. Runs at build time only — the page stays
// static and ships no client-side JavaScript.
//
// Usage: node scripts/experience-years.mjs dist/index.html [--now YYYY-MM]
//
// No dependencies, no build step. Exits non-zero (never a silent no-op) when
// the section, the role dates or the target span cannot be found.

import { readFileSync, writeFileSync } from "node:fs";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// 0-12 spelled out, anything larger stays numeric (e.g. "Thirteen" reads oddly
// in a headline once it grows past a dozen).
const NUMBER_WORDS = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
];

function fail(message) {
  console.error(`experience-years: ${message}`);
  process.exit(1);
}

// "Aug 2017", "October 2024" or "Sept 2017" (any 3+ letter abbreviation).
const START = String.raw`([A-Za-z]{3,9})\s+(\d{4})`;
const END = String.raw`(Present|([A-Za-z]{3,9})\s+(\d{4}))`;
const DATE_RANGE = new RegExp(
  String.raw`${START}\s*(?:—|–|-|to)\s*${END}`,
);

/** Month index used for arithmetic: year * 12 + (month - 1). */
function monthIndex(year, month) {
  return year * 12 + (month - 1);
}

/** Turn "Aug" / "September" into a 1-based month number, or null when it is not one. */
function parseMonth(name) {
  const key = name.slice(0, 3).toLowerCase();
  const index = MONTH_NAMES.findIndex((month) => month.toLowerCase() === key);
  return index === -1 ? null : index + 1;
}

/** Strip markup and collapse whitespace so a date paragraph becomes plain text. */
function plainText(html) {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function parseArgs(argv) {
  const args = argv.slice(2);
  let file = null;
  let now = null;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--now" || arg.startsWith("--now=")) {
      const value = arg === "--now" ? args[(i += 1)] : arg.slice("--now=".length);
      const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value ?? "");
      if (!match) {
        fail(`--now expects YYYY-MM (got "${value ?? ""}")`);
      }
      now = monthIndex(Number(match[1]), Number(match[2]));
    } else if (arg.startsWith("--")) {
      fail(`unknown option "${arg}"`);
    } else if (file === null) {
      file = arg;
    } else {
      fail(`unexpected argument "${arg}"`);
    }
  }

  if (!file) {
    fail("usage: node scripts/experience-years.mjs <file> [--now YYYY-MM]");
  }

  return { file, now };
}

function main() {
  const { file, now } = parseArgs(process.argv);
  const html = readFileSync(file, "utf8");

  // Current month for "Present" roles; UTC keeps the CI result stable.
  const today = new Date();
  const currentMonth = now ?? monthIndex(today.getUTCFullYear(), today.getUTCMonth() + 1);

  // --- Locate the Experience section -------------------------------------
  const sectionStart = html.search(/<section\s+id="experience"/);
  if (sectionStart === -1) {
    fail(`no <section id="experience"> found in ${file}`);
  }
  const sectionEnd = html.indexOf("</section>", sectionStart);
  if (sectionEnd === -1) {
    fail(`<section id="experience"> is not closed in ${file}`);
  }
  const section = html.slice(sectionStart, sectionEnd);

  const listStart = section.indexOf("<ol");
  const listEnd = section.lastIndexOf("</ol>");
  if (listStart === -1 || listEnd === -1 || listEnd < listStart) {
    fail("no <ol> of roles inside the Experience section");
  }
  const list = section.slice(listStart + 1, listEnd);

  // --- One block per role <li> -------------------------------------------
  // Nested duty lists use <li class="flex …">; role entries use <li class="grid …">.
  const blocks = [];
  const roleStart = /<li class="grid\b/g;
  let match;
  let blockStart = -1;
  while ((match = roleStart.exec(list)) !== null) {
    if (blockStart !== -1) {
      blocks.push(list.slice(blockStart, match.index));
    }
    blockStart = match.index;
  }
  if (blockStart !== -1) {
    blocks.push(list.slice(blockStart));
  }
  if (blocks.length === 0) {
    fail("no role entries found in the Experience section");
  }

  // --- Parse each role's date paragraph ----------------------------------
  const roles = blocks.map((block, index) => {
    const paragraph = /<p[^>]*md:text-right[^>]*>([\s\S]*?)<\/p>/i.exec(block);
    if (!paragraph) {
      fail(`role ${index + 1} has no date paragraph: ${plainText(block).slice(0, 120)}`);
    }

    const text = plainText(paragraph[1]);
    const dates = DATE_RANGE.exec(text);
    if (!dates) {
      fail(`role ${index + 1}: cannot parse dates from "${text}"`);
    }

    const [, startName, startYear, endToken, endName, endYear] = dates;
    const startMonth = parseMonth(startName);
    if (startMonth === null) {
      fail(`role ${index + 1}: unknown month "${startName}" in "${text}"`);
    }

    const start = monthIndex(Number(startYear), startMonth);
    let end;
    if (endToken === "Present") {
      end = currentMonth;
    } else {
      const endMonth = parseMonth(endName);
      if (endMonth === null) {
        fail(`role ${index + 1}: unknown month "${endName}" in "${text}"`);
      }
      end = monthIndex(Number(endYear), endMonth);
    }

    if (end < start) {
      fail(`role ${index + 1}: end date is before start date in "${text}"`);
    }

    return { start, end, months: end - start + 1, text };
  });

  // --- Sum, removing genuine overlaps ------------------------------------
  // Inclusive months mean two tenures meeting in the same calendar month (one
  // ends, the next starts) share that single month; that handover month belongs
  // to both tenures on a CV, so it is kept. Any overlap longer than one month is
  // a real double count and is subtracted. Roles are sorted oldest first.
  roles.sort((a, b) => a.start - b.start || a.end - b.end);

  let totalMonths = 0;
  let coveredEnd = -1;
  for (const role of roles) {
    if (role.start > coveredEnd) {
      totalMonths += role.months;
    } else {
      const shared = coveredEnd - role.start + 1;
      totalMonths += role.months - (shared > 1 ? shared : 0);
    }
    coveredEnd = Math.max(coveredEnd, role.end);
  }

  if (totalMonths <= 0) {
    fail("computed experience total is 0 months");
  }

  const years = Math.floor(totalMonths / 12);
  const label = years <= 12 ? NUMBER_WORDS[years] : String(years);

  // --- Rewrite the span in the built page --------------------------------
  const span = /<span\s+data-experience-years\s*>([\s\S]*?)<\/span>/i;
  if (!span.test(html)) {
    fail(`no <span data-experience-years> target found in ${file}`);
  }

  const updated = html.replace(span, `<span data-experience-years>${label}</span>`);
  writeFileSync(file, updated);

  console.log(
    `experience: ${roles.length} roles, ${totalMonths} months -> ${label} years (${years}y${totalMonths % 12}m)`,
  );
}

main();

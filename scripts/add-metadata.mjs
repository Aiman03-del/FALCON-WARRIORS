import fs from "fs";
import path from "path";
import { glob } from "glob";

const metadataMap = {
  "app/achievements/page.tsx": {
    title: "Achievements | Falcon Warriors",
    description: "View all achievements and milestones of Falcon Warriors players and tournament records.",
  },
  "app/ballon-dor/page.tsx": {
    title: "Ballon d'Or | Falcon Warriors",
    description: "Falcon Warriors Ballon d'Or awards - celebrating the best players of each season.",
  },
  "app/leaderboards/page.tsx": {
    title: "Leaderboards | Falcon Warriors",
    description: "Global leaderboards showing top players, teams, and stats for Falcon Warriors.",
  },
  "app/news/page.tsx": {
    title: "News | Falcon Warriors",
    description: "Latest news and updates from Falcon Warriors eFootball club.",
  },
  "app/players/page.tsx": {
    title: "Players | Falcon Warriors",
    description: "Browse all Falcon Warriors players - view profiles, stats, and achievements.",
  },
  "app/profile/page.tsx": {
    title: "My Profile | Falcon Warriors",
    description: "View and manage your Falcon Warriors player profile.",
  },
  "app/login/page.tsx": {
    title: "Login | Falcon Warriors",
    description: "Login to your Falcon Warriors account.",
  },
  "app/register/page.tsx": {
    title: "Register | Falcon Warriors",
    description: "Create a new Falcon Warriors account and join our community.",
  },
  "app/search/page.tsx": {
    title: "Search | Falcon Warriors",
    description: "Search for players, tournaments, matches, and news.",
  },
  "app/dashboard/page.tsx": {
    title: "Dashboard | Falcon Warriors",
    description: "Admin dashboard for managing tournaments, matches, and content.",
  },
};

const files = await glob("app/**/page.tsx", { cwd: process.cwd() });

for (const file of files) {
  const metadata = metadataMap[file];
  if (!metadata) continue;

  let content = fs.readFileSync(file, "utf-8");

  // Skip if already has metadata
  if (content.includes("export const metadata")) {
    console.log(`✓ ${file} already has metadata`);
    continue;
  }

  // Add Metadata import if not exists
  if (!content.includes("import type { Metadata }")) {
    content = `import type { Metadata } from "next";\n${content}`;
  }

  // Find the export default or first export
  const exportMatch = content.match(/^(export\s+(async\s+)?(?:default\s+)?function|export\s+(const|async\s+const))/m);

  if (exportMatch) {
    const metadataExport = `export const metadata: Metadata = {
  title: "${metadata.title}",
  description: "${metadata.description}",
};\n\n`;

    content = content.replace(
      exportMatch[0],
      metadataExport + exportMatch[0]
    );

    fs.writeFileSync(file, content, "utf-8");
    console.log(`✓ Added metadata to ${file}`);
  }
}

console.log("Done!");

import fs from "fs";
import chalk from "chalk";
import matter from "gray-matter";
export async function enrichPrds(jsonPath: string) {
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  data.forEach((e: any) => {
    const fm = matter.read(e.prd);
    fm.data = { ...fm.data, ...e };
    fs.writeFileSync(e.prd, matter.stringify(fm.content, fm.data));
    console.log(chalk.blue(`• patched ${e.prd}`));
  });
  console.log(chalk.green("✔ PRDs enriched"));
}
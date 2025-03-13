import { Command } from "commander";
import chalk from "chalk";
import { setConfig } from "../utils/config";
import * as fs from "fs";
import * as path from "path";

export function useCommand(): Command {
  return new Command("use")
    .description("Set authentication token for AMA project")
    .requiredOption("-t, --token <token>", "Authentication token")
    .action((options) => {
      try {
        // Create .ama directory if it doesn't exist
        const amaDir = path.join(process.cwd(), ".ama");
        if (!fs.existsSync(amaDir)) {
          fs.mkdirSync(amaDir, { recursive: true });
        }

        // Add .gitignore if it doesn't exist or update it
        const gitignorePath = path.join(process.cwd(), ".gitignore");
        const gitignoreEntry = "\n# AMA configuration\n.ama/session.json\n";

        if (!fs.existsSync(gitignorePath)) {
          fs.writeFileSync(gitignorePath, gitignoreEntry);
        } else {
          const currentContent = fs.readFileSync(gitignorePath, "utf8");
          if (!currentContent.includes(".ama/session.json")) {
            fs.appendFileSync(gitignorePath, gitignoreEntry);
          }
        }

        setConfig({
          token: options.token,
          projectId: "proj_" + Math.random().toString(36).slice(2, 9),
        });

        console.log(
          chalk.green("🔐 Successfully authenticated and joined project")
        );
        console.log(
          chalk.yellow(
            "⚠️  Warning: Keep your .ama/session.json file private and do not commit it to version control"
          )
        );
        console.log(
          chalk.blue(
            "ℹ️  Note: Session file has been automatically added to .gitignore"
          )
        );
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.error(chalk.red(`❌ Error: ${message}`));
        process.exit(1);
      }
    });
}

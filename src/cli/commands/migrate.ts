import { Command } from "commander";
import chalk from "chalk";
import { getConfig } from "../utils/config";
import fg from "fast-glob";
import { Project, SourceFile, TypeAliasDeclaration } from "ts-morph";
import * as ts from "typescript";
import { resolve } from "path";
import { generateSchema } from "typescript-json-schema";
import { writeFileSync, mkdirSync, existsSync } from "fs";

// Types for better code organization
interface Content {
  path: string;
  structure: any;
}

interface OutputDefinition {
  description: string;
  definitions: Record<string, { structure: any }>;
  args: any[];
}

/**
 * Extracts constant values from a JSON Schema-like definition.
 * Assumes all final fields are constants and skips any fields without const values.
 *
 * @param schema The JSON Schema definition object
 * @returns An object containing only the constant values
 */
function extractConstants(schema: any): any {
  // If not an object or doesn't have properties, return null
  if (!schema || typeof schema !== "object" || !schema.properties) {
    return null;
  }

  const result: any = {};

  // Process each property in the schema
  for (const [key, propDef] of Object.entries(schema.properties)) {
    if (typeof propDef === "object" && propDef !== null) {
      if ("const" in propDef) {
        // If property has a const value, add it to the result
        result[key] = propDef.const;
      } else if (
        "type" in propDef &&
        propDef.type === "object" &&
        "properties" in propDef
      ) {
        // If it's a nested object, recursively process it
        const nestedResult = extractConstants(propDef);
        if (nestedResult) {
          result[key] = nestedResult;
        }
      }
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

// Interface for type transformers
interface TypeTransformer {
  canTransform: (obj: any) => boolean;
  transform: (obj: any) => any;
}

// Registry of type transformers
const typeTransformers: TypeTransformer[] = [
  {
    // Transformer for AMA image types
    canTransform: (obj) =>
      obj?.properties?.__amatype?.const &&
      obj?.properties?.__amatype?.const === "AmaImageDef" &&
      obj?.properties?.__config,
    transform: (obj) => {
      return {
        __amatype: obj.properties.__amatype.const,
        config: extractConstants(obj.properties.__config),
      };
    },
  },
  {
    // Transformer for AMA file types
    canTransform: (obj) =>
      obj?.properties?.__amatype?.const &&
      obj?.properties?.__amatype?.const === "AmaFileDef" &&
      obj?.properties?.__config,
    transform: (obj) => {
      return {
        __amatype: obj.properties.__amatype.const,
        config: extractConstants(obj.properties.__config),
      };
    },
  },
];

// Register a new type transformer
export function registerTypeTransformer(transformer: TypeTransformer): void {
  typeTransformers.push(transformer);
}

// Recursively process the JSON structure to transform special types
export function processSpecialTypes(schema: any): any {
  if (!schema || typeof schema !== "object") {
    return schema;
  }

  // If it's an array, process each item
  if (Array.isArray(schema)) {
    return schema.map(processSpecialTypes);
  }

  // Check if this object should be transformed
  for (const transformer of typeTransformers) {
    if (transformer.canTransform(schema)) {
      return transformer.transform(schema);
    }
  }

  // Process object properties recursively
  const result: any = {};
  for (const key in schema) {
    result[key] = processSpecialTypes(schema[key]);
  }
  return result;
}

// Scans for TypeScript files based on config patterns
async function scanFiles(patterns: string[]): Promise<string[]> {
  console.log(chalk.blue("🔍 Scanning files..."));
  return fg(patterns, {
    ignore: ["**/node_modules/**", "**/test/**", "**/dist/**"],
    absolute: true,
    cwd: process.cwd(),
  });
}

// Creates and configures the TypeScript project
function createProject(files: string[]): Project {
  const project = new Project({
    tsConfigFilePath: resolve(process.cwd(), "tsconfig.json"),
  });
  project.addSourceFilesAtPaths(files);
  return project;
}

// Processes a single type alias to extract content information
function processTypeAlias(
  alias: TypeAliasDeclaration,
  file: SourceFile
): Content | null {
  if (!alias.getName().startsWith("_AMA_")) {
    return null;
  }

  const program = ts.createProgram([file.getFilePath()], {
    target: ts.ScriptTarget.ES2015,
    module: ts.ModuleKind.ESNext,
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    jsx: ts.JsxEmit.Preserve,
  });

  const schema = generateSchema(program as any, alias.getName(), {
    required: true,
    noExtraProps: true,
    aliasRef: true,
    ref: false,
    defaultNumberType: "number",
  });

  if (!schema) {
    throw new Error(`Failed to generate schema for ${alias.getName()}`);
  }

  const pathMatch = alias
    .getType()
    .getText()
    .match(/["'](.*?)["']/);
  if (!pathMatch?.[1]) {
    throw new Error(`Missing file path in ${alias.getName()}`);
  }

  if (!schema.properties) {
    throw new Error(`Invalid schema structure in ${alias.getName()}`);
  }

  const internal = schema.properties as any;
  return {
    path: internal["path"]["const"] as string,
    structure: internal["structure"] || internal["config"],
  };
}

// Processes all files to extract contents
function processFiles(sourceFiles: SourceFile[]): {
  contents: Content[];
  errors: string[];
} {
  const contents: Content[] = [];
  const errors: string[] = [];

  sourceFiles.forEach((file) => {
    file.getTypeAliases().forEach((alias) => {
      try {
        const content = processTypeAlias(alias, file);
        if (content) {
          contents.push(content);
        }
      } catch (err) {
        errors.push(
          `❌ ${file.getFilePath()} - ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      }
    });
  });

  return { contents, errors };
}

// Generates the final output definition
function generateOutput(contents: Content[], config: any): OutputDefinition {
  // Process each content to transform special types
  const processedContents = contents.map((content) => ({
    ...content,
    structure: processSpecialTypes(content.structure),
  }));

  return {
    description: config.description || "AMA Definitions",
    definitions: processedContents.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.path]: { structure: curr.structure },
      }),
      {}
    ),
    args: config.args || {},
  };
}

async function getFetchImplementation(): Promise<typeof fetch> {
  // Use native fetch if available (Node.js 18+)
  if (typeof globalThis.fetch === "function") {
    return globalThis.fetch.bind(globalThis);
  }

  // Fallback to node-fetch for older Node.js versions
  try {
    // @ts-ignore
    const nodeFetch = await import("node-fetch");
    return nodeFetch.default as unknown as typeof fetch;
  } catch (error) {
    throw new Error(
      "Neither native fetch nor node-fetch is available. For Node.js < 18, install node-fetch package."
    );
  }
}

// Main migrate command function
export function migrateCommand(): Command {
  return new Command("migrate")
    .description("Migrate definitions to AtMyApp platform")
    .action(async () => {
      try {
        const config = getConfig();
        const patterns = config.include || ["**/*.ts", "**/*.tsx"];

        // Create .ama directory if it doesn't exist
        const amaDir = "./.ama";
        if (!existsSync(amaDir)) {
          mkdirSync(amaDir, { recursive: true });
        }

        // Execute migration steps
        const files = await scanFiles(patterns);
        console.log(chalk.blue(`📚 Processing ${files.length} files...`));

        const project = createProject(files);
        const { contents, errors } = processFiles(project.getSourceFiles());

        // Handle errors if any
        if (errors.length > 0) {
          console.error(chalk.red("Validation failed:\n" + errors.join("\n")));
          process.exit(1);
        }

        console.log(
          chalk.green(`✅ Found ${contents.length} valid AMA contents`)
        );

        // Generate and save output
        const output = generateOutput(contents, config);
        writeFileSync(
          "./.ama/definitions.json",
          JSON.stringify(output, null, 2)
        );
        console.log(
          chalk.green("🚀 Successfully generated ama_definitions.json")
        );

        if (!(config as any).url) {
          console.error(
            chalk.red(
              "Base URL not provided in session. Please run 'use' command first."
            )
          );
          process.exit(1);
        }

        try {
          const fetchApi = await getFetchImplementation();
          const url = `${(config as any).url}/storage/structure`;

          console.log(chalk.blue(`🔄 Posting definitions to server`));

          const response = await fetchApi(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${(config as any).token}`,
            },
            body: JSON.stringify({ content: output }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          console.log(
            chalk.green("🚀 Successfully posted definitions to storage.")
          );
        } catch (postError) {
          console.error(
            chalk.red(
              `❌ Failed to post definitions: ${
                postError instanceof Error ? postError.message : postError
              }`
            )
          );
          console.log(postError);
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.error(chalk.red(`Error: ${message}`));
        process.exit(1);
      }
    });
}

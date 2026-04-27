#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { parse } from './parser/index.js';
import { generate } from './generator/index.js';
import { createConfig } from './core/config.js';
import type { ConfigInput } from './core/config.js';

function showHelp(): void {
  console.log(`
Usage: md2word <input.md> [options]

Options:
  -o, --output <path>     Output file path (default: input.docx)
  -c, --config <path>     JSON config file path
  --title <title>         Document title
  --author <author>       Document author
  -h, --help              Show this help message

Examples:
  md2word document.md
  md2word document.md -o report.docx
  md2word document.md -c template.json --title "My Report"
`);
}

function parseArgs(args: string[]): {
  input?: string;
  output?: string;
  config?: string;
  title?: string;
  author?: string;
  help?: boolean;
} {
  const result: ReturnType<typeof parseArgs> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '-o':
      case '--output':
        result.output = args[++i];
        break;
      case '-c':
      case '--config':
        result.config = args[++i];
        break;
      case '--title':
        result.title = args[++i];
        break;
      case '--author':
        result.author = args[++i];
        break;
      case '-h':
      case '--help':
        result.help = true;
        break;
      default:
        if (!arg.startsWith('-') && !result.input) {
          result.input = arg;
        }
        break;
    }
  }

  return result;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || !args.input) {
    showHelp();
    process.exit(args.help ? 0 : 1);
  }

  try {
    // Read markdown file
    const markdown = await fs.readFile(args.input, 'utf-8');

    // Load config if provided
    let configInput: ConfigInput | undefined;
    if (args.config) {
      const configJson = await fs.readFile(args.config, 'utf-8');
      configInput = JSON.parse(configJson) as ConfigInput;
    }

    const config = createConfig(configInput);

    // Parse markdown
    const ir = parse(markdown, {
      meta: {
        title: args.title,
        author: args.author,
      },
      config,
    });

    // Determine output path
    const output = args.output || path.basename(args.input, path.extname(args.input)) + '.docx';

    // Generate document
    await generate(ir, output);

    console.log(`Successfully generated: ${output}`);
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}

main();

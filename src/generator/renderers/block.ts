import {
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  TableBorders,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
  type IRunOptions,
} from 'docx';
import type {
  BlockNode,
  ResolvedConfig,
  HeadingNode,
  ParagraphNode,
  ListNode,
  BlockquoteNode,
  CodeBlockNode,
  TableNode,
  ThematicBreakNode,
} from '../../core/types.js';
import { renderInline } from './inline.js';
import { renderImage } from './image.js';
import { ptToTwip, ptToHalfPt } from '../../utils/units.js';

let listInstanceCounter = 0;

/** Reset list counter (useful for testing) */
export function resetListCounter(): void {
  listInstanceCounter = 0;
}

export async function renderBlock(
  node: BlockNode,
  config: ResolvedConfig
): Promise<(Paragraph | Table)[]> {
  switch (node.type) {
    case 'heading':
      return [renderHeading(node, config)];
    case 'paragraph':
      return [renderParagraph(node, config)];
    case 'list':
      return renderList(node, config);
    case 'blockquote':
      return renderBlockquote(node, config);
    case 'codeBlock':
      return [renderCodeBlock(node, config)];
    case 'table':
      return [renderTable(node, config)];
    case 'image':
      return [await renderImage(node, config)];
    case 'thematicBreak':
      return [renderThematicBreak(config)];
    case 'listItem':
      return [];
    case 'tableRow':
      return [];
    case 'tableCell':
      return [];
    default:
      return [];
  }
}

function renderHeading(node: HeadingNode, config: ResolvedConfig): Paragraph {
  const headingLevels: Record<number, HeadingLevel> = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
    4: HeadingLevel.HEADING_4,
    5: HeadingLevel.HEADING_5,
    6: HeadingLevel.HEADING_6,
  };

  return new Paragraph({
    children: renderInline(node.children, config),
    heading: headingLevels[node.level],
    spacing: {
      before: ptToTwip(config.spacing.headingSpacing * (7 - node.level)),
      after: ptToTwip(config.spacing.headingSpacing),
    },
  });
}

function renderParagraph(node: ParagraphNode, config: ResolvedConfig): Paragraph {
  return new Paragraph({
    children: renderInline(node.children, config),
    spacing: {
      before: ptToTwip(config.spacing.paragraphSpacing),
      after: ptToTwip(config.spacing.paragraphSpacing),
      line: config.spacing.lineSpacing * 240,
      lineRule: 'auto',
    },
  });
}

function renderList(node: ListNode, config: ResolvedConfig, level: number = 0, instance?: number): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const reference = node.ordered ? 'numbered-list' : 'bullet-list';
  const currentInstance = instance ?? ++listInstanceCounter;

  for (const item of node.children) {
    let firstParagraph = true;
    for (const child of item.children) {
      if (child.type === 'paragraph') {
        const para = new Paragraph({
          children: renderInline(child.children, config),
          spacing: {
            before: ptToTwip(config.spacing.paragraphSpacing / 2),
            after: ptToTwip(config.spacing.paragraphSpacing / 2),
            line: config.spacing.lineSpacing * 240,
            lineRule: 'auto',
          },
          ...(firstParagraph ? {
            numbering: {
              reference,
              level,
              instance: currentInstance,
            },
          } : {
            indent: { left: 720 * (level + 1) },
          }),
        });
        paragraphs.push(para);
        firstParagraph = false;
      } else if (child.type === 'list') {
        paragraphs.push(...renderList(child, config, level + 1, currentInstance));
      } else {
        const rendered = renderBlockSync(child, config);
        for (const r of rendered) {
          if (r instanceof Paragraph) {
            paragraphs.push(r);
          }
        }
      }
    }
  }

  return paragraphs;
}

function renderBlockquote(node: BlockquoteNode, config: ResolvedConfig): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  for (const child of node.children) {
    if (child.type === 'paragraph') {
      paragraphs.push(
        new Paragraph({
          children: renderInline(child.children, config, {
            italics: true,
            color: '666666',
          } as IRunOptions),
          spacing: {
            before: ptToTwip(config.spacing.paragraphSpacing),
            after: ptToTwip(config.spacing.paragraphSpacing),
            line: config.spacing.lineSpacing * 240,
            lineRule: 'auto',
          },
          indent: { left: 720 },
          border: {
            left: {
              color: config.color.blockquoteBorder,
              space: 8,
              style: BorderStyle.SINGLE,
              size: 12,
            },
          },
        })
      );
    } else if (child.type === 'heading') {
      paragraphs.push(renderHeading(child, config));
    } else {
      const rendered = renderBlockSync(child, config);
      for (const r of rendered) {
        if (r instanceof Paragraph) {
          paragraphs.push(r);
        }
      }
    }
  }

  return paragraphs;
}

function renderCodeBlock(node: CodeBlockNode, config: ResolvedConfig): Paragraph {
  const lines = node.value.split('\n');
  const runs: TextRun[] = [];

  for (let i = 0; i < lines.length; i++) {
    runs.push(
      new TextRun({
        text: lines[i],
        font: {
          name: config.font.code,
          eastAsia: config.font.code,
        },
        size: ptToHalfPt(config.size.code),
        break: i < lines.length - 1 ? 1 : undefined,
      })
    );
  }

  return new Paragraph({
    children: runs,
    spacing: {
      before: ptToTwip(config.spacing.paragraphSpacing),
      after: ptToTwip(config.spacing.paragraphSpacing),
      line: 276,
      lineRule: 'auto',
    },
    shading: {
      fill: config.color.codeBackground,
    },
  });
}

function renderTable(node: TableNode, config: ResolvedConfig): Table {
  const rows = node.children.map((row) => {
    return new TableRow({
      children: row.children.map((cell) => {
        const paragraphs: Paragraph[] = [];
        for (const child of cell.children) {
          if (child.type === 'paragraph') {
            paragraphs.push(renderParagraph(child, config));
          } else if (child.type === 'heading') {
            paragraphs.push(renderHeading(child, config));
          }
        }
        if (paragraphs.length === 0) {
          paragraphs.push(new Paragraph({ children: [] }));
        }

        return new TableCell({
          children: paragraphs,
          shading: cell.header
            ? { fill: 'F2F2F2' }
            : undefined,
        });
      }),
    });
  });

  return new Table({
    rows,
    borders: TableBorders.ALL,
    width: { size: 100, type: 'pct' },
  });
}

function renderThematicBreak(_config: ResolvedConfig): Paragraph {
  return new Paragraph({
    border: {
      bottom: {
        color: 'CCCCCC',
        space: 1,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
    spacing: {
      before: 120,
      after: 120,
    },
  });
}

// Synchronous wrapper for non-async block types used by list/blockquote
function renderBlockSync(node: BlockNode, config: ResolvedConfig): (Paragraph | Table)[] {
  switch (node.type) {
    case 'heading':
      return [renderHeading(node, config)];
    case 'paragraph':
      return [renderParagraph(node, config)];
    case 'codeBlock':
      return [renderCodeBlock(node, config)];
    case 'thematicBreak':
      return [renderThematicBreak(config)];
    case 'table':
      return [renderTable(node, config)];
    default:
      return [];
  }
}

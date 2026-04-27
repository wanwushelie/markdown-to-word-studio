import { TextRun, type IRunOptions } from 'docx';
import type { InlineNode, ResolvedConfig } from '../../core/types.js';
import { ptToHalfPt } from '../../utils/units.js';

interface TextStyle extends IRunOptions {
  font?: {
    name: string;
    eastAsia?: string;
  };
}

export function renderInline(nodes: InlineNode[], config: ResolvedConfig, inherited: TextStyle = {}): TextRun[] {
  const runs: TextRun[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case 'text': {
        runs.push(
          new TextRun({
            ...inherited,
            text: node.value,
            font: inherited.font ?? {
              name: config.font.body,
              eastAsia: config.font.body,
            },
            size: inherited.size ?? ptToHalfPt(config.size.body),
          })
        );
        break;
      }

      case 'bold': {
        runs.push(
          ...renderInline(node.children, config, {
            ...inherited,
            bold: true,
          })
        );
        break;
      }

      case 'italic': {
        runs.push(
          ...renderInline(node.children, config, {
            ...inherited,
            italics: true,
          })
        );
        break;
      }

      case 'underline': {
        runs.push(
          ...renderInline(node.children, config, {
            ...inherited,
            underline: {
              type: 'single',
            },
          })
        );
        break;
      }

      case 'inlineCode': {
        runs.push(
          new TextRun({
            ...inherited,
            text: node.value,
            font: {
              name: config.font.code,
              eastAsia: config.font.code,
            },
            size: ptToHalfPt(config.size.code),
            shading: {
              fill: config.color.codeBackground,
            },
          })
        );
        break;
      }

      case 'link': {
        runs.push(
          ...renderInline(node.children, config, {
            ...inherited,
            color: config.color.link,
            underline: {
              type: 'single',
            },
          })
        );
        break;
      }

      case 'lineBreak': {
        runs.push(
          new TextRun({
            ...inherited,
            text: '',
            break: 1,
          })
        );
        break;
      }
    }
  }

  return runs;
}

import { TextRun, ExternalHyperlink, type IRunOptions } from 'docx';
import type { InlineNode, ResolvedConfig } from '../../core/types.js';
import { ptToHalfPt } from '../../utils/units.js';

interface TextStyle extends IRunOptions {
  font?: {
    name: string;
    eastAsia?: string;
  };
}

type InlineChild = TextRun | ExternalHyperlink;

export function renderInline(nodes: InlineNode[], config: ResolvedConfig, inherited: TextStyle = {}): InlineChild[] {
  const runs: InlineChild[] = [];

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

      case 'strikethrough': {
        runs.push(
          ...renderInline(node.children, config, {
            ...inherited,
            strike: true,
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
        const linkChildren = renderInline(node.children, config, {
          ...inherited,
          color: config.color.link,
          underline: {
            type: 'single',
          },
        });
        // Filter to only TextRun for ExternalHyperlink children
        const textChildren = linkChildren.filter((c): c is TextRun => c instanceof TextRun);
        runs.push(
          new ExternalHyperlink({
            children: textChildren,
            link: node.href,
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

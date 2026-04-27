import type Token from 'markdown-it/lib/token.mjs';
import type {
  BlockNode,
  InlineNode,
  HeadingNode,
  ParagraphNode,
  ListNode,
  ListItemNode,
  BlockquoteNode,
  CodeBlockNode,
  TableNode,
  TableRowNode,
  TableCellNode,
  ImageNode,
  ThematicBreakNode,
  TextNode,
  BoldNode,
  ItalicNode,
  UnderlineNode,
  InlineCodeNode,
  LinkNode,
  LineBreakNode,
} from '../core/types.js';

export function transformTokens(tokens: Token[]): BlockNode[] {
  const nodes: BlockNode[] = [];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];
    const { node, consumed } = transformBlockToken(token, tokens, i);
    if (node) {
      nodes.push(node);
    }
    i += consumed;
  }

  return nodes;
}

function transformBlockToken(
  token: Token,
  tokens: Token[],
  index: number
): { node: BlockNode | null; consumed: number } {
  switch (token.type) {
    case 'heading_open': {
      const level = parseInt(token.tag.slice(1), 10) as 1 | 2 | 3 | 4 | 5 | 6;
      const inlineToken = tokens[index + 1];
      const children = inlineToken?.type === 'inline' ? transformInlineTokens(inlineToken.children ?? []) : [];
      return { node: { type: 'heading', level, children }, consumed: 3 };
    }

    case 'paragraph_open': {
      const inlineToken = tokens[index + 1];
      const children = inlineToken?.type === 'inline' ? transformInlineTokens(inlineToken.children ?? []) : [];
      return { node: { type: 'paragraph', children }, consumed: 3 };
    }

    case 'bullet_list_open': {
      const { node, consumed } = parseList(tokens, index, false);
      return { node, consumed };
    }

    case 'ordered_list_open': {
      const { node, consumed } = parseList(tokens, index, true);
      return { node, consumed };
    }

    case 'blockquote_open': {
      const { node, consumed } = parseBlockquote(tokens, index);
      return { node, consumed };
    }

    case 'code_block':
    case 'fence': {
      return {
        node: {
          type: 'codeBlock',
          language: token.info || undefined,
          value: token.content,
        },
        consumed: 1,
      };
    }

    case 'table_open': {
      const { node, consumed } = parseTable(tokens, index);
      return { node, consumed };
    }

    case 'hr': {
      return { node: { type: 'thematicBreak' }, consumed: 1 };
    }

    case 'inline': {
      // Standalone inline (rare, but can happen)
      const children = transformInlineTokens(token.children ?? []);
      return { node: { type: 'paragraph', children }, consumed: 1 };
    }

    case 'html_block': {
      // Try to extract images from HTML blocks
      const imgMatch = token.content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
      if (imgMatch) {
        const src = imgMatch[1];
        const altMatch = token.content.match(/alt=["']([^"]*)["']/i);
        const alt = altMatch ? altMatch[1] : undefined;
        return {
          node: { type: 'image', src, alt, align: 'center' },
          consumed: 1,
        };
      }
      // Fall through to paragraph for other HTML
      const children: InlineNode[] = [{ type: 'text', value: token.content }];
      return { node: { type: 'paragraph', children }, consumed: 1 };
    }

    default:
      return { node: null, consumed: 1 };
  }
}

function parseList(tokens: Token[], startIndex: number, ordered: boolean): { node: ListNode; consumed: number } {
  const openToken = tokens[startIndex];
  const start = ordered ? (openToken.attrGet('start') ? parseInt(openToken.attrGet('start')!, 10) : 1) : undefined;
  const children: ListItemNode[] = [];
  let i = startIndex + 1;

  while (i < tokens.length && tokens[i].type !== 'bullet_list_close' && tokens[i].type !== 'ordered_list_close') {
    if (tokens[i].type === 'list_item_open') {
      const { node, consumed } = parseListItem(tokens, i);
      children.push(node);
      i += consumed;
    } else {
      i++;
    }
  }

  return {
    node: { type: 'list', ordered, start, children },
    consumed: i - startIndex + 1,
  };
}

function parseListItem(tokens: Token[], startIndex: number): { node: ListItemNode; consumed: number } {
  const children: BlockNode[] = [];
  let i = startIndex + 1;

  while (i < tokens.length && tokens[i].type !== 'list_item_close') {
    const { node, consumed } = transformBlockToken(tokens[i], tokens, i);
    if (node) {
      children.push(node);
    }
    i += consumed || 1;
  }

  return {
    node: { type: 'listItem', children },
    consumed: i - startIndex + 1,
  };
}

function parseBlockquote(tokens: Token[], startIndex: number): { node: BlockquoteNode; consumed: number } {
  const children: BlockNode[] = [];
  let i = startIndex + 1;

  while (i < tokens.length && tokens[i].type !== 'blockquote_close') {
    const { node, consumed } = transformBlockToken(tokens[i], tokens, i);
    if (node) {
      children.push(node);
    }
    i += consumed || 1;
  }

  return {
    node: { type: 'blockquote', children },
    consumed: i - startIndex + 1,
  };
}

function parseTable(tokens: Token[], startIndex: number): { node: TableNode; consumed: number } {
  const rows: TableRowNode[] = [];
  let i = startIndex + 1;

  while (i < tokens.length && tokens[i].type !== 'table_close') {
    if (tokens[i].type === 'thead_open' || tokens[i].type === 'tbody_open') {
      i++;
      continue;
    }
    if (tokens[i].type === 'thead_close' || tokens[i].type === 'tbody_close') {
      i++;
      continue;
    }
    if (tokens[i].type === 'tr_open') {
      const { node, consumed } = parseTableRow(tokens, i);
      rows.push(node);
      i += consumed;
    } else {
      i++;
    }
  }

  return {
    node: { type: 'table', children: rows },
    consumed: i - startIndex + 1,
  };
}

function parseTableRow(tokens: Token[], startIndex: number): { node: TableRowNode; consumed: number } {
  const cells: TableCellNode[] = [];
  let i = startIndex + 1;

  while (i < tokens.length && tokens[i].type !== 'tr_close') {
    if (tokens[i].type === 'th_open' || tokens[i].type === 'td_open') {
      const isHeader = tokens[i].type === 'th_open';
      const inlineToken = tokens[i + 1];
      const children = inlineToken?.type === 'inline'
        ? transformInlineTokens(inlineToken.children ?? [])
        : [];
      cells.push({
        type: 'tableCell',
        header: isHeader,
        children: [{ type: 'paragraph', children }],
      });
      i += 3; // th_open, inline, th_close
    } else {
      i++;
    }
  }

  return {
    node: { type: 'tableRow', children: cells },
    consumed: i - startIndex + 1,
  };
}

export function transformInlineTokens(tokens: Token[]): InlineNode[] {
  const nodes: InlineNode[] = [];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    switch (token.type) {
      case 'text': {
        nodes.push({ type: 'text', value: token.content });
        i++;
        break;
      }

      case 'strong_open': {
        const { children, consumed } = collectUntil(tokens, i, 'strong_close');
        nodes.push({ type: 'bold', children: transformInlineTokens(children) });
        i += consumed;
        break;
      }

      case 'em_open': {
        const { children, consumed } = collectUntil(tokens, i, 'em_close');
        nodes.push({ type: 'italic', children: transformInlineTokens(children) });
        i += consumed;
        break;
      }

      case 'code_inline': {
        nodes.push({ type: 'inlineCode', value: token.content });
        i++;
        break;
      }

      case 'link_open': {
        const href = token.attrGet('href') ?? '';
        const { children, consumed } = collectUntil(tokens, i, 'link_close');
        nodes.push({
          type: 'link',
          href,
          children: transformInlineTokens(children),
        });
        i += consumed;
        break;
      }

      case 'image': {
        const src = token.attrGet('src') ?? '';
        const alt = token.attrGet('alt') ?? undefined;
        nodes.push({
          type: 'text',
          value: alt || '[image]',
        });
        i++;
        break;
      }

      case 'softbreak':
      case 'hardbreak': {
        nodes.push({ type: 'lineBreak' });
        i++;
        break;
      }

      case 'html_inline': {
        if (token.content === '<u>') {
          const { children, consumed } = collectHtmlUntil(tokens, i, '</u>');
          nodes.push({ type: 'underline', children: transformInlineTokens(children) });
          i += consumed;
        } else if (token.content === '<br>' || token.content === '<br/>' || token.content === '<br />') {
          nodes.push({ type: 'lineBreak' });
          i++;
        } else {
          nodes.push({ type: 'text', value: token.content });
          i++;
        }
        break;
      }

      case 's_open': {
        const { children, consumed } = collectUntil(tokens, i, 's_close');
        nodes.push({ type: 'strikethrough', children: transformInlineTokens(children) });
        i += consumed;
        break;
      }

      default:
        i++;
        break;
    }
  }

  return nodes;
}

function collectUntil(tokens: Token[], startIndex: number, closeType: string): { children: Token[]; consumed: number } {
  const children: Token[] = [];
  let i = startIndex + 1;

  while (i < tokens.length && tokens[i].type !== closeType) {
    children.push(tokens[i]);
    i++;
  }

  return { children, consumed: i - startIndex + 1 };
}

function collectHtmlUntil(tokens: Token[], startIndex: number, closeHtml: string): { children: Token[]; consumed: number } {
  const children: Token[] = [];
  let i = startIndex + 1;

  while (i < tokens.length) {
    if (tokens[i].type === 'html_inline' && tokens[i].content === closeHtml) {
      break;
    }
    children.push(tokens[i]);
    i++;
  }

  return { children, consumed: i - startIndex + 1 };
}

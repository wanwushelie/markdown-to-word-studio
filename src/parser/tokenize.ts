import MarkdownIt from 'markdown-it';
import type Token from 'markdown-it/lib/token.mjs';

export function createMarkdownParser(): MarkdownIt {
  return new MarkdownIt('commonmark', {
    html: true,
    linkify: true,
    typographer: true,
  }).enable('table');
}

export function tokenize(md: string): Token[] {
  const parser = createMarkdownParser();
  return parser.parse(md, {});
}

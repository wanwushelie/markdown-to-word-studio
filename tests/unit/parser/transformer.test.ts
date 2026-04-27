import { describe, it, expect } from 'vitest';
import { transformTokens } from '../../../src/parser/transformer.js';
import { tokenize } from '../../../src/parser/tokenize.js';

describe('transformer', () => {
  it('should transform heading', () => {
    const tokens = tokenize('# Hello');
    const nodes = transformTokens(tokens);

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      type: 'heading',
      level: 1,
    });
    expect((nodes[0] as any).children[0]).toMatchObject({
      type: 'text',
      value: 'Hello',
    });
  });

  it('should transform paragraph with bold and italic', () => {
    const tokens = tokenize('This is **bold** and *italic*.');
    const nodes = transformTokens(tokens);

    expect(nodes).toHaveLength(1);
    expect(nodes[0].type).toBe('paragraph');
    const children = (nodes[0] as any).children;
    expect(children.length).toBeGreaterThanOrEqual(4);
    expect(children[0]).toMatchObject({ type: 'text', value: 'This is ' });
    expect(children[1]).toMatchObject({ type: 'bold' });
    expect(children[2]).toMatchObject({ type: 'text', value: ' and ' });
    expect(children[3]).toMatchObject({ type: 'italic' });
  });

  it('should transform unordered list', () => {
    const tokens = tokenize('- Item 1\n- Item 2');
    const nodes = transformTokens(tokens);

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      type: 'list',
      ordered: false,
    });
    expect((nodes[0] as any).children).toHaveLength(2);
  });

  it('should transform ordered list', () => {
    const tokens = tokenize('1. First\n2. Second');
    const nodes = transformTokens(tokens);

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      type: 'list',
      ordered: true,
    });
  });

  it('should transform code block', () => {
    const tokens = tokenize('```js\nconsole.log("hi");\n```');
    const nodes = transformTokens(tokens);

    expect(nodes).toHaveLength(1);
    const cb = nodes[0] as any;
    expect(cb.type).toBe('codeBlock');
    expect(cb.language).toBe('js');
    expect(cb.value.trim()).toBe('console.log("hi");');
  });

  it('should transform blockquote', () => {
    const tokens = tokenize('> Quote text');
    const nodes = transformTokens(tokens);

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      type: 'blockquote',
    });
  });

  it('should transform table', () => {
    const tokens = tokenize('| A | B |\n|---|---|\n| 1 | 2 |');
    const nodes = transformTokens(tokens);

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      type: 'table',
    });
    expect((nodes[0] as any).children).toHaveLength(2); // header row + data row
  });
});

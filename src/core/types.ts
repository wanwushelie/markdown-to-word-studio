export interface DocumentMeta {
  title?: string;
  author?: string;
  date?: string;
}

export interface DocumentIR {
  type: 'document';
  meta: DocumentMeta;
  config: ResolvedConfig;
  children: BlockNode[];
}

// Block nodes
export interface HeadingNode {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: InlineNode[];
}

export interface ParagraphNode {
  type: 'paragraph';
  children: InlineNode[];
}

export interface ListNode {
  type: 'list';
  ordered: boolean;
  start?: number;
  children: ListItemNode[];
}

export interface ListItemNode {
  type: 'listItem';
  children: BlockNode[];
}

export interface BlockquoteNode {
  type: 'blockquote';
  children: BlockNode[];
}

export interface CodeBlockNode {
  type: 'codeBlock';
  language?: string;
  value: string;
}

export interface TableNode {
  type: 'table';
  children: TableRowNode[];
}

export interface TableRowNode {
  type: 'tableRow';
  children: TableCellNode[];
}

export interface TableCellNode {
  type: 'tableCell';
  header: boolean;
  children: BlockNode[];
}

export interface ImageNode {
  type: 'image';
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  align?: 'left' | 'center' | 'right';
}

export interface ThematicBreakNode {
  type: 'thematicBreak';
}

export type BlockNode =
  | HeadingNode
  | ParagraphNode
  | ListNode
  | ListItemNode
  | BlockquoteNode
  | CodeBlockNode
  | TableNode
  | TableRowNode
  | TableCellNode
  | ImageNode
  | ThematicBreakNode;

// Inline nodes
export interface TextNode {
  type: 'text';
  value: string;
}

export interface BoldNode {
  type: 'bold';
  children: InlineNode[];
}

export interface ItalicNode {
  type: 'italic';
  children: InlineNode[];
}

export interface UnderlineNode {
  type: 'underline';
  children: InlineNode[];
}

export interface InlineCodeNode {
  type: 'inlineCode';
  value: string;
}

export interface LinkNode {
  type: 'link';
  href: string;
  children: InlineNode[];
}

export interface LineBreakNode {
  type: 'lineBreak';
}

export type InlineNode =
  | TextNode
  | BoldNode
  | ItalicNode
  | UnderlineNode
  | InlineCodeNode
  | LinkNode
  | LineBreakNode;

// Configuration types
export interface FontConfig {
  body: string;
  heading: string;
  english: string;
  code: string;
}

export interface SizeConfig {
  body: number;
  heading1: number;
  heading2: number;
  heading3: number;
  heading4: number;
  heading5: number;
  heading6: number;
  code: number;
}

export interface SpacingConfig {
  lineSpacing: number;
  paragraphSpacing: number;
  headingSpacing: number;
}

export interface MarginConfig {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface ImageConfig {
  maxWidthPercent: number;
  defaultAlign: 'left' | 'center' | 'right';
}

export interface HeaderFooterConfig {
  header?: string;
  footer?: string;
  pageNumbers?: boolean;
}

export interface ColorConfig {
  heading: string;
  text: string;
  link: string;
  codeBackground: string;
  blockquoteBorder: string;
}

export interface ResolvedConfig {
  font: FontConfig;
  size: SizeConfig;
  spacing: SpacingConfig;
  margin: MarginConfig;
  image: ImageConfig;
  headerFooter: HeaderFooterConfig;
  color: ColorConfig;
  pageSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
}

import type { ResolvedConfig } from '../core/types.js';
import { StyleForParagraph } from 'docx';
import { ptToHalfPt, ptToTwip } from '../utils/units.js';

export function createStyles(config: ResolvedConfig): StyleForParagraph[] {
  const headingSizes = [
    config.size.heading1,
    config.size.heading2,
    config.size.heading3,
    config.size.heading4,
    config.size.heading5,
    config.size.heading6,
  ];

  const headingStyles: StyleForParagraph[] = Array.from({ length: 6 }, (_, i) => {
    const level = i + 1;
    return new StyleForParagraph({
      id: `Heading${level}`,
      name: `Heading ${level}`,
      basedOn: 'Normal',
      next: 'Normal',
      quickFormat: true,
      run: {
        font: {
          ascii: config.font.english,
          hAnsi: config.font.english,
          eastAsia: config.font.heading,
          cs: config.font.english,
          name: config.font.heading, // Fallback
        },
        size: ptToHalfPt(headingSizes[i]),
        bold: level <= 2,
        color: config.color.heading,
      },
      paragraph: {
        spacing: {
          before: ptToTwip(config.spacing.headingSpacing * (7 - level)),
          after: ptToTwip(config.spacing.headingSpacing),
          line: config.spacing.lineSpacing * 240,
          lineRule: 'auto',
        },
        outlineLevel: i,
      },
    });
  });

  const normalStyle = new StyleForParagraph({
    id: 'Normal',
    name: 'Normal',
    run: {
      font: {
        ascii: config.font.english,
        hAnsi: config.font.english,
        eastAsia: config.font.body,
        cs: config.font.english,
        name: config.font.body, // Fallback
      },
      size: ptToHalfPt(config.size.body),
      color: config.color.text,
    },
    paragraph: {
      spacing: {
        line: config.spacing.lineSpacing * 240,
        lineRule: 'auto',
        before: ptToTwip(config.spacing.paragraphSpacing),
        after: ptToTwip(config.spacing.paragraphSpacing),
      },
    },
  });

  const codeStyle = new StyleForParagraph({
    id: 'CodeBlock',
    name: 'Code Block',
    basedOn: 'Normal',
    run: {
      font: {
        ascii: config.font.code,
        hAnsi: config.font.code,
        eastAsia: config.font.code,
        cs: config.font.code,
        name: config.font.code, // Fallback
      },
      size: ptToHalfPt(config.size.code),
    },
    paragraph: {
      spacing: {
        before: ptToTwip(config.spacing.paragraphSpacing),
        after: ptToTwip(config.spacing.paragraphSpacing),
        line: 276,
        lineRule: 'auto',
      },
      shading: {
        fill: config.color.codeBackground,
      },
    },
  });

  const quoteStyle = new StyleForParagraph({
    id: 'Quote',
    name: 'Quote',
    basedOn: 'Normal',
    run: {
      italics: true,
      color: '666666',
    },
    paragraph: {
      spacing: {
        before: ptToTwip(config.spacing.paragraphSpacing),
        after: ptToTwip(config.spacing.paragraphSpacing),
        line: config.spacing.lineSpacing * 240,
        lineRule: 'auto',
      },
      indent: { left: 720 },
    },
  });

  return [normalStyle, ...headingStyles, codeStyle, quoteStyle];
}

export function getHeadingSize(level: number, config: ResolvedConfig): number {
  const sizes = [
    config.size.heading1,
    config.size.heading2,
    config.size.heading3,
    config.size.heading4,
    config.size.heading5,
    config.size.heading6,
  ];
  return sizes[level - 1] ?? config.size.body;
}

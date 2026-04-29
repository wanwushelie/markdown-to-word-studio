import { ImageRun, Paragraph, AlignmentType } from 'docx';
import type { ImageNode, ResolvedConfig } from '../../core/types.js';
import { readImage, calculateScaledDimensions } from '../../utils/image.js';
import { pxToEmu, getPageWidthEmu } from '../../utils/units.js';

export async function renderImage(
  node: ImageNode,
  config: ResolvedConfig
): Promise<Paragraph> {
  try {
    const meta = await readImage(node.src);
    const pageWidthEmu = getPageWidthEmu(config.pageSize, config.orientation);
    const marginTwip = config.margin.left + config.margin.right;
    const marginPx = (marginTwip / 20) * 1.333; // twip -> pt -> px (approx)
    const maxWidthPx = ((pageWidthEmu / 9525) - marginPx) * (config.image.maxWidthPercent / 100);

    const { width, height } = calculateScaledDimensions(
      meta.width,
      meta.height,
      Math.max(maxWidthPx, 100)
    );

    const align = node.align ?? config.image.defaultAlign;
    const alignmentMap: Record<string, (typeof AlignmentType)[keyof typeof AlignmentType]> = {
      left: AlignmentType.LEFT,
      center: AlignmentType.CENTER,
      right: AlignmentType.RIGHT,
    };

    const imageType = meta.extension === 'jpeg' ? 'jpg' : meta.extension;
    const imageRun = new ImageRun({
      data: meta.buffer,
      transformation: {
        width: Math.round(width),
        height: Math.round(height),
      },
      type: imageType as 'png' | 'jpg' | 'gif' | 'bmp',
    });

    return new Paragraph({
      children: [imageRun],
      alignment: alignmentMap[align] ?? AlignmentType.CENTER,
      spacing: {
        before: 120,
        after: 120,
      },
    });
  } catch {
    // Fallback: render alt text as paragraph
    return new Paragraph({
      children: [
        new ImageRun({
          data: new Uint8Array(),
          transformation: { width: 1, height: 1 },
          type: 'png',
        }),
      ],
      alignment: AlignmentType.CENTER,
    });
  }
}

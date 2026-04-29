export function parseNaturalLanguage(text: string): Record<string, any> {
  const config: Record<string, any> = {};
  if (/宋体/.test(text)) config['body-font'] = 'SimSun';
  if (/黑体/.test(text)) config['heading-font'] = 'SimHei';
  if (/楷体/.test(text)) config['body-font'] = 'KaiTi';
  if (/微软雅黑/.test(text)) config['body-font'] = 'Microsoft YaHei';
  
  const sizeMatch = text.match(/([0-9]+)号字/);
  if (sizeMatch) config['body-size'] = parseInt(sizeMatch[1]);
  
  const lineSpaceMatch = text.match(/行距([0-9.]+)倍/);
  if (lineSpaceMatch) config['line-spacing'] = parseFloat(lineSpaceMatch[1]);
  
  if (/A4/.test(text)) config['page-size'] = 'A4';
  if (/横向/.test(text)) config['orientation'] = 'landscape';
  if (/纵向/.test(text)) config['orientation'] = 'portrait';
  
  return config;
}

export function parseSmartInput(input: string) {
  let parsed: Record<string, any> = {};
  input = input.trim();
  
  if (input.startsWith('{')) {
    const json = JSON.parse(input);
    parsed = {
      'body-font': json.font?.body,
      'heading-font': json.font?.heading,
      'english-font': json.font?.english,
      'code-font': json.font?.code,
      'body-size': json.size?.body,
      'h1-size': json.size?.heading1,
      'h2-size': json.size?.heading2,
      'h3-size': json.size?.heading3,
      'h4-size': json.size?.heading4,
      'h5-size': json.size?.heading5,
      'h6-size': json.size?.heading6,
      'code-size': json.size?.code,
      'line-spacing': json.spacing?.lineSpacing,
      'paragraph-spacing': json.spacing?.paragraphSpacing,
      'heading-spacing': json.spacing?.headingSpacing,
      'margin-top': json.margin?.top,
      'margin-bottom': json.margin?.bottom,
      'margin-left': json.margin?.left,
      'margin-right': json.margin?.right,
      'heading-color': json.color?.heading,
      'text-color': json.color?.text,
      'link-color': json.color?.link,
      'code-bg-color': json.color?.codeBackground,
      'quote-border-color': json.color?.blockquoteBorder,
      'page-size': json.pageSize,
      'orientation': json.orientation,
      'header-text': json.headerFooter?.header,
      'footer-text': json.headerFooter?.footer,
      'page-numbers': json.headerFooter?.pageNumbers,
      'image-max-width': json.image?.maxWidthPercent,
      'image-align': json.image?.defaultAlign,
      'doc-title': json.meta?.title,
      'doc-author': json.meta?.author,
    };
  } else if (input.includes(':')) {
    input.split('\\n').forEach(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim().toLowerCase();
        let val: any = parts.slice(1).join(':').trim();
        if (val === 'true') val = true;
        if (val === 'false') val = false;
        if (typeof val === 'string' && val.includes('(')) val = val.split('(')[0].trim();
        parsed[key] = val;
      }
    });
  } else {
    parsed = parseNaturalLanguage(input);
  }

  if (parsed['margins']) {
    parsed['margin-top'] = parsed['margins'];
    parsed['margin-bottom'] = parsed['margins'];
    parsed['margin-left'] = parsed['margins'];
    parsed['margin-right'] = parsed['margins'];
  }

  return parsed;
}

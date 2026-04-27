export class MarkdownParseError extends Error {
  constructor(message: string, public readonly source?: string) {
    super(message);
    this.name = 'MarkdownParseError';
  }
}

export class DocxGenerationError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'DocxGenerationError';
  }
}

export class ImageProcessingError extends Error {
  constructor(message: string, public readonly src: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'ImageProcessingError';
  }
}

export class ConfigValidationError extends Error {
  constructor(message: string, public readonly issues?: unknown[]) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

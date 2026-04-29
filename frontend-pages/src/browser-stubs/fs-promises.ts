export async function readFile(): Promise<never> {
  throw new Error('Local file paths are not available in the browser.');
}

export function getRandomStr(length: number) {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .slice(0, 5);
}

export function serializeParams(params: Record<string, unknown>): string {
  // @ts-expect-error
  return new URLSearchParams(params).toString();
}

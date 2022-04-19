/**
 * 获取指定长度随机字符串
 */
export function getRandomStr(length: number) {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .slice(0, 5);
}

/**
 * 序列化 URL 参数
 */
export function serializeParams(params: Record<string, unknown>): string {
  // @ts-expect-error
  return new URLSearchParams(params).toString();
}

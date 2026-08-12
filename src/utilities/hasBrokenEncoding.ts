const commonUtf8Mojibake = /(?:Ð.|Ñ.|Р.|С.){2,}/u

export function hasBrokenEncoding(value: string): boolean {
  return value.includes('\uFFFD') || commonUtf8Mojibake.test(value)
}

export function truncateValue(val: string, length = 9): string {
  return val.length <= length ? val : `${val.slice(0, length)}...${val.slice(-length)}`
}

export async function writeClipboardValue(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    return false
  }
}

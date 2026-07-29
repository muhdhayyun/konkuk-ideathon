// Vertex AI's grounding chunks (and some other redirect-style links) point at an
// intermediary redirector, not the actual source page. Resolve each to its real
// destination so users see (and can click) the genuine URL rather than an opaque
// redirect link.
export async function resolveRedirect(url: string, timeoutMs = 4000): Promise<string> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal })
    clearTimeout(timeout)
    return res.url || url
  } catch {
    return url
  }
}

export async function resolveAll(urls: string[], timeoutMs = 4000): Promise<Map<string, string>> {
  const resolved = new Map<string, string>()
  await Promise.all(
    urls.map(async (url) => {
      resolved.set(url, await resolveRedirect(url, timeoutMs))
    }),
  )
  return resolved
}

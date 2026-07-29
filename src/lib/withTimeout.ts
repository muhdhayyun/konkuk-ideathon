// Caps how long any single collector can run. A collector that times out contributes
// `fallback` (normally []) — same as one that failed — so one slow source can never
// block the other three or blow the whole request past the serverless function's
// execution limit.
export async function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout>
  const timeout = new Promise<T>((resolve) => {
    timeoutHandle = setTimeout(() => resolve(fallback), ms)
  })
  try {
    return await Promise.race([promise, timeout])
  } finally {
    clearTimeout(timeoutHandle!)
  }
}

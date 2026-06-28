import { cookies } from "next/headers"

export interface Session {
  uid: string
  email: string
  provider: string
  name: string
}

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const raw = cookieStore.get("__session")?.value
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed.uid) return null
    return parsed as Session
  } catch {
    return null
  }
}

export async function getUserId(): Promise<string | undefined> {
  const session = await getSession()
  return session?.uid
}

import crypto from "crypto"

const API_KEY = process.env.X_API_KEY!
const API_KEY_SECRET = process.env.X_API_KEY_SECRET!
const ACCESS_TOKEN = process.env.X_ACCESS_TOKEN!
const ACCESS_TOKEN_SECRET = process.env.X_ACCESS_TOKEN_SECRET!

function percentEncode(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase())
}

function generateOAuthSignature(method: string, url: string, params: Record<string, string>, tokenSecret: string): string {
  const sortedParams = Object.keys(params).sort().map((k) => `${percentEncode(k)}=${percentEncode(params[k])}`).join("&")
  const baseString = `${method}&${percentEncode(url)}&${percentEncode(sortedParams)}`
  const signingKey = `${percentEncode(API_KEY_SECRET)}&${percentEncode(tokenSecret)}`
  return crypto.createHmac("sha1", signingKey).update(baseString).digest("base64")
}

function generateOAuthHeader(method: string, url: string): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: API_KEY,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: ACCESS_TOKEN,
    oauth_version: "1.0",
  }

  const signature = generateOAuthSignature(method, url, oauthParams, ACCESS_TOKEN_SECRET)
  oauthParams.oauth_signature = signature

  const headerParts = Object.keys(oauthParams).sort().map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
  return `OAuth ${headerParts.join(", ")}`
}

export async function postTweet(text: string): Promise<{ id: string } | null> {
  const url = "https://api.x.com/2/tweets"
  const authHeader = generateOAuthHeader("POST", url)

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("Tweet failed:", response.status, error)
    return null
  }

  const data = await response.json()
  return { id: data.data?.id }
}

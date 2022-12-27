import { CookieOptions, RequestContext } from "@builder.io/qwik-city/middleware/request-handler";
import { parseCookie, splitCookieHeader } from "./cookie";
import { ContentType } from "./types";

export const getBody = async (req: RequestContext): Promise<Record<string, any> | undefined> => {
  if (req.method !== "POST") return

  const contentType = req.headers.get("content-type")
  if (contentType?.includes("application/json")) {
    return await req.json()
  } else if (contentType?.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(await req.text());
    return params;
  }
}

export const processResponse = async (res: Response) => {
  let redirect: URL | undefined;
  const cookies: {
    name: string;
    value: string;
    options: CookieOptions
  }[] = [];
  let content;
  let contentType: ContentType = "html";
  let headers = new Headers();

  // set response headers
  for (const header of res.headers || []) {
    if (header[0].toLowerCase() !== "set-cookie")
      headers.append(header[0], header[1]);
    if (header[0].toLowerCase() === "content-type" && header[1].toLowerCase() === "application/json")
      contentType = 'json'
    if (header[0].toLowerCase() === "location") {
      redirect = new URL(header[1])
    }
  };

  const cookieHeader = res.headers.get('set-cookie') || "";
  const splitCookies = splitCookieHeader(cookieHeader);

  splitCookies.forEach(cookie => {
    const { name, value, ...options } = parseCookie(cookie);
    const opts = options as CookieOptions;
    cookies.push({ name, value, options: opts });
  });

  content = contentType === 'json' ? await res.json() : await res.text();

  return { content, contentType, redirect, cookies }
}

export const requestContextToRequest = (requestContext: RequestContext, body?: Record<string, any>, newUrl?: string): Request => {
  const url = new URL((newUrl ?? requestContext.url).replace(/\/$/, ""));

  return new Request(url, {
    method: requestContext.method,
    headers: requestContext.headers,
    // @ts-ignore
    body
  });
}
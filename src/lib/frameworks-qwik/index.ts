import { Cookie, CookieOptions, RequestContext, RequestEvent, RequestHandler, ResponseContext } from "@builder.io/qwik-city";
import { AuthAction, AuthHandler, AuthOptions, Session } from "@auth/core";
import { parseString } from 'set-cookie-parser';

export interface QwikCityAuthOptions extends AuthOptions {
  /**
   * Defines the base path for the auth routes.
   * @default '/api/auth'
   */
  prefix?: string
}

// prettier-ignore
const actions: AuthAction[] = [ "providers", "session", "csrf", "signin", "signout", "callback", "verify-request", "error", "_log" ];

const processResponse = (res: Response, resCtx: ResponseContext, cookie: Cookie) => {
  let jsonBody = false;
  let redirect = "";

  // set response headers
  for (const header of res.headers || []) {
    if (header[0].toLowerCase() !== "set-cookie")
      resCtx.headers.append(header[0], header[1]);
    if (header[0].toLowerCase() === "content-type" && header[1].toLowerCase() === "application/json")
      jsonBody = true;
    if (header[0].toLowerCase() === "location") {
      redirect = header[1]
    }
  };

  // set response cookies
  const cookies = res.headers.get('set-cookie') || "";
  if (cookies)
    cookies.split(", ").forEach(c => {
      const { name, value, ...options } = parseString(c);
      const opts = options as CookieOptions;
      cookie.set(name, encodeURI(value), opts);
    });

  if (redirect)
    throw resCtx.redirect(redirect, 302);

  return jsonBody ? res.json() : res.text();
}

async function getBody(req: RequestContext): Promise<Record<string, any> | undefined> {
  if (req.method !== "POST") return

  const contentType = req.headers.get("content-type")
  if (contentType?.includes("application/json")) {
    return await req.json()
  } else if (contentType?.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(await req.text());
    return params;
  }
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

async function QwikCityAuthHandler(
  event: RequestEvent,
  prefix: string,
  authOptions: AuthOptions
) {
  const { cookie, request, response, url } = event;
  const body = await getBody(request);
  const req = requestContextToRequest(request, body);

  const [action] = url.pathname.slice(prefix.length + 1).split("/");
  if (
    actions.includes(action as AuthAction) &&
    url.pathname.startsWith(prefix + "/")
  ) {
    const res = await AuthHandler(req, authOptions);
    const value = processResponse(res, response, cookie);

    return value;
  }
}

export default function QwikCityAuth(options: QwikCityAuthOptions): {
  onRequest: RequestHandler,
} {
  const { prefix = "/api/auth", ...authOptions } = options
  authOptions.secret ??= import.meta.env.VITE_AUTH_SECRET
  authOptions.trustHost ??= !!(
    import.meta.env.AUTH_TRUST_HOST ??
    import.meta.env.VERCEL ??
    import.meta.env.DEV
  )

  return {
    onRequest: (event) => QwikCityAuthHandler(event, prefix, authOptions),
  }
}

export const getServerSession = async (
  event: RequestEvent,
  authOptions: AuthOptions
): Promise<Session | null> => {
  const { cookie, request, response, url } = event;
  url.pathname = "/api/auth/session";
  request.url = url.toString();

  const req = requestContextToRequest(request);

  const res = await AuthHandler(req, authOptions);
  const value = await processResponse(res, response, cookie);

  if (value && typeof value !== "string" && Object.keys(value).length) {
    return value;
  }
  return null;
};
import { AuthAction, AuthHandler, AuthOptions, Session } from "@auth/core";
import { RequestEvent, RequestHandler } from "@builder.io/qwik-city/middleware/request-handler";
import { QwikCityAuthOptions } from "./types";
import { getBody, processResponse, requestContextToRequest } from "./utils";

// prettier-ignore
const actions: AuthAction[] = [ "providers", "session", "csrf", "signin", "signout", "callback", "verify-request", "error", "_log" ];

const QwikCityAuthHandler = async (
  event: RequestEvent,
  prefix: string,
  authOptions: AuthOptions
) => {
  const { request, url, json, html, cookie, error } = event;
  const body = await getBody(request);
  const req = requestContextToRequest(request, body);

  const [action] = url.pathname.slice(prefix.length + 1).split("/");
  if (
    actions.includes(action as AuthAction) &&
    url.pathname.startsWith(prefix + "/")
  ) {
    const res = await AuthHandler(req, authOptions);
    const { content, contentType, redirect, cookies } = await processResponse(res);

    cookies.forEach(c => cookie.set(c.name, c.value, c.options));

    if (redirect && redirect.toString().length > 0)
      throw event.redirect(302, redirect.toString());

    if (contentType === 'json')
      json(200, content);
    else
      html(200, content);
  } else {
    throw error(404, "Not Found");
  }

}

export const QwikCityAuth = (options: QwikCityAuthOptions = { prefix: "/api/auth", providers: [] }): {
  onRequest: RequestHandler,
} => {
  const { prefix = "/api/auth", ...authOptions } = options
  authOptions.secret ??= import.meta.env.VITE_AUTH_SECRET
  authOptions.trustHost ??= !!(
    import.meta.env.AUTH_TRUST_HOST ??
    import.meta.env.VERCEL ??
    import.meta.env.DEV
  )

  return {
    onRequest: (event: RequestEvent) => QwikCityAuthHandler(event, prefix, authOptions),
  }
}

export const getSession = async (
  event: RequestEvent,
  authOptions: QwikCityAuthOptions = { prefix: '/api/auth', providers: [] }
): Promise<Session | null> => {
  const { request, url } = event;
  url.pathname = `${authOptions.prefix}/session`;
  authOptions.secret ??= import.meta.env.VITE_AUTH_SECRET;
  authOptions.trustHost ??= !!(
    import.meta.env.AUTH_TRUST_HOST ??
    import.meta.env.VERCEL ??
    import.meta.env.DEV
  );

  const req = requestContextToRequest(request, undefined, url.toString());
  const res = await AuthHandler(req, authOptions);
  const { content, contentType } = await processResponse(res);

  if (content && typeof content !== "string" && Object.keys(content).length && contentType === "json") {
    return content;
  }
  return null;
};
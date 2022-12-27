import { Auth } from "@auth/core";
import type { AuthAction, AuthConfig, Session } from "@auth/core/types"
import { RequestEvent, RequestHandler } from "@builder.io/qwik-city/middleware/request-handler";

import { QwikCityAuthConfig } from "./types";
import { getBody, processResponse, requestContextToRequest } from "./utils";

// prettier-ignore
const actions: AuthAction[] = [ "providers", "session", "csrf", "signin", "signout", "callback", "verify-request", "error" ];

const QwikCityAuthHandler = async (
  event: RequestEvent,
  prefix: string,
  config: AuthConfig
) => {
  const { request, url, json, html, cookie, error } = event;
  const body = await getBody(request);
  const req = requestContextToRequest(request, body);

  const [action] = url.pathname.slice(prefix.length + 1).split("/");
  if (
    actions.includes(action as AuthAction) &&
    url.pathname.startsWith(prefix + "/")
  ) {
    const res = await Auth(req, config);
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

export const QwikCityAuth = (config: QwikCityAuthConfig = { prefix: "/api/auth", providers: [] }): {
  onRequest: RequestHandler,
} => {
  const { prefix = "/api/auth", ...authConfig } = config
  authConfig.secret ??= import.meta.env.VITE_AUTH_SECRET
  authConfig.trustHost ??= !!(
    import.meta.env.AUTH_TRUST_HOST ??
    import.meta.env.VERCEL ??
    import.meta.env.DEV
  )

  return {
    onRequest: (event: RequestEvent) => QwikCityAuthHandler(event, prefix, authConfig),
  }
}

export const getSession = async (
  event: RequestEvent,
  authConfig: QwikCityAuthConfig = { prefix: '/api/auth', providers: [] }
): Promise<Session | null> => {
  const { request, url } = event;
  url.pathname = `${authConfig.prefix}/session`;
  authConfig.secret ??= import.meta.env.VITE_AUTH_SECRET;
  authConfig.trustHost ??= !!(
    import.meta.env.AUTH_TRUST_HOST ??
    import.meta.env.VERCEL ??
    import.meta.env.DEV
  );

  const req = requestContextToRequest(request, undefined, url.toString());
  const res = await Auth(req, authConfig);
  const { content, contentType } = await processResponse(res);

  if (content && typeof content !== "string" && Object.keys(content).length && contentType === "json") {
    return content;
  }
  return null;
};
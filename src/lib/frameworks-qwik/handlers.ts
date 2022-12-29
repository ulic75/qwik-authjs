import { Auth } from "@auth/core";
import type { AuthAction, AuthConfig, Session } from "@auth/core/types"
import { RequestContext, RequestEvent, RequestHandler } from "@builder.io/qwik-city/middleware/request-handler";

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

export const QwikCityAuth = (config: QwikCityAuthConfig = { providers: [] }): {
  onRequest: RequestHandler,
} => {
  const env = import.meta.env;
  config.prefix ??= "/api/auth";
  config.secret ??= env.VITE_AUTH_SECRET;
  config.trustHost ??= !!(env.AUTH_TRUST_HOST ?? env.VERCEL ?? env.DEV);

  return {
    onRequest: (event: RequestEvent) => QwikCityAuthHandler(event, config.prefix!, config),
  }
}

export const getSession = async (
  request: RequestContext,
  url: URL,
  config: QwikCityAuthConfig = { providers: [] }
): Promise<Session | null> => {
  config.prefix ??= "/api/auth";
  config.secret ??= import.meta.env.VITE_AUTH_SECRET;
  config.trustHost ??= true;

  url.pathname = `${config.prefix}/session`;

  const req = requestContextToRequest(request, undefined, url.toString());
  const res = await Auth(req, config);
  const { content, contentType } = await processResponse(res);

  if (content && typeof content !== "string" && Object.keys(content).length && contentType === "json") {
    return content;
  }
  return null;
};
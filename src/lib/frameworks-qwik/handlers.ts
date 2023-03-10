import { Auth } from '@auth/core';
import type { AuthAction, AuthConfig, Session } from '@auth/core/types';
import { RequestEvent, RequestHandler } from '@builder.io/qwik-city';

import { QwikCityAuthConfig } from './types';
import { processResponse } from './utils';

// prettier-ignore
const actions: AuthAction[] = [ "providers", "session", "csrf", "signin", "signout", "callback", "verify-request", "error" ];

const QwikCityAuthHandler = async (event: RequestEvent, prefix: string, config: AuthConfig) => {
  const { request, url, json, html, cookie, error } = event;

  const [action] = url.pathname.slice(prefix.length + 1).split('/');
  if (actions.includes(action as AuthAction) && url.pathname.startsWith(prefix + '/')) {
    const res = await Auth(request, config);
    const { content, contentType, redirect, cookies } = await processResponse(res);

    cookies.forEach((c) => cookie.set(c.name, c.value, c.options));

    if (redirect && redirect.toString().length > 0) throw event.redirect(302, redirect.toString());

    if (contentType === 'json') json(200, content);
    else html(200, content);
  } else {
    throw error(404, 'Not Found');
  }
};

export const QwikCityAuth = (
  config: QwikCityAuthConfig = { providers: [] }
): {
  onRequest: RequestHandler;
} => {
  const env = process.env;
  config.prefix ??= '/api/auth';
  config.secret ??= env.AUTH_SECRET;
  config.trustHost ??= !!(env.TRUST_HOST ?? env.VERCEL ?? import.meta.env.DEV);

  return {
    onRequest: (event: RequestEvent) => QwikCityAuthHandler(event, config.prefix!, config),
  };
};

export const getServerProviders = async (
  request: Request,
  config: QwikCityAuthConfig = { providers: [] }
) => {
  config.prefix ??= '/api/auth';

  const url = new URL(request.url);
  url.pathname = `${config.prefix}/providers`;

  const res = await fetch(url.toString());

  if (res.status === 200 && res.headers.get('content-type')?.includes('application/json')) {
    return await res.json();
  }
  return null;
};

export const getServerSession = async (
  request: Request,
  config: QwikCityAuthConfig = { providers: [] }
): Promise<Session | null> => {
  config.prefix ??= '/api/auth';
  config.secret ??= process.env.AUTH_SECRET;
  config.trustHost ??= true;

  const url = new URL(request.url);
  url.pathname = `${config.prefix}/session`;

  const sessionRequest = new Request(url, request);

  const res = await Auth(sessionRequest, config);
  const { content, contentType } = await processResponse(res);

  if (
    content &&
    typeof content !== 'string' &&
    Object.keys(content).length &&
    contentType === 'json'
  ) {
    return content;
  }
  return null;
};

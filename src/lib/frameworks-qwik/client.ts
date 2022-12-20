import type {
  BuiltInProviderType,
  RedirectableProviderType,
} from "@auth/core/providers";
import { $ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";

import { LiteralUnion, SignInAuthorizationParams, SignInOptions, SignOutParams } from "./types";

export const signIn = $(async <
  P extends RedirectableProviderType | undefined = undefined
>(providerId?: LiteralUnion<
    P extends RedirectableProviderType
      ? P | BuiltInProviderType
      : BuiltInProviderType
  >, options?: SignInOptions, authorizationParams?: SignInAuthorizationParams) => {
  // const { href } = useLocation();
  const { callbackUrl = window.location.href, redirect = true } = options ?? {};

  const isCredentials = providerId === "credentials";
  const isEmail = providerId === "email";
  const isSupportingReturn = isCredentials || isEmail;

  // TODO: Handle custom base path
  const signInUrl = `/api/auth/${
    isCredentials ? "callback" : "signin"
  }/${providerId}`;

  const _signInUrl = `${signInUrl}?${new URLSearchParams(authorizationParams)}`;

  const csrfTokenResponse = await fetch("/api/auth/csrf");
  const { csrfToken } = await csrfTokenResponse.json();
  console.log(csrfToken);

  const res = await fetch(_signInUrl, {
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Auth-Return-Redirect": "1",
    },
    // @ts-expect-error -- ignore
    body: new URLSearchParams({
      ...options,
      csrfToken,
      callbackUrl,
    }),
  });

  const data = await res.clone().json();
  const error = new URL(data.url).searchParams.get("error");

  if (redirect || !isSupportingReturn || !error) {
    // TODO: Do not redirect for Credentials and Email providers by default in next major
    window.location.href = data.url ?? callbackUrl
    // If url contains a hash, the browser does not reload the page. We reload manually
    if (data.url.includes("#")) window.location.reload()
    return
  }

  return res
});

export async function signInOrig<
  P extends RedirectableProviderType | undefined = undefined
>(
  providerId?: LiteralUnion<
    P extends RedirectableProviderType
      ? P | BuiltInProviderType
      : BuiltInProviderType
  >,
  options?: SignInOptions,
  authorizationParams?: SignInAuthorizationParams
) {
  const { callbackUrl = window.location.href, redirect = true } = options ?? {}

  // TODO: Support custom providers
  const isCredentials = providerId === "credentials"
  const isEmail = providerId === "email"
  const isSupportingReturn = isCredentials || isEmail

  // TODO: Handle custom base path
  const signInUrl = `/auth/${
    isCredentials ? "callback" : "signin"
  }/${providerId}`

  const _signInUrl = `${signInUrl}?${new URLSearchParams(authorizationParams)}`

  // TODO: Handle custom base path
  // TODO: Remove this since Sveltekit offers the CSRF protection via origin check
  const csrfTokenResponse = await fetch("/auth/csrf")
  const { csrfToken } = await csrfTokenResponse.json()

  const res = await fetch(_signInUrl, {
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Auth-Return-Redirect": "1",
    },
    // @ts-expect-error -- ignore
    body: new URLSearchParams({
      ...options,
      csrfToken,
      callbackUrl,
    }),
  })

  const data = await res.clone().json()
  const error = new URL(data.url).searchParams.get("error")

  if (redirect || !isSupportingReturn || !error) {
    // TODO: Do not redirect for Credentials and Email providers by default in next major
    window.location.href = data.url ?? callbackUrl
    // If url contains a hash, the browser does not reload the page. We reload manually
    if (data.url.includes("#")) window.location.reload()
    return
  }

  return res
}

/**
 * Signs the user out, by removing the session cookie.
 * Automatically adds the CSRF token to the request.
 *
 * [Documentation](https://next-auth.js.org/getting-started/client#signout)
 */
export async function signOut(options?: SignOutParams) {
  const { callbackUrl = window.location.href } = options ?? {}
  // TODO: Custom base path
  // TODO: Remove this since Sveltekit offers the CSRF protection via origin check
  const csrfTokenResponse = await fetch("/auth/csrf")
  const { csrfToken } = await csrfTokenResponse.json()
  const res = await fetch(`/auth/signout`, {
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Auth-Return-Redirect": "1",
    },
    body: new URLSearchParams({
      csrfToken,
      callbackUrl,
    }),
  })
  const data = await res.json()

  const url = data.url ?? callbackUrl
  window.location.href = url
  // If url contains a hash, the browser does not reload the page. We reload manually
  if (url.includes("#")) window.location.reload()
}
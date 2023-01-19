import type { AuthConfig } from '@auth/core/types';

export type ContentType = 'html' | 'json';

export interface QwikCityAuthConfig extends AuthConfig {
  /**
   * Defines the base path for the auth routes.
   * @default '/api/auth'
   */
  prefix?: string;
}

export type LiteralUnion<T extends U, U = string> = T | (U & Record<never, never>);

export interface SignInOptions extends Record<string, unknown> {
  /**
   * Specify to which URL the user will be redirected after signing in. Defaults to the page URL the sign-in is initiated from.
   *
   * [Documentation](https://next-auth.js.org/getting-started/client#specifying-a-callbackurl)
   */
  callbackUrl?: string;
  /** [Documentation](https://next-auth.js.org/getting-started/client#using-the-redirect-false-option) */
  redirect?: boolean;
}

/** Match `inputType` of `new URLSearchParams(inputType)` */
export type SignInAuthorizationParams =
  | string
  | string[][]
  | Record<string, string>
  | URLSearchParams;

export interface SignOutParams<R extends boolean = true> {
  /** [Documentation](https://next-auth.js.org/getting-started/client#specifying-a-callbackurl-1) */
  callbackUrl?: string;
  /** [Documentation](https://next-auth.js.org/getting-started/client#using-the-redirect-false-option-1 */
  redirect?: R;
}

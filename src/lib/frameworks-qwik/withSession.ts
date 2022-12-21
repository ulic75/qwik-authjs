import { AuthOptions } from "@auth/core";
import Auth0 from "@auth/core/providers/auth0";
import Github from "@auth/core/providers/github";
import { RequestEvent } from "@builder.io/qwik-city";
import { getServerSession } from ".";

const authOptions: AuthOptions = {
  providers: [
    Github({
      clientId: import.meta.env.VITE_GITHUB_ID,
      clientSecret: import.meta.env.VITE_GITHUB_SECRET
    }),
    Auth0({
      clientId: import.meta.env.VITE_AUTH0_ID,
      clientSecret: import.meta.env.VITE_AUTH0_SECRET,
      issuer: import.meta.env.VITE_AUTH0_ISSUER
    }),
  ],
  secret: import.meta.env.VITE_SECRET,
  trustHost: true
}

export const withSession = async (event: RequestEvent) => {
  const session = await getServerSession(event, authOptions);
  return session;
}

type WithProtectedSessionOptions = {
  redirectTo?: string;
};

export const withProtectedSession = async (event: RequestEvent, options: WithProtectedSessionOptions = {}) => {
  const session = await getServerSession(event, authOptions);

  if (!session)
    throw event.response.redirect(options.redirectTo || "/api/auth/signin");

  return session;
}

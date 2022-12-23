import Auth0 from "@auth/core/providers/auth0";
import Github from "@auth/core/providers/github";

import QwikCityAuth from "~/lib/frameworks-qwik";

export const { onRequest } = QwikCityAuth({
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
  ]
});
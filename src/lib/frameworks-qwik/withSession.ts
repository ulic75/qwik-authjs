import { RequestEvent } from "@builder.io/qwik-city/middleware/request-handler";
import { getSession } from "./handlers";

export const withSession = async (event: RequestEvent) => {
  const session = await getSession(event);
  return session;
}

type WithProtectedSessionOptions = {
  redirectTo?: string;
};

export const withProtectedSession = async (event: RequestEvent, options: WithProtectedSessionOptions = {}) => {
  const session = await getSession(event);
  console.log({session});

  if (!session)
    throw event.redirect(302, options.redirectTo || "/api/auth/signin");

  return session;
}

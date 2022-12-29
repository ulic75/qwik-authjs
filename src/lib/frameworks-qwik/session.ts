import type { Session } from "@auth/core/types";
import {
  createContext,
  useContext,
  useContextProvider,
} from "@builder.io/qwik";
import { loader$ } from "@builder.io/qwik-city";

import { getSession } from "./handlers";

type SessionContextState = Session;

const SessionContext = createContext<SessionContextState>("session-context");

export const useSessionContextProvider = (state: SessionContextState) => {
  useContextProvider(SessionContext, state);
};

export const useSessionContext = () => {
  return useContext(SessionContext, null);
};

export const sessionLoader$ = loader$(async (event) => getSession(event.request, event.url));
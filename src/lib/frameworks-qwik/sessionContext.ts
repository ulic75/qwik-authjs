import {
  createContext,
  ResourceReturn,
  useContext,
  useContextProvider,
} from "@builder.io/qwik";
import type { Session } from "@auth/core";

type SessionContextState = ResourceReturn<Session | null>;;

export const SessionContext = createContext<SessionContextState>("session-context2");

export const useSessionContextProvider = (state: SessionContextState) => {
  useContextProvider(SessionContext, state);
};

export const useSessionContext = () => {
  return useContext(SessionContext);
};
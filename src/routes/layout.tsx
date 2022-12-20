import { Session } from '@auth/core';
import { component$, Slot, useClientEffect$, useSignal, useStore, useTask$, ResourceReturn, Resource } from '@builder.io/qwik';
import { RequestEvent, useEndpoint } from '@builder.io/qwik-city';
import { isBrowser, isServer } from '@builder.io/qwik/build';
import { useSessionContextProvider } from '~/lib/frameworks-qwik/SessionContext';
import Header from '../components/header/header';
import { parseString } from 'set-cookie-parser';
import { parse, serialize } from 'cookie';

export const onGet = async (event: RequestEvent): Promise<Session> => {
  const { request, cookie } = event;
  const cookies = Object.entries(parse(request.headers.get('cookie') ?? ""));
  const req = new Request("http://localhost:5173/api/auth/session");
  cookies.forEach(cookie => {
    // console.log(cookie[0], cookie[1]);
    const cookieHeader = serialize(cookie[0], cookie[1])
    if (req.headers.has("Set-Cookie")) {
      req.headers.append("Set-Cookie", cookieHeader)
    } else {
      req.headers.set("Set-Cookie", cookieHeader)
    }
  })
  // console.log(new Date(), req);
  // const { cookie } = event;
  // cookie
  // const res = await fetch(req);
  // console.log(res);
  // console.log(await res.json());
  return {
    expires: 'now',
    user: {
      name: "ulic"
    }
  }
  // const bob = await (await fetch("/api/auth/session")).json();
  // console.log({bob});
}

export default component$(() => {
  const resource = useEndpoint<typeof onGet>();
  const fred = resource.value;
  const sessionState = useSignal<Session>();
  const store = useStore<Session>({
    expires: 'now'
  }, { recursive: true });
  // useTask$(async () => {
  //   if (isBrowser) {
  //     const res = await fetch("http://localhost:5173/api/auth/session");
  //     const session: Session = await res.json();
  //     store.expires = session.expires;
  //     store.user = session.user;
  //     sessionState.value = session;
  //   }
  // }, {eagerness: 'load'})
  useSessionContextProvider(store);

  return (
    <>
      <main>
        <Header />
        <section>
          <Slot />
        </section>
      </main>
      <footer>
        <a href="https://www.builder.io/" target="_blank">
          Made with ♡ by Builder.io
        </a>
        <Resource
          value={resource}
          onResolved={(session) => (
            <>{session.user?.name}</>
          )}
        />
      </footer>
    </>
  );
});

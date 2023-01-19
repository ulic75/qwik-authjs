import { Session } from '@auth/core/types';
import { component$, Slot } from '@builder.io/qwik';
import { loader$ } from '@builder.io/qwik-city';

import { useSessionContextProvider, getServerSession } from '~/lib/frameworks-qwik';

import Header from '../components/header/header';

export const sessionLoader = loader$(async ({ request }) => {
  const session = await getServerSession(request);
  return session;
});

export default component$(() => {
  const session = sessionLoader.use().value as Session;
  useSessionContextProvider(session);

  return (
    <>
      <main>
        <Header />
        <section>
          <Slot />
        </section>
      </main>
    </>
  );
});

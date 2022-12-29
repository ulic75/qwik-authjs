import { Session } from '@auth/core/types';
import { component$, Slot } from '@builder.io/qwik';
import { loader$ } from '@builder.io/qwik-city';
import { useSessionContextProvider, getSession } from '~/lib/frameworks-qwik';
import Header from '../components/header/header';

export const sessionLoader = loader$(async ({request, url}) => {
  const session = await getSession(request, url);
  return session;
})

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

import { Session } from '@auth/core/types';
import { component$, Slot } from '@builder.io/qwik';
import { loader$ } from '@builder.io/qwik-city';
import { useSessionContextProvider, withSession } from '~/lib/frameworks-qwik';
import Header from '../components/header/header';

export const sessionLoader = loader$(async (event: any) => {
  return await withSession(event);
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

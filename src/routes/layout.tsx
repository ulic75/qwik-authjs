import { Session } from '@auth/core/types';
import { component$, Slot } from '@builder.io/qwik';
import { useSessionContextProvider, sessionLoader$ } from '~/lib/frameworks-qwik';
import Header from '../components/header/header';


export const sessionLoader = sessionLoader$;

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

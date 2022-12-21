import { component$, Slot } from '@builder.io/qwik';
import { useEndpoint } from '@builder.io/qwik-city';
import { useSessionContextProvider } from '~/lib/frameworks-qwik/sessionContext';
import { withProtectedSession, withSession } from '~/lib/frameworks-qwik/withSession';
import Header from '../components/header/header';

export const onGet = withSession;

export default component$(() => {
  const resource = useEndpoint<typeof onGet>();
  useSessionContextProvider(resource);

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
      </footer>
    </>
  );
});

import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <>
      <h1>QwikCity Auth Example</h1>
      <p>
        This is an example site to demonstrate how to use{' '}
        <a href="https://qwik.builder.io/">Qwik</a> with{' '}
        <a href="https://github.com/ulic75/qwik-authjs">Qwik AuthJS</a> for authentication.
      </p>
    </>
  );
});

export const head: DocumentHead = {
  title: 'Welcome to Qwik',
  meta: [
    {
      name: 'description',
      content: 'Qwik site description',
    },
  ],
};

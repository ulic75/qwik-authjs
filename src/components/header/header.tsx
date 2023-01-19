import { component$, useStylesScoped$ } from '@builder.io/qwik';
import { useSessionContext } from '~/lib/frameworks-qwik';
import { signIn, signOut } from '~/lib/frameworks-qwik/client';
import { QwikLogo } from '../icons/qwik';
import styles from './header.css?inline';

export default component$(() => {
  useStylesScoped$(styles);
  const session = useSessionContext();

  return (
    <header>
      <div class="logo">
        <a href="https://qwik.builder.io/" target="_blank" title="qwik">
          <QwikLogo />
        </a>
      </div>
      <h2>- AuthJS</h2>
      <ul>
        <li>
          <a href="/">Home</a>
        </li>
        <li>
          <a href="/protected">Protected</a>
        </li>
        <li>
          {session ? (
            <a onClick$={() => signOut()}>Sign Out</a>
          ) : (
            <a onClick$={() => signIn('auth0')}>Sign In</a>
          )}
        </li>
      </ul>
    </header>
  );
});

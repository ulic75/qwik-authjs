import { component$, useStylesScoped$ } from '@builder.io/qwik';
import { useSessionContext } from '~/lib/frameworks-qwik';
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
          {session ? <a href="/api/auth/signout">Sign Out</a> : <a href="/api/auth/signin">Sign In</a>}
        </li>
      </ul>
    </header>
  );
});

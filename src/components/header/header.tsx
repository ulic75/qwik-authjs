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
      <ul>
        <li>
          <a href="https://qwik.builder.io/docs/components/overview/" target="_blank">
            Docs
          </a>
        </li>
        <li>
          <a href="https://qwik.builder.io/examples/introduction/hello-world/" target="_blank">
            Examples
          </a>
        </li>
        <li>
          <a href="https://qwik.builder.io/tutorial/welcome/overview/" target="_blank">
            Tutorials
          </a>
        </li>
        {session && (
          <li>
            {session.user?.name}
          </li>
        )}
        <li>
          {session?.expires ? <a href="/api/auth/signout">Sign Out</a> : <a href="/api/auth/signin">Sign In</a>}
        </li>
      </ul>
    </header>
  );
});

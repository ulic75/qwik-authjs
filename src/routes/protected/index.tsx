import { component$ } from '@builder.io/qwik';
import { useSessionContext } from '~/lib/frameworks-qwik';

export default component$(() => {
  const session = useSessionContext();

  return (
    <>
      {!session
        ? (<>
            <h1>Access Denied</h1>
            <p>
              <a href="/api/auth/signin">
                You must be signed in to view this page
              </a>
            </p>
          </>)
        : (
          <>
            <h1>Protected page</h1>
            <p>
              This is a protected content. You can access this content because you are
              signed in.
            </p>
            <p>Session expiry: {session?.expires}</p>
          </>
        )
      }
    </>
  );
});

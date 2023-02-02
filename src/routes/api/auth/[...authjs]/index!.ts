import { Provider } from '@auth/core/providers';
import Auth0 from '@auth/core/providers/auth0';
import Github from '@auth/core/providers/github';
import Credentials from '@auth/core/providers/credentials';

import { QwikCityAuth } from '~/lib/frameworks-qwik';

export const { onRequest } = QwikCityAuth({
  providers: [
    Credentials({
      name: 'Email',
      credentials: {
        username: { label: 'E-mail', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (credentials?.username === 'admin@admin.com' && credentials.password === 'admin123') {
          return { id: '1', name: credentials.username };
        }
        return null;
      },
    }),
    Auth0({
      clientId: process.env.AUTH0_ID || '',
      clientSecret: process.env.AUTH0_SECRET || '',
      issuer: process.env.AUTH0_ISSUER,
    }),
    Github({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
  ] as Provider[],
});

import test from 'node:test';
import assert from 'node:assert/strict';

import { extractRefreshTokens } from './api.js';

test('extractRefreshTokens reads the backend success payload from response.data.data', () => {
  const payload = {
    data: {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    },
  };

  assert.deepEqual(extractRefreshTokens(payload), {
    accessToken: 'new-access-token',
    refreshToken: 'new-refresh-token',
  });
});

test('extractRefreshTokens rejects malformed payloads without returning undefined tokens', () => {
  const payload = { data: {} };
  assert.deepEqual(extractRefreshTokens(payload), null);
});

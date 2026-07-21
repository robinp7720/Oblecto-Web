import { describe, expect, it } from 'vitest';
import { apiUrl, decodeToken } from './api';

describe('api helpers', () => {
  it('builds root-relative API URLs from the /web app', () => {
    expect(apiUrl('/movies/list/createdAt', { mode: 'browse', count: 12 })).toBe('/movies/list/createdAt?mode=browse&count=12');
  });

  it('decodes JWT payloads without validating them', () => {
    const payload = window.btoa(JSON.stringify({ id: 7, username: 'robin' })).replace(/=/g, '');
    expect(decodeToken(`header.${payload}.signature`)).toMatchObject({ id: 7, username: 'robin' });
  });
});

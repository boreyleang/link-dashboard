import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeUrl, faviconFromUrl, hostnameLabel } from '../lib/url.js';

describe('normalizeUrl', () => {
  it('adds https when protocol is missing', () => {
    assert.equal(normalizeUrl('example.com'), 'https://example.com');
  });

  it('keeps existing https', () => {
    assert.equal(normalizeUrl('https://example.com/path'), 'https://example.com/path');
  });

  it('keeps existing http', () => {
    assert.equal(normalizeUrl('http://example.com'), 'http://example.com');
  });

  it('returns empty string for empty input', () => {
    assert.equal(normalizeUrl(''), '');
    assert.equal(normalizeUrl('   '), '');
  });
});

describe('faviconFromUrl', () => {
  it('builds a favicon helper URL for the host', () => {
    const icon = faviconFromUrl('https://github.com');
    assert.match(icon, /github\.com/);
  });

  it('returns empty string for invalid url', () => {
    assert.equal(faviconFromUrl(''), '');
  });
});

describe('hostnameLabel', () => {
  it('strips leading www', () => {
    assert.equal(hostnameLabel('https://www.youtube.com'), 'youtube.com');
  });

  it('returns Link for invalid url', () => {
    assert.equal(hostnameLabel('not a url'), 'Link');
  });
});
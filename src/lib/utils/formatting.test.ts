import { describe, expect, it } from 'vitest';
import { sanitizeHtml, escapeJsonForScript } from './formatting';

describe('sanitizeHtml', () => {
  it('removes script tags and unsafe attributes', () => {
    const html = '<p onclick="alert(1)">OK</p><script>alert(1)</script><img src="x" onerror="alert(1)" alt="img">';

    const sanitized = sanitizeHtml(html);

    expect(sanitized).toContain('OK');
    expect(sanitized).not.toContain('<script');
    expect(sanitized).not.toContain('onerror');
    expect(sanitized).not.toContain('alert(1)');
  });
});

describe('escapeJsonForScript', () => {
  it('escapes closing script tags in json payloads', () => {
    const json = JSON.stringify({ title: 'A</script><img src=x onerror=alert(1)>' });

    const escaped = escapeJsonForScript(json);

    expect(escaped).toContain('\\u003c/script\\u003e');
    expect(escaped).not.toContain('</script>');
  });
});

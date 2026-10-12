import { describe, expect, it } from 'vitest';
import { applyPrerender } from './template';
import { getPageMetadata, renderHead, serializeStructuredData } from '../app/seo/metadata';

const template = '<html><head><title>Old</title><meta\n name="description" content="old" />'
  + '<link rel="canonical" href="old" /><meta property="og:title" content="old" />'
  + '<meta name="twitter:title" content="old" /><script type="application/ld+json">{"old":true}</script>'
  + '<meta name="yandex-verification" content="keep" /><script>analytics()</script>'
  + '<script type="module" src="/assets/client.js"></script><link rel="stylesheet" href="/assets/site.css" />'
  + '</head><body><div id="root"></div></body></html>';

describe('prerender template', () => {
  it('replaces only route metadata and root; preserves analytics, verification and assets', () => {
    const head = renderHead(getPageMetadata('/tools'));
    const output = applyPrerender(template, '/tools', '<h1>Инструменты $&</h1>', head);
    expect(output).toContain('<div id="root" data-ssg-route="/tools"><h1>Инструменты $&</h1></div>');
    expect(output.match(/<title>/g)).toHaveLength(1);
    expect(output.match(/name="description"/g)).toHaveLength(1);
    expect(output.match(/rel="canonical"/g)).toHaveLength(1);
    expect(output).not.toContain('old');
    expect(output).toContain('<meta name="yandex-verification" content="keep" />');
    expect(output).toContain('<script>analytics()</script>');
    expect(output).toContain('src="/assets/client.js"');
    expect(output).toContain('href="/assets/site.css"');
    expect(output).toContain('"@type":"ItemList"');
  });

  it('fails a build if Vite template insertion points are missing', () => {
    expect(() => applyPrerender('<head></head>', '/', 'body', 'head')).toThrow();
  });

  it('escapes metadata attributes and JSON-LD without changing the decoded data', () => {
    const data = { text: '</script><script>alert("x")</script>' };
    const encoded = serializeStructuredData(data);
    expect(encoded).not.toContain('</script>');
    expect(JSON.parse(encoded)).toEqual(data);
    const head = renderHead({ ...getPageMetadata('/'), title: '<title> & "quote"', structuredData: [data] });
    expect(head).toContain('&lt;title&gt; &amp; &quot;quote&quot;');
    expect(head.match(/<script/g)).toHaveLength(1);
  });
});

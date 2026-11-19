import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { app } from '../index.js';

let server;
let baseUrl;

before(async () => {
  server = createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

async function get(path) {
  const res = await fetch(`${baseUrl}${path}`);
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, headers: res.headers, body };
}

describe('SphereX Markets API', () => {
  it('GET /api/health returns ok metadata', async () => {
    const { status, body } = await get('/api/health');
    assert.equal(status, 200);
    assert.equal(body.status, 'ok');
    assert.equal(body.service, 'spherex-markets');
    assert.equal(body.org, 'SphereX Labs');
    assert.ok(body.time);
  });

  it('GET /api/meta returns project branding', async () => {
    const { status, body } = await get('/api/meta');
    assert.equal(status, 200);
    assert.equal(body.name, 'SphereX Markets');
    assert.equal(body.organization, 'SphereX Labs');
    assert.equal(body.license, 'MIT');
  });

  it('GET /api/portfolio/:id returns empty portfolio by default', async () => {
    const { status, body } = await get('/api/portfolio/test-user');
    assert.equal(status, 200);
    assert.equal(body.id, 'test-user');
    assert.ok(Array.isArray(body.items));
  });

  it('GET /api/search rejects short queries', async () => {
    const { status, body } = await get('/api/search?q=a');
    assert.equal(status, 200);
    assert.deepEqual(body, []);
  });

  it('GET /api/search finds known BIST symbols offline', async () => {
    const { status, body } = await get('/api/search?q=THYAO');
    assert.equal(status, 200);
    assert.ok(Array.isArray(body));
    assert.ok(body.some((r) => r.symbol === 'THYAO.IS' || String(r.symbol).includes('THYAO')));
  });

  it('GET /api/macro/turkey returns indicators', async () => {
    const { status, body } = await get('/api/macro/turkey');
    assert.equal(status, 200);
    assert.ok(body.indicators);
    assert.ok(body.analysis);
  });

  it('GET /api/calendar returns events array', async () => {
    const { status, body } = await get('/api/calendar');
    assert.equal(status, 200);
    assert.ok(Array.isArray(body) || Array.isArray(body?.events) || Array.isArray(body?.days));
  });

  it('GET /api/alerts returns array', async () => {
    const { status, body } = await get('/api/alerts');
    assert.equal(status, 200);
    assert.ok(Array.isArray(body));
  });

  it('GET /api/watchlist returns array', async () => {
    const { status, body } = await get('/api/watchlist');
    assert.equal(status, 200);
    assert.ok(Array.isArray(body));
  });

  it('GET /api/forex returns rates or graceful fallback', async () => {
    const { status, body } = await get('/api/forex');
    assert.ok(status === 200 || status === 503);
    if (status === 200) {
      assert.ok(Array.isArray(body));
      assert.ok(body.length > 0);
      assert.ok(body.some((p) => p.base === 'USD' && p.quote === 'TRY'));
    }
  });

  it('GET /api/crypto/markets returns list or graceful fallback', async () => {
    const { status, body } = await get('/api/crypto/markets');
    assert.ok(status === 200 || status === 503);
    if (status === 200) {
      assert.ok(Array.isArray(body));
      assert.ok(body.length > 0);
    }
  });

  it('GET /api/economic returns indicators or graceful fallback', async () => {
    const { status, body } = await get('/api/economic');
    assert.ok(status === 200 || status === 503);
    if (status === 200) {
      assert.ok(Array.isArray(body));
      assert.ok(body.length > 0);
    }
  });

  it('GET /api/news returns articles or graceful fallback', async () => {
    const { status, body } = await get('/api/news?region=tr');
    assert.ok(status === 200 || status === 503);
    if (status === 200) {
      assert.ok(Array.isArray(body));
      assert.ok(body.length > 0);
    }
  });
});

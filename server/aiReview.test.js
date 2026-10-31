import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import jwt from 'jsonwebtoken';
import { aiPromptSchema, aiReviewSchema } from './schemas/aiReview.js';

process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-local-tests';
process.env.GEMINI_API_KEY = '';

const { app } = await import('./app.js');
let server;
let baseUrl;
const token = jwt.sign({ sub: 'ci-test-user' }, process.env.JWT_SECRET);

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test('AI prompt schema trims and bounds descriptions', () => {
  assert.equal(
    aiPromptSchema.parse({ prompt: '  A sufficiently detailed race timing description.  ' }).prompt,
    'A sufficiently detailed race timing description.',
  );
  assert.equal(aiPromptSchema.safeParse({ prompt: 'too short' }).success, false);
  assert.equal(aiPromptSchema.safeParse({ prompt: 'x'.repeat(2001) }).success, false);
  assert.equal(aiPromptSchema.safeParse({ prompt: 'x'.repeat(20), extra: true }).success, false);
});

test('AI review schema accepts the required structured response', () => {
  assert.equal(
    aiReviewSchema.safeParse({
      summary: 'A clear explanation of the race timing application.',
      strengths: ['Describes the lap entry workflow.'],
      improvements: ['Clarify how sessions are separated.'],
      readiness: 'needs-work',
    }).success,
    true,
  );
  assert.equal(
    aiReviewSchema.safeParse({
      summary: 'A description.',
      strengths: [],
      improvements: ['Add details.'],
      readiness: 'ready',
    }).success,
    false,
  );
});

test('AI endpoint requires authentication', async () => {
  const response = await fetch(`${baseUrl}/api/ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'A sufficiently detailed race timing description.' }),
  });

  assert.equal(response.status, 401);
});

test('AI endpoint validates prompts before checking server configuration', async () => {
  const response = await fetch(`${baseUrl}/api/ai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt: 'too short' }),
  });

  assert.equal(response.status, 400);
});

test('AI endpoint reports missing Gemini configuration', async () => {
  const response = await fetch(`${baseUrl}/api/ai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt: 'A sufficiently detailed race timing description.' }),
  });
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.match(body.message, /not configured/i);
});

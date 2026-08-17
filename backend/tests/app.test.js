import { jest, test, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

const mockQuery = jest.fn();
const mockPoolEnd = jest.fn();

jest.unstable_mockModule('../config/db.js', () => ({
  query: mockQuery,
  pool: {
    end: mockPoolEnd
  }
}));

const { default: app } = await import('../server.js');

const studentToken = jwt.sign(
  {
    id: 1,
    name: 'Student',
    email: 'student@test.local',
    role: 'student'
  },
  process.env.JWT_SECRET
);

const adminToken = jwt.sign(
  {
    id: 2,
    name: 'Admin',
    email: 'admin@test.local',
    role: 'admin'
  },
  process.env.JWT_SECRET
);

beforeEach(() => {
  mockQuery.mockReset();
});

test('POST /api/auth/register creates a student', async () => {
  mockQuery.mockResolvedValueOnce({
    rowCount: 0,
    rows: []
  });

  mockQuery.mockResolvedValueOnce({
    rowCount: 1,
    rows: [
      {
        id: 1,
        name: 'Test User',
        email: 'test@local',
        role: 'student'
      }
    ]
  });

  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test User',
      email: 'test@local',
      password: 'Password123!'
    });

  expect(res.statusCode).toBe(201);
  expect(res.body.token).toBeTruthy();
});

test('POST /api/auth/login accepts a valid password', async () => {
  const hash = await bcrypt.hash('Password123!', 1);

  mockQuery.mockResolvedValueOnce({
    rowCount: 1,
    rows: [
      {
        id: 1,
        name: 'Test User',
        email: 'test@local',
        password: hash,
        role: 'student'
      }
    ]
  });

  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'test@local',
      password: 'Password123!'
    });

  expect(res.statusCode).toBe(200);
  expect(res.body.user.role).toBe('student');
});

test('POST /api/issues creates an issue for an authenticated user', async () => {
  mockQuery.mockResolvedValueOnce({
    rowCount: 1,
    rows: [
      {
        id: 7,
        title: 'Wi-Fi issue',
        status: 'OPEN'
      }
    ]
  });

  const res = await request(app)
    .post('/api/issues')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({
      title: 'Wi-Fi issue',
      description: 'No network',
      category: 'Network',
      location: 'Block B'
    });

  expect(res.statusCode).toBe(201);
  expect(res.body.status).toBe('OPEN');
});

test('GET /api/issues returns issues', async () => {
  mockQuery.mockResolvedValueOnce({
    rowCount: 1,
    rows: [
      {
        id: 7,
        title: 'Wi-Fi issue',
        vote_count: 2
      }
    ]
  });

  const res = await request(app)
    .get('/api/issues')
    .set('Authorization', `Bearer ${studentToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveLength(1);
});

test('PUT /api/issues/:id blocks a student', async () => {
  const res = await request(app)
    .put('/api/issues/7')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({
      status: 'RESOLVED'
    });

  expect(res.statusCode).toBe(403);
  expect(mockQuery).not.toHaveBeenCalled();
});

test('PUT /api/issues/:id allows an admin', async () => {
  mockQuery.mockResolvedValueOnce({
    rowCount: 1,
    rows: [
      {
        id: 7,
        status: 'RESOLVED'
      }
    ]
  });

  const res = await request(app)
    .put('/api/issues/7')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      status: 'RESOLVED'
    });

  expect(res.statusCode).toBe(200);
  expect(res.body.status).toBe('RESOLVED');
});

test('POST /api/issues/:id/vote records a vote', async () => {
  mockQuery.mockResolvedValueOnce({
    rowCount: 1,
    rows: []
  });

  const res = await request(app)
    .post('/api/issues/7/vote')
    .set('Authorization', `Bearer ${studentToken}`);

  expect(res.statusCode).toBe(201);
});

test('protected route rejects missing authentication', async () => {
  const res = await request(app)
    .get('/api/issues');

  expect(res.statusCode).toBe(401);
});
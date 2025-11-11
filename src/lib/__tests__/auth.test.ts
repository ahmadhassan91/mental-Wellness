import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { basicAuthGuard } from '../auth';

describe('basicAuthGuard', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      ADMIN_USER: 'admin',
      ADMIN_PASS: 'secret123',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return true for valid credentials', () => {
    const credentials = btoa('admin:secret123');
    const authHeader = `Basic ${credentials}`;
    expect(basicAuthGuard(authHeader)).toBe(true);
  });

  it('should return false for invalid username', () => {
    const credentials = btoa('wrong:secret123');
    const authHeader = `Basic ${credentials}`;
    expect(basicAuthGuard(authHeader)).toBe(false);
  });

  it('should return false for invalid password', () => {
    const credentials = btoa('admin:wrong');
    const authHeader = `Basic ${credentials}`;
    expect(basicAuthGuard(authHeader)).toBe(false);
  });

  it('should return false for null auth header', () => {
    expect(basicAuthGuard(null)).toBe(false);
  });

  it('should return false for malformed auth header', () => {
    expect(basicAuthGuard('Bearer token')).toBe(false);
    expect(basicAuthGuard('Basic')).toBe(false);
  });

  it('should return false when env vars not set', () => {
    delete process.env.ADMIN_USER;
    delete process.env.ADMIN_PASS;

    const credentials = btoa('admin:secret123');
    const authHeader = `Basic ${credentials}`;
    expect(basicAuthGuard(authHeader)).toBe(false);
  });
});

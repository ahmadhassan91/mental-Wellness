export function basicAuthGuard(authHeader: string | null): boolean {
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }

  const base64Credentials = authHeader.substring(6);
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  const expectedUser = process.env.ADMIN_USER;
  const expectedPass = process.env.ADMIN_PASS;

  if (!expectedUser || !expectedPass) {
    return false;
  }

  const userMatch = constantTimeCompare(username, expectedUser);
  const passMatch = constantTimeCompare(password, expectedPass);

  return userMatch && passMatch;
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

export function createUnauthorizedResponse(): Response {
  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin Area"',
      'Content-Type': 'text/plain',
    },
  });
}

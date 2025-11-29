import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import crypto from 'crypto';

export interface AuthContext {
  userId: string;
  orgId: string | null;
  roles: string[];
  permissions: string[];
  email?: string;
  name?: string;
}

interface JwtPayload {
  sub: string;
  iss: string;
  aud: string | string[];
  iat: number;
  exp: number;
  nbf?: number;
  org_id?: string | null;
  roles?: string[];
  permissions?: string[];
  email?: string;
  name?: string;
}

const jwksUrl = process.env.AUTH_JWKS_URL || 'http://user-service:3000/.well-known/jwks.json';
const issuer = process.env.AUTH_ISSUER || 'http://user-service:3000';
const audience = process.env.AUTH_AUDIENCE || 'backboard';

const jwksClientInstance = jwksClient({
  jwksUri: jwksUrl,
  cache: true,
  cacheMaxAge: 15 * 60 * 1000, // 15 minutes
  rateLimit: true,
  jwksRequestsPerMinute: 5,
});

async function getPublicKeyFromJwks(): Promise<string | null> {
  try {
    const response = await fetch(jwksUrl);
    if (!response.ok) {
      return null;
    }
    const jwks = await response.json();
    if (jwks.keys && jwks.keys.length > 0) {
      // Get the first key (usually there's only one)
      const jwk = jwks.keys[0];
      // Convert JWK to PEM format
      const publicKey = crypto.createPublicKey({
        key: {
          kty: jwk.kty,
          n: jwk.n,
          e: jwk.e,
        },
        format: 'jwk',
      });
      return publicKey.export({ format: 'pem', type: 'spki' }) as string;
    }
    return null;
  } catch {
    return null;
  }
}

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback): void {
  // If kid is present, use JWKS lookup
  if (header.kid) {
    jwksClientInstance.getSigningKey(header.kid, (err, key) => {
      if (err) {
        callback(err);
        return;
      }
      const signingKey = key?.getPublicKey();
      callback(null, signingKey);
    });
    return;
  }

  // Fallback: if no kid, try to get the public key from JWKS directly
  // This handles tokens generated before kid was added to the header
  getPublicKeyFromJwks()
    .then((publicKey) => {
      if (publicKey) {
        callback(null, publicKey);
      } else {
        callback(new Error('Token missing kid in header and could not fetch public key from JWKS'));
      }
    })
    .catch((err) => {
      callback(new Error(`Failed to fetch public key from JWKS: ${err.message}`));
    });
}

export const getAuthToken = async (): Promise<string | undefined> => {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value;
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAuthToken();
  return !!token;
};

export const requireAuth = async (): Promise<string> => {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Unauthorized: No authentication token found');
  }
  
  return token;
};

export const verifyToken = async (token: string): Promise<AuthContext> => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        algorithms: ['RS256'],
        issuer,
        audience,
      },
      (err, decoded) => {
        if (err) {
          reject(new Error(`Token verification failed: ${err.message}`));
          return;
        }

        const payload = decoded as JwtPayload;

        if (!payload.sub) {
          reject(new Error('Token missing sub claim'));
          return;
        }

        const authContext: AuthContext = {
          userId: payload.sub,
          orgId: payload.org_id || null,
          roles: payload.roles || [],
          permissions: payload.permissions || [],
          email: payload.email,
          name: payload.name,
        };

        resolve(authContext);
      }
    );
  });
};

export const getAuthContext = async (): Promise<AuthContext | null> => {
  try {
    const token = await requireAuth();
    return await verifyToken(token);
  } catch {
    return null;
  }
};


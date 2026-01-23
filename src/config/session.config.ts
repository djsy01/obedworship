import session from 'express-session';
import RedisStore from 'connect-redis';
import { createRedisClient } from './redis.config';

export const createSessionConfig = () => {
  const redisClient = createRedisClient();

  return session({
    store: new RedisStore({
      client: redisClient,
      prefix: 'obed:sess:',
      ttl: 86400, // 24 hours in seconds
    }),
    secret: process.env.SESSION_SECRET || 'obed-worship-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    name: 'obed.sid', // Custom session cookie name
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      httpOnly: true, // Prevent XSS attacks
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      sameSite: 'lax', // CSRF protection
      domain: process.env.COOKIE_DOMAIN || undefined,
    },
  });
};

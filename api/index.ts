import type { Request, Response } from 'express';
import { app } from '../server';

export default function handler(req: any, res: any) {
  // Normalize Vercel rewrite URL
  const matchedPath =
    req.headers?.['x-matched-path'] ||
    req.headers?.['x-vercel-matched-path'] ||
    req.headers?.['x-forwarded-uri'] ||
    req.headers?.['x-now-route-matches'];

  if (typeof matchedPath === 'string' && (matchedPath.startsWith('/api') || matchedPath.startsWith('/uploads'))) {
    req.url = matchedPath;
  } else if (req.query && typeof req.query['0'] === 'string') {
    const sub = req.query['0'].startsWith('/') ? req.query['0'] : `/${req.query['0']}`;
    req.url = `/api${sub}`;
  }

  return app(req, res);
}

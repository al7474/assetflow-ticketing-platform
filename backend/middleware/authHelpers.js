// authHelpers.js
// Centralized helpers for authentication and authorization logic
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Extract JWT token from request (header or cookie)
export function extractToken(req) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
}

// Verify and decode JWT token
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// Check if user has admin role
export function isAdmin(user) {
  return user && user.role === 'ADMIN';
}

const { hashPassword, comparePassword, generateToken } = require('../../utils/auth');
const jwt = require('jsonwebtoken');

// Mock the JWT_SECRET module
jest.mock('../../middleware/auth', () => ({
  JWT_SECRET: 'test-secret'
}));

describe('Auth Utils', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testpass123';
      const hashed = await hashPassword(password);
      
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(20);
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'testpass123';
      const hashed = await hashPassword(password);
      const isValid = await comparePassword(password, hashed);
      
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'testpass123';
      const hashed = await hashPassword(password);
      const isValid = await comparePassword('wrongpass', hashed);
      
      expect(isValid).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        organizationId: 1
      };

      const token = generateToken(user);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Verify token can be decoded
      const decoded = jwt.verify(token, 'test-secret');
      expect(decoded.id).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
      expect(decoded.organizationId).toBe(user.organizationId);
    });
  });
});

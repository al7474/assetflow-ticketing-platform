/**
 * Authentication controller
 * Business logic for auth-related operations
 */


import authService from '../services/auth.service.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { sendWelcomeEmail } from '../utils/email.js';

class AuthController {
  /**
   * Register new user
   */
  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await authService.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists.' });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Generate organization slug
      const orgSlug = this._generateOrgSlug(email, name);

      // Create organization and user
      const { organization, user } = await this._createOrganizationAndUser({
        name,
        email,
        hashedPassword,
        orgSlug
      });

      // Send welcome email
      await sendWelcomeEmail(email, name, organization.name);

      // Generate token
      const token = generateToken(user);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error during registration.' });
    }
  }

  /**
   * Generate a unique organization slug based on email and name
   */
  _generateOrgSlug(email, name) {
    try {
      const emailDomain = email.split('@')[1]?.split('.')[0] || name.replace(/\s+/g, '-').toLowerCase();
      return `${emailDomain}-${Date.now()}`;
    } catch {
      return `org-${Date.now()}`;
    }
  }

  /**
   * Create organization and associated user
   */
  async _createOrganizationAndUser({ name, email, hashedPassword, orgSlug }) {
    const organization = await authService.createOrganization(
      `${name}'s Organization`,
      orgSlug
    );
    const user = await authService.createUser({
      name,
      email,
      password: hashedPassword,
      role: 'EMPLOYEE',
      organizationId: organization.id
    });
    return { organization, user };
  }

  /**
   * Login user
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await authService.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Generate token
      const token = generateToken(user);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          organization: user.organization
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error during login.' });
    }
  }

  /**
   * Get current user info
   */
  async getMe(req, res) {
    try {
      const user = await authService.findUserById(req.user.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }

  /**
   * Invite user to organization (Admin only)
   */
  async inviteUser(req, res) {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await authService.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists.' });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Get organization info
      const organization = await authService.getOrganization(req.organizationId);

      // Create user as EMPLOYEE
      const newUser = await authService.createUser({
        name,
        email,
        password: hashedPassword,
        role: 'EMPLOYEE',
        organizationId: req.organizationId
      });

      // Send welcome email
      await sendWelcomeEmail(email, name, organization.name);

      res.status(201).json({
        message: 'User invited successfully',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });
    } catch (error) {
      console.error('Invite user error:', error);
      res.status(500).json({ error: 'Internal server error during user invitation.' });
    }
  }
}

export default new AuthController();

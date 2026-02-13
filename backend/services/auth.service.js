/**
 * Authentication service
 * Database operations for auth-related functionality
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AuthService {
  /**
   * Find user by email
   */
  async findUserByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });
  }

  /**
   * Find user by ID
   */
  async findUserById(id) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        createdAt: true
      }
    });
  }

  /**
   * Create new organization for user
   */
  async createOrganization(name, slug) {
    return await prisma.organization.create({
      data: { name, slug }
    });
  }

  /**
   * Create new user
   */
  async createUser(userData) {
    return await prisma.user.create({
      data: userData
    });
  }

  /**
   * Get organization by ID
   */
  async getOrganization(id) {
    return await prisma.organization.findUnique({
      where: { id }
    });
  }
}

module.exports = new AuthService();

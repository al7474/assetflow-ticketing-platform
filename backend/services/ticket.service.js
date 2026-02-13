/**
 * Ticket service
 * Database operations for ticket-related functionality
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class TicketService {
  /**
   * Check if asset has open ticket
   */
  async hasOpenTicket(assetId, organizationId) {
    const ticket = await prisma.ticket.findFirst({
      where: {
        assetId,
        organizationId,
        status: 'OPEN'
      }
    });
    return !!ticket;
  }

  /**
   * Create new ticket
   */
  async createTicket(ticketData) {
    return await prisma.ticket.create({
      data: ticketData,
      include: {
        user: true,
        asset: true
      }
    });
  }

  /**
   * Get all tickets for organization
   */
  async getTicketsByOrganization(organizationId) {
    return await prisma.ticket.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        asset: {
          select: {
            id: true,
            name: true,
            serialNumber: true,
            type: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get ticket by ID and organization
   */
  async getTicketById(id, organizationId) {
    return await prisma.ticket.findFirst({
      where: { 
        id,
        organizationId
      }
    });
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(id, status) {
    return await prisma.ticket.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        asset: true
      }
    });
  }

  /**
   * Count tickets by organization
   */
  async countTicketsByOrganization(organizationId, status = null) {
    const where = { organizationId };
    if (status) {
      where.status = status;
    }
    return await prisma.ticket.count({ where });
  }

  /**
   * Get tickets created after date
   */
  async getTicketsSince(organizationId, date) {
    return await prisma.ticket.findMany({
      where: {
        organizationId,
        createdAt: { gte: date }
      },
      orderBy: { createdAt: 'asc' },
      select: {
        createdAt: true,
        status: true
      }
    });
  }

  /**
   * Group tickets by asset
   */
  async groupTicketsByAsset(organizationId) {
    return await prisma.ticket.groupBy({
      by: ['assetId'],
      where: { organizationId },
      _count: { id: true }
    });
  }
}

module.exports = new TicketService();

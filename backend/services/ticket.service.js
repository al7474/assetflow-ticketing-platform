// Utility functions for field selection (private to this module)
function userSelectFields() {
  return {
    id: true,
    name: true,
    email: true
  };
}

function assetSelectFields() {
  return {
    id: true,
    name: true,
    serialNumber: true,
    type: true
  };
}
/**
 * Ticket service
 * Database operations for ticket-related functionality
 */


import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class TicketService {
    /**
     * Create a ticket and send notification (business logic centralized)
     */
    // Handles business logic: create ticket and send notification
    async createTicketWithNotification({ description, type, extraData, asset, userId, organizationId }) {
      const ticket = await this.createTicket({
        title: `Issue with ${asset.name}`,
        description: description.trim(),
        type,
        extraData: extraData || null,
        userId,
        assetId: asset.id,
        organizationId
      });
      // Notify organization admins
      const { sendTicketNotification } = await import('../utils/email.js');
      await sendTicketNotification(organizationId, ticket, asset, ticket.user);
      return ticket;
    }
  /**
   * Check if asset has open ticket
   */
  async hasOpenTicketForAsset(assetId, organizationId) {
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
  // Data access only: create ticket and return with user and asset
  async createTicket(ticketData) {
    return await prisma.ticket.create({
      data: ticketData,
      include: {
        user: { select: userSelectFields() },
        asset: { select: assetSelectFields() }
      }
    });
  }

  /**
   * Get all tickets for organization
   */
  // Data access only: get all tickets for organization
  async getTicketsByOrganization(organizationId) {
    return await prisma.ticket.findMany({
      where: { organizationId },
      include: {
        user: { select: userSelectFields() },
        asset: { select: assetSelectFields() }
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
  // Data access only: update ticket status and return with user and asset
  async updateTicketStatus(id, status) {
    return await prisma.ticket.update({
      where: { id },
      data: { status },
      include: {
        user: { select: userSelectFields() },
        asset: { select: assetSelectFields() }
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

  /**
   * Delete ticket by ID
   */
  async deleteTicket(id) {
    return await prisma.ticket.delete({
      where: { id }
    });
  }
}

export default new TicketService();

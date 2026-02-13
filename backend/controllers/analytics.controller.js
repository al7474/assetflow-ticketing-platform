/**
 * Analytics controller
 * Business logic for analytics and reporting
 */

const ticketService = require('../services/ticket.service');
const assetService = require('../services/asset.service');

class AnalyticsController {
  /**
   * Get dashboard analytics (Admin only)
   */
  async getDashboard(req, res) {
    try {
      const orgId = req.organizationId;

      // Get ticket counts
      const [totalTickets, openTickets, closedTickets, totalAssets] = await Promise.all([
        ticketService.countTicketsByOrganization(orgId),
        ticketService.countTicketsByOrganization(orgId, 'OPEN'),
        ticketService.countTicketsByOrganization(orgId, 'CLOSED'),
        assetService.countAssetsByOrganization(orgId)
      ]);

      // Get tickets by asset
      const ticketsByAsset = await ticketService.groupTicketsByAsset(orgId);

      // Get asset names
      const assetIds = ticketsByAsset.map(t => t.assetId);
      const assets = await assetService.getAssetsByIds(assetIds);

      const ticketsByAssetWithNames = ticketsByAsset.map(item => ({
        assetName: assets.find(a => a.id === item.assetId)?.name || 'Unknown',
        count: item._count.id
      }));

      // Recent tickets timeline (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentTickets = await ticketService.getTicketsSince(orgId, sevenDaysAgo);

      // Group by date
      const ticketsByDate = {};
      recentTickets.forEach(ticket => {
        const date = ticket.createdAt.toISOString().split('T')[0];
        if (!ticketsByDate[date]) {
          ticketsByDate[date] = { date, open: 0, closed: 0 };
        }
        if (ticket.status === 'OPEN') {
          ticketsByDate[date].open++;
        } else {
          ticketsByDate[date].closed++;
        }
      });

      const timeline = Object.values(ticketsByDate);

      res.json({
        summary: {
          totalTickets,
          openTickets,
          closedTickets,
          totalAssets
        },
        ticketsByAsset: ticketsByAssetWithNames,
        timeline
      });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }
}

module.exports = new AnalyticsController();

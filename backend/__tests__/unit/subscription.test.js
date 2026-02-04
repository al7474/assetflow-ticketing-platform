const { PLANS } = require('../../config/stripe');

describe('Stripe Config', () => {
  describe('PLANS', () => {
    it('should have all three plan tiers', () => {
      expect(PLANS.FREE).toBeDefined();
      expect(PLANS.PRO).toBeDefined();
      expect(PLANS.ENTERPRISE).toBeDefined();
    });

    it('FREE plan should have correct limits', () => {
      expect(PLANS.FREE.limits.maxAssets).toBe(5);
      expect(PLANS.FREE.limits.maxTickets).toBe(10);
      expect(PLANS.FREE.limits.maxUsers).toBe(2);
      expect(PLANS.FREE.price).toBe(0);
    });

    it('PRO plan should have correct limits', () => {
      expect(PLANS.PRO.limits.maxAssets).toBe(50);
      expect(PLANS.PRO.limits.maxTickets).toBe(-1); // unlimited
      expect(PLANS.PRO.limits.maxUsers).toBe(10);
      expect(PLANS.PRO.price).toBe(2900);
    });

    it('ENTERPRISE plan should have unlimited limits', () => {
      expect(PLANS.ENTERPRISE.limits.maxAssets).toBe(-1);
      expect(PLANS.ENTERPRISE.limits.maxTickets).toBe(-1);
      expect(PLANS.ENTERPRISE.limits.maxUsers).toBe(-1);
      expect(PLANS.ENTERPRISE.price).toBe(9900);
    });
  });
});

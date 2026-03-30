import { registerTicketValidation } from './ticketValidationStrategies.js';

// Example: Maintenance ticket validation

registerTicketValidation('maintenance', async (data) => {
  if (!data.extraData || !data.extraData.maintenanceDate) throw new Error('maintenanceDate is required for maintenance tickets');
});

registerTicketValidation('incident', async (data) => {
  if (!data.extraData || !data.extraData.incidentReport) throw new Error('incidentReport is required for incident tickets');
});

// You can add more validations here without modifying controllers/services

// Registry for ticket validation strategies
const ticketValidationStrategies = {};

// Register a new validation strategy for a ticket type
export function registerTicketValidation(type, validateFn) {
  ticketValidationStrategies[type] = validateFn;
}

// Get the validation strategy for a ticket type (returns a no-op if not found)
export function getTicketValidation(type) {
  return ticketValidationStrategies[type] || (async () => {});
}

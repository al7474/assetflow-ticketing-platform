/**
 * Authentication validators
 * Input validation for auth-related endpoints
 */


// Helper: Validate name
function _validateName(name, res) {
  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Name is required' });
    return false;
  }
  return true;
}

// Helper: Validate email
function _validateEmail(email, res) {
  if (!email || !email.trim()) {
    res.status(400).json({ error: 'Email is required' });
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'Invalid email format' });
    return false;
  }
  return true;
}

// Helper: Validate password
function _validatePassword(password, res) {
  if (!password) {
    res.status(400).json({ error: 'Password is required' });
    return false;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters long' });
    return false;
  }
  return true;
}

export const validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!_validateName(name, res)) return;
  if (!_validateEmail(email, res)) return;
  if (!_validatePassword(password, res)) return;
  next();
};


export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!_validateEmail(email, res)) return;
  if (!_validatePassword(password, res)) return;
  next();
};


export const validateInvite = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!_validateName(name, res)) return;
  if (!_validateEmail(email, res)) return;
  if (!_validatePassword(password, res)) return;
  next();
};



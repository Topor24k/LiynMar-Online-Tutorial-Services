// Middleware to check user roles
export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('❌ Role check failed: No user in request');
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    console.log(`🔐 Role check - User: ${req.user.email}, Role: ${req.user.role}, Allowed: [${allowedRoles.join(', ')}]`);

    if (!allowedRoles.includes(req.user.role)) {
      console.log(`❌ Access denied for role: ${req.user.role}`);
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Insufficient permissions.'
      });
    }

    console.log('✅ Role check passed');
    next();
  };
};

// Specific role checkers
export const requireAdmin = checkRole('admin');
export const requireTeacherManager = checkRole('admin', 'teacher_manager');
export const requireBookingManager = checkRole('admin', 'booking_manager');

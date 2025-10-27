const ActivityLog = require('../models/ActivityLog.js');

const activityLogger = async (req, res, next) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    user: req.user ? req.user.id : null,
  };

  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    logData.status = res.statusCode;
    ActivityLog.create(logData);
    res.end = originalEnd;
    res.end(chunk, encoding);
  };

  next();
};

module.exports = activityLogger;

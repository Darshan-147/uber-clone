const attempts = new Map();

function authRateLimit(req, res, next) {
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 20;
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter((time) => now - time < windowMs);

  if (recent.length >= maxAttempts) {
    return res.status(429).json({ error: { message: "Too many authentication attempts. Please try again later." } });
  }

  recent.push(now);
  attempts.set(key, recent);
  return next();
}

module.exports = authRateLimit;

function notFound(req, res) {
  res.status(404).json({ error: { message: "Route not found" } });
}

function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  const status = error.statusCode || error.status || 500;
  if (status >= 500) {
    console.error("Request failed", { method: req.method, path: req.originalUrl, message: error.message });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({ error: { message: "Validation failed" } });
  }

  if (error.code === 11000) {
    return res.status(409).json({ error: { message: "Unable to complete this request" } });
  }

  return res.status(status).json({
    error: {
      message: status >= 500 ? "Internal server error" : error.message || "Request failed",
      ...(status < 500 && error.details ? { details: error.details } : {}),
    },
  });
}

module.exports = { errorHandler, notFound };

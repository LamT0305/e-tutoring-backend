export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Not Found - ${req.originalUrl}`,
  });
};

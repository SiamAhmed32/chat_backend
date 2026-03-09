const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode; //if res is still 200 then set it to 500
  res
    .status(statusCode)
    .json({
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};

module.exports = { notFoundHandler, errorHandler };

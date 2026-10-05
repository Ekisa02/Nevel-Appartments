export const notFound = (req, res) => res.status(404).json({ message: 'Route not found.' });
export function errorHandler(err, req, res, _next) {
  if (err.name === 'ZodError') return res.status(400).json({ message: err.issues[0]?.message || 'Invalid input.' });
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ message: status === 500 ? 'Something went wrong. Please try again.' : err.message });
}

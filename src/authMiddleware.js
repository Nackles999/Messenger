function parseBearerToken(req) {
  const authHeader = String(req.headers.authorization || "");
  if (!authHeader.startsWith("Bearer ")) {
    return "";
  }
  return authHeader.slice(7).trim();
}

function createAuthMiddleware(service) {
  return async function authMiddleware(req, res, next) {
    try {
      const token = parseBearerToken(req);
      const session = await service.getSessionByToken(token);
      if (!session) {
        res.status(401).json({ error: "Требуется авторизация" });
        return;
      }

      req.auth = {
        token,
        user: session.user,
      };
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  parseBearerToken,
  createAuthMiddleware,
};

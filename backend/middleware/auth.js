import jwt from "jsonwebtoken";

export const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!roles.includes(decoded.role)) {
        return res.json({ success: false, message: "Forbidden" });
      }
    
      req.user = decoded;
      next();
    } catch (err) {
      res.json({ success: false, message: "Unauthorized" });
    }
  };
};

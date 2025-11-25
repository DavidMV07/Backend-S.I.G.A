import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "Token requerido" });

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ msg: "Token inválido" });
    req.user = payload; // payload debería tener al menos el id y el role
    next();
  });
};

export const authorizeRole = (role) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ msg: "No autenticado" });
    if (user.role !== role) {
      return res.status(403).json({ msg: "Permiso denegado" });
    }
    next();
  };
};

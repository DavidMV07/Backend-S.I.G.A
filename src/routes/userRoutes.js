import express from "express";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token no proporcionado" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Acceso denegado, solo admin" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido" });
  }
};

// Admin: cambiar rol de usuario
router.put("/:id/role", verifyAdmin, async (req, res) => {
  const { role } = req.body;
  const { id } = req.params;

  try {
    const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!updatedUser) return res.status(404).json({ message: "Usuario no encontrado" });
    res.status(200).json({ message: "Rol actualizado correctamente", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar rol", error });
  }
});

// Usuario autenticado: actualizar su propia cuenta
router.put('/me', authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { firstName, lastName, email, password } = req.body;

    const updates = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (email !== undefined) updates.email = email;
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.password = hashed;
    }

    const updated = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json({ message: 'Cuenta actualizada', user: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error actualizando cuenta', error: err.message });
  }
});

export default router;

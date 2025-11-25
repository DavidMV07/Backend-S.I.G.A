import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { authenticate, authorizeRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Verificar admin
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

// Obtener usuarios
router.get("/users", authenticate, authorizeRole("admin"), async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
});

// Crear usuario
router.post("/users", verifyAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Usuario ya existe" });

    const newUser = new User({
      firstName,
      lastName,
      email,
      role: role || "alumno",
    });

    await newUser.save();
    res.status(201).json({ message: "Usuario creado", user: newUser });
  } catch (err) {
    res.status(500).json({ message: "Error al crear usuario" });
  }
});

// Actualizar usuario
router.put("/users/:id", verifyAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({ message: "Usuario actualizado", user: updated });

  } catch (err) {
    res.status(500).json({ message: "Error al actualizar usuario" });
  }
});

// Eliminar usuario
router.delete("/users/:id", verifyAdmin, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({ message: "Usuario eliminado" });

  } catch (err) {
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
});

export default router;

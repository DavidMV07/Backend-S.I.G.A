import express from "express";
import { authenticate, authorizeRole } from "../middlewares/authMiddleware.js";
import { getUsers } from "../controllers/adminUserController.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "Token no proporcionado" });

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

// GET → listar usuarios
router.get("/", authenticate, authorizeRole("admin"), getUsers);

// POST → crear usuario

router.post("/", verifyAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "El usuario ya existe" });

    const newUser = new User({
      firstName,
      lastName,
      email,
      role: role || "alumno",
      password: "123456", // Si no pides contraseña, coloca temporal
    });

    await newUser.save();

    res.status(201).json({
      message: "Usuario creado correctamente",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al crear usuario", error });
  }
});

// PUT → actualizar usuario
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email, role },
      { new: true }
    );

    if (!updatedUser)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.status(200).json({
      message: "Usuario actualizado correctamente",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar usuario", error });
  }
});

// DELETE → eliminar usuario
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar usuario", error });
  }
});

export default router;

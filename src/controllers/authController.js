import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const AuthController = {

  register: async (req, res) => {
    const { email, password, role, firstName, lastName } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "El usuario ya existe" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        firstName: firstName || null,
        lastName: lastName || null,
        email,
        password: hashedPassword,
        role: role || "alumno",
      });

      await newUser.save();
      res.status(201).json({ message: "Usuario registrado exitosamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al registrar el usuario", error });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }

      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET no definido en las variables de entorno');
        return res.status(500).json({ message: 'Error de configuración del servidor' });
      }

      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      // Devolver información básica del usuario junto con el token
      res.status(200).json({
        token,
        role: user.role,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName || null,
          lastName: user.lastName || null,
        },
        message: "Inicio de sesión exitoso",
      });
    } catch (error) {
      res.status(500).json({ message: "Error al iniciar sesión", error });
    }
  },

  me: async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "Token requerido" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Token inválido o expirado" });
    }
  },
};

export default AuthController;

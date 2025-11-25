import User from "../models/userModel.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // sí, no incluyas contraseñas
    res.json(users); // o si prefieres: res.json({ users });
  } catch (err) {
    console.error("Error al leer usuarios:", err);
    res.status(500).json({ msg: "Error del servidor" });
  }
};
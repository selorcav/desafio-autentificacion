const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "lucy2705",
  database: "softjobs",
});

const verificarToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      throw { code: 401, message: "Token no proporcionado" };
    }
    const decoded = jwt.verify(token, "az_AZ");
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    res.status(error.code || 500).send({ message: error.message });
  }
};

const logger = async (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

const registrarUsuario = async (email, password, rol, lenguage) => {
  const consulta = "INSERT INTO usuarios (email, password, rol, lenguage) VALUES ($1, $2, $3, $4) RETURNING *";
  const hashedPassword = await bcrypt.hash(password, 10);
  const values = [email, hashedPassword, rol, lenguage];
  const result = await pool.query(consulta, values);
  return result.rows[0];
};

module.exports = {
  verificarToken,
  logger,
  registrarUsuario,
  pool,
};
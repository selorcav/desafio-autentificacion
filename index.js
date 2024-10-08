const express = require("express");
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { verificarToken, logger, registrarUsuario, pool } = require("./consultas");

app.use(cors());
app.use(express.json());

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const consulta = "SELECT * FROM usuarios WHERE email = $1";
    const values = [email];
    const result = await pool.query(consulta, values);
    if (result.rowCount === 0) {
      throw { code: 404, message: "Usuario no encontrado" };
    }
    const hashedPassword = result.rows[0].password;
    const isValid = await bcrypt.compare(password, hashedPassword);
    if (!isValid) {
      throw { code: 401, message: "Credenciales inválidas" };
    }
    const token = jwt.sign({ email }, "az_AZ");
    res.send(token);
  } catch (error) {
    console.log(error);
    res.status(error.code || 500).send({ message: error.message });
  }
});

app.get("/usuarios", verificarToken, logger, async (req, res) => {
  try {
    const consulta = "SELECT * FROM usuarios";
    const result = await pool.query(consulta);
    res.send(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
});

app.post("/usuarios", async (req, res) => {
  try {
    const { email, password, rol, lenguage } = req.body;
    await registrarUsuario(email, password, rol, lenguage);
    res.send({ message: "Usuario registrado con éxito" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
});

app.listen(3000, console.log("SERVER ON"));
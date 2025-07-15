import express from 'express';
import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = 'tu_clave_secreta'; // Cámbiala por una clave segura

// Endpoint de login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const [users] = await pool.query('SELECT * FROM usuarios_admin WHERE Email = ?', [email]);

  if (users.length === 0) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const user = users[0];
  const passwordMatch = await bcrypt.compare(password, user.PasswordHash);

  if (!passwordMatch) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const token = jwt.sign({ userId: user.ID, email: user.Email }, JWT_SECRET, { expiresIn: '2h' });

  res.json({ token });
});

// Middleware de protección
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

export default router;

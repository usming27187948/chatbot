import express from 'express';
import pool from '../config/db.js';
import { authMiddleware } from './authRoutes.js'; // ✅ Importa aquí

const router = express.Router();
router.use(authMiddleware);

//CONTADOR Total de clientes (interacciones)
router.get('/clients/count', async (req, res) => {
  const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM clientes`);
  res.json(rows[0]);
});

//CONTADOR Total de reuniones
router.get('/reunions/count', async (req, res) => {
  const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM reunion`);
  res.json(rows[0]);
});

//GRAFICA Consultas por producto
router.get('/interactions/by-product', async (req, res) => {
  const [rows] = await pool.query(`
    SELECT p.Nombre, COUNT(*) AS total
    FROM intereses_clientes ic
    JOIN productos p ON ic.ID_Producto = p.ID_Producto
    GROUP BY p.Nombre
    ORDER BY total DESC
  `);
  res.json(rows);
});

//Grafica Reuniones por producto
router.get('/reunions/by-product', async (req, res) => {
  const [rows] = await pool.query(`
    SELECT Producto, COUNT(*) AS total
    FROM reunion
    GROUP BY Producto
    ORDER BY total DESC
  `);
  res.json(rows);
});

//Gráfica de nuevos clientes por mes
router.get('/clients/by-month', async (req, res) => {
  const { startDate, endDate } = req.query;

  const [rows] = await pool.query(
    `
    SELECT
      DATE_FORMAT(Fecha_Solicitud, '%Y-%m') AS mes,
      COUNT(*) AS total
    FROM
      clientes
    WHERE
      Fecha_Solicitud BETWEEN ? AND ?
    GROUP BY
      mes
    ORDER BY
      mes ASC
  `,
    [startDate, endDate]
  );

  res.json(rows);
});




//GRAFICA reuniones por mes
router.get('/reunions/by-month', async (req, res) => {
  const { startDate, endDate } = req.query;

  const [rows] = await pool.query(
    `
    SELECT
      DATE_FORMAT(Fecha_Creacion, '%Y-%m') AS mes,
      COUNT(*) AS total
    FROM
      reunion
    WHERE
      Fecha_Creacion BETWEEN ? AND ?
    GROUP BY
      mes
    ORDER BY
      mes ASC
  `,
    [startDate, endDate]
  );

  res.json(rows);
});


//PANEL de últimas interacciones
router.get('/interactions/recent', async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
      ic.Fecha_Interaccion,
      c.Nombre AS Cliente,
      p.Nombre AS Producto
    FROM intereses_clientes ic
    JOIN clientes c ON ic.ID_Cliente = c.ID_Cliente
    JOIN productos p ON ic.ID_Producto = p.ID_Producto
    ORDER BY ic.Fecha_Interaccion DESC
    LIMIT 10
  `);
  res.json(rows);
});

//conteo de clientes únicos
router.get('/clients/unique-phones', async (req, res) => {
  const [rows] = await pool.query(`
    SELECT COUNT(DISTINCT Telefono) AS total FROM clientes
  `);
  res.json(rows[0]);
});

//PANEL de ultimas reuniones agendadas
router.get('/reunions/recent', async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
      r.Fecha_Creacion,
      c.Nombre AS Cliente,
      r.Producto
    FROM reunion r
    JOIN clientes c ON r.ID_Cliente = c.ID_Cliente
    ORDER BY r.Fecha_Creacion DESC
    LIMIT 10
  `);
  res.json(rows);
});

//CONTADOR promedio mensajes enviados por clientes
router.get('/messages/average', async (req, res) => {
  const [rows] = await pool.query(`
    SELECT
      IFNULL(ROUND(SUM(Cantidad_Mensajes) / COUNT(*), 0), 0) AS promedio
    FROM clientes
  `);
  res.json(rows[0]);
});

//GRAFICA TORTA productos solicitados por categoria (linea de productos)
router.get('/interactions/by-parent-category', async (req, res) => {
  const [rows] = await pool.query(`
    SELECT
      cm.Nombre AS Categoria_Madre,
      COUNT(ic.ID_Interaccion) AS total
    FROM
      intereses_clientes ic
    LEFT JOIN productos p ON ic.ID_Producto = p.ID_Producto
    LEFT JOIN categoria c ON p.ID_Categoria = c.ID_Categoria
    LEFT JOIN categoria_madre cm ON c.ID_Categoria_Madre = cm.ID_Categoria_Madre
    GROUP BY
      cm.Nombre
    ORDER BY
      total DESC
  `);
  res.json(rows);
});



export default router;


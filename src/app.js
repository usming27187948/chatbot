// 1️⃣ IMPORTACIONES
import express from 'express';
import config from './config/env.js';
import webhookRoutes from './routes/webhookRoutes.js';
import statsRoutes from './routes/statsRoutes.js'; // <-- Este es el nuevo
import authRoutes from './routes/authRoutes.js';  
import cors from 'cors';

// 2️⃣ CREAR APP
const app = express();

// 3️⃣ MIDDLEWARES GENERALES
app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json());

// 4️⃣ RUTAS
app.use('/', webhookRoutes);
app.use('/api/stats', statsRoutes); // <-- Aquí montas el middleware de stats
app.use('/api/auth', authRoutes);


// 5️⃣ RUTA DE PRUEBA
app.get('/', (req, res) => {
  res.send(`<pre>Nothing to see here.
Checkout README.md to start.</pre>`);
});

// 6️⃣ INICIAR SERVIDOR
app.listen(config.PORT, () => {
  console.log(`Server is listening on port: ${config.PORT}`);
});

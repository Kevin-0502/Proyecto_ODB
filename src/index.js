'use strict'
import express from 'express'
import compression from 'compression'
import cors from 'cors'
import morgan from 'morgan';
import sequelize from './database/DB_connection.js'
import dotenv from 'dotenv'
import StartRelations from './models/Relaciones.js';
import routes from './routes/index.js';
const app = express();
dotenv.config()

StartRelations()

//function for the connection to the database
const DB_test = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión exitosa');
        await sequelize.sync({ force: false });
    } catch (error) {
        console.log("❌ error al conectar a sql server: ", error);
    }
}

//check if the connection to the database is successful
DB_test();


//settings
const port = process.env.PORT || 3002;

// Detras de un proxy (nginx, Docker, etc.) poner TRUST_PROXY=<n.º de proxies> en el .env (ej. 1)
if (process.env.TRUST_PROXY) {
    const saltos = Number(process.env.TRUST_PROXY);
    if (Number.isInteger(saltos) && saltos >= 0) {
        app.set('trust proxy', saltos);
    } else {
        console.warn('⚠️ TRUST_PROXY debe ser un número (ej. 1); se ignora:', process.env.TRUST_PROXY);
    }
}

//middlewares
app.use(compression());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

//routes
app.use(routes);

// 404 — ruta no encontrada
app.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

// Error handler global — captura cualquier error no manejado en los controllers
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err.stack);
    res.status(500).json({ message: 'Error interno del servidor' });
});

//starting the server
app.listen(port, () => {
    console.log('➡️ Server listening on port ' + port)
})

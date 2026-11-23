import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
dotenv.config();

// T-B43: limite de intentos fallidos en POST /api/login_orientador.
// Por IP, ventana de 15 minutos; solo cuentan los intentos fallidos (status >= 400).
// El conteo vive en memoria: se reinicia al reiniciar el BE y no se comparte entre instancias.
const maxIntentos = Number.parseInt(process.env.LOGIN_ORIENTADOR_MAX_INTENTOS, 10) || 5;

const limiteLoginOrientador = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: maxIntentos,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Demasiados intentos, intente más tarde.' }
});

export default limiteLoginOrientador;

import { Router } from 'express';
const router = Router();

// T-B44: rutas del rol orientador.
// Se montan en src/index.js como app.use('/api/orientador', verifyOrientador, router),
// así que todas pasan por verifyOrientador y req.user.equipos viene de la BD.
// Convención: consultas con GET, acciones con POST/PUT.
// Las próximas rutas (T-B46 a T-B50) se agregan aquí.

// Equipos activos asignados al orientador (adelanta "Consultar mis equipos" de T-B50)
router.get('/mis_equipos', (req, res) => {
    return res.json({ success: true, equipos: req.user.equipos });
});

export default router;

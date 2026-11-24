import jwt from 'jsonwebtoken';
import OrientadorEquipo from '../models/OrientadorEquipo.js';
import Equipo from '../models/Equipo.js';
import Orientador from '../models/Orientador.js';

// T-B44: protege las rutas /api/orientador/...
// 1. Token firmado con JWT_SECRET_ORIENTADOR (un token de admin no pasa -> 401).
// 2. Rol 'orientador' (403 si no).
// 3. Los equipos y el nombre se consultan en la BD en cada request (del token solo se usan
//    el DUI y el rol), así un cambio de asignaciones aplica de inmediato.
const verifyOrientador = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token no proporcionado.' });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET_ORIENTADOR);
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }

    if (decoded.rol !== 'orientador') {
        return res.status(403).json({ message: 'Sin permiso.' });
    }

    if (!decoded.dui_orientador) {
        return res.status(401).json({ message: 'Sesión no válida.' });
    }

    try {
        const asignaciones = await OrientadorEquipo.findAll({
            where: { dui_orientador: decoded.dui_orientador },
            include: [
                {
                    model: Equipo,
                    as: 'equipo',
                    where: { activo: true },
                    attributes: ['id_equipo', 'nombre', 'id_categoria']
                },
                {
                    model: Orientador,
                    as: 'orientador',
                    attributes: ['nombre_orientador']
                }
            ]
        });

        // Sin equipos activos asignados: la sesión ya no es válida (el FE hace logout con 401)
        if (asignaciones.length === 0) {
            return res.status(401).json({ message: 'Sesión no válida.' });
        }

        req.user = {
            rol: 'orientador',
            dui_orientador: decoded.dui_orientador,
            nombre_orientador: asignaciones[0].orientador?.nombre_orientador?.trim(),
            equipos: asignaciones.map(a => ({
                id_equipo: a.equipo.id_equipo,
                nombre: a.equipo.nombre,
                id_categoria: a.equipo.id_categoria,
                rol: a.rol
            }))
        };

        next();
    } catch (error) {
        return res.status(500).json({ message: 'Error al verificar la sesión.' });
    }
};

export default verifyOrientador;

import jwt from 'jsonwebtoken';
import { usuarios } from '../data/usuarios.js';
import OrientadorEquipo from '../models/OrientadorEquipo.js';
import Equipo from '../models/Equipo.js';
import Orientador from '../models/Orientador.js';
import validations from '../utils/validations.js';

const { validate_DUI } = validations();

export const login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'username y password son requeridos.' });
    }

    const usuario = usuarios.find(u => u.username === username && u.password === password);

    if (!usuario) {
        return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
        { username: usuario.username, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

    return res.json({
        success: true,
        token,
        user: { username: usuario.username, rol: usuario.rol }
    });
};

// Login de orientadores (T-B2.1)
// usuario: nombre del equipo | contraseña: DUI del orientador
// Devuelve token si el orientador está asignado a un equipo con ese nombre (cualquier rol).
export const loginOrientador = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'username y password son requeridos.' });
        }

        const nombreEquipo = String(username).trim();

        // Acepta el DUI con o sin guion: 015790610 -> 01579061-0
        let dui = String(password).trim();
        if (/^\d{9}$/.test(dui)) {
            dui = `${dui.slice(0, 8)}-${dui.slice(8)}`;
        }

        if (!validate_DUI(dui)) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
        }

        // Puede haber varios equipos con el mismo nombre (uno por categoría),
        // así que se buscan todas las asignaciones del DUI a equipos con ese nombre.
        const asignaciones = await OrientadorEquipo.findAll({
            where: { dui_orientador: dui },
            include: [
                {
                    model: Equipo,
                    as: 'equipo',
                    where: { nombre: nombreEquipo, activo: true },
                    attributes: ['id_equipo', 'nombre', 'id_categoria']
                },
                {
                    model: Orientador,
                    as: 'orientador',
                    attributes: ['dui_orientador', 'nombre_orientador']
                }
            ]
        });

        if (asignaciones.length === 0) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
        }

        const { orientador } = asignaciones[0];
        const equipos = asignaciones.map(a => ({
            id_equipo: a.equipo.id_equipo,
            nombre: a.equipo.nombre,
            id_categoria: a.equipo.id_categoria,
            rol: a.rol
        }));

        const user = {
            username: nombreEquipo,
            rol: 'orientador',
            dui_orientador: orientador.dui_orientador,
            nombre_orientador: orientador.nombre_orientador?.trim(),
            equipos
        };

        const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '8h' });

        return res.json({ success: true, token, user });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión',
            error: error.message
        });
    }
};

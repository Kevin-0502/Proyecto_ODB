import Equipo from "../models/Equipo.js"
import Categoria from "../models/Categoria.js"
import { isNombreEquipoUnico } from "../utils/validations.js"

export const getEquipos = async (req, res, next) => {
    try {
        /* Filtro tri-estado vía boolean nuleable:
         * ?soloActivos=true → activos | ?soloActivos=false → inactivos | ausente → todos
         */
        const { soloActivos } = req.query
        let where
        if (soloActivos === 'true') where = { activo: true }
        else if (soloActivos === 'false') where = { activo: false }

        const equipos = await Equipo.findAll({
            where,
            include: [{
                model: Categoria,
                as: 'categoria'
            }]
        })
        // Lista filtrada vacía es un resultado válido (200 []); el 404 solo aplica sin filtro.
        if (!where && equipos.length === 0) {
            return res.status(404).json({
                message: 'No existen equipos registrados'
            })
        }
        return res.status(200).json({
            message: 'Equipos registrados',
            equipos: equipos
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error al obtener los equipos',
            error: error.message
        })
    }
}

export const addEquipo = async (req, res, next) => {
    try {
        const { nombre, id_categoria } = req.body
        if (!id_categoria || !nombre) {

            return res.status(400).json({
                message: 'Todos los campos son obligatorios, por favor verifique'
            })
        }

        const categoria = await Categoria.findOne({
            where: {
                id_categoria: id_categoria
            }
        })

        if (!categoria) {
            return res.status(404).json({
                message: 'Esta categoria no esta registrada, por favor verifique'
            })
        }

        if (!await isNombreEquipoUnico(nombre, id_categoria)) {
            return res.status(422).json({
                message: 'Ya existe un equipo con ese nombre, por favor verifique'
            })
        }

        const lastEquipo = await Equipo.findOne({
            order: [['id_equipo', 'DESC']]
        });

        let nextNumber = 1;

        if (lastEquipo) {
            const lastId = lastEquipo.id_equipo;
            const num = parseInt(lastId.slice(1));
            nextNumber = num + 1;
        }

        const id_equipo = `E${nextNumber.toString().padStart(4, "0")}`;

        await Equipo.create({
            id_equipo: id_equipo,
            nombre: nombre,
            id_categoria: id_categoria
        })

        return res.status(201).json({
            message: 'Equipo registrado con exito'
        })
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                message: 'Ya existe un equipo con ese identificador, intente de nuevo'
            })
        }
        return res.status(500).json({
            message: 'Error al agregar el equipo',
            error: error.message
        })
    }
}

export const updateEquipo = async (req, res, next) => {
    try {
        const { id_equipo, nombre, id_categoria, activo } = req.body

        if (!id_equipo || !id_categoria || !nombre) {

            return res.status(400).json({
                message: 'Todos los campos son obligatorios, por favor verifique'
            })
        }

        const equipo = await Equipo.findOne({
            where: {
                id_equipo: id_equipo
            }
        })

        if (!equipo) {
            return res.status(404).json({
                message: 'Este equipo no esta registrado, por favor verifique'
            })
        }

        if (!await isNombreEquipoUnico(nombre, id_categoria, id_equipo)) {
            return res.status(422).json({
                message: 'Ya existe un equipo con ese nombre, por favor verifique'
            })
        }

        const categoria = await Categoria.findOne({
            where: {
                id_categoria: id_categoria
            }
        })
        if (!categoria) {
            return res.status(404).json({
                message: 'Esta categoria no esta registrada, por favor verifique'
            })
        }
        await equipo.update({
            nombre: nombre,
            id_categoria: id_categoria,
            activo: activo
        })
        return res.status(200).json({
            message: 'Equipo actualizado con exito'
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error al actualizar el equipo',
            error: error.message
        })
    }
}

export const deleteEquipo = async (req, res, next) => {
    try {
        const { id_equipo } = req.body
        if (!id_equipo) {

            return res.status(400).json({
                message: 'El id del equipo es obligatorio, por favor verifique'
            })
        }

        const equipo = await Equipo.findOne({
            where: {
                id_equipo: id_equipo
            }
        })

        if (!equipo) {
            return res.status(404).json({
                message: 'Este equipo no esta registrado, por favor verifique'
            })
        }

        await equipo.destroy()

        return res.status(200).json({
            message: 'Equipo eliminado con exito'
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error al eliminar el equipo',
            error: error.message
        })
    }
}





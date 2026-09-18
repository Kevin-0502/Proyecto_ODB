import Orientador from '../models/Orientador.js'
import OrientadorEquipo from '../models/OrientadorEquipo.js'
import Equipo from '../models/Equipo.js'
import validations from '../utils/validations.js'
import { literal } from 'sequelize'

const { validate_DUI } = validations()

//getOrientadores modificado para devolver un estado booleano de la foto en vez de la foto
export const getOrientadores = async (req, res, next) => {
    try {
        const orientadores = await Orientador.findAll({
            attributes: {
                exclude: ['foto_orientador'],
                include: [
                    [literal("CASE WHEN DATALENGTH(foto) > 0 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END"), 'tiene_foto']
                ]
            }
        })

        return res.status(200).json({
            message: 'Orientadores registrados',
            orientadores
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error al obtener los orientadores',
            error: error.message
        })
    }
}

export const addOrientador = async (req, res, next) => {
    try {
        const {
            dui_orientador,
            nombre_orientador,
            direccion_orientador,
            telefono_fijo_orientador,
            fecha_nacimiento,
            lugar_nacimiento,
            nombre_madre,
            nombre_padre,
            nombre_conyuge,
            correo_electronico,
            facebook,
            grupo_familiar,
            religion,
            asiste_iglesia,
            bautizo,
            comunion,
            confirmacion,
            primera_dosis,
            segunda_dosis,
            tercera_dosis,
            estudios_academicos,
            otros_estudios,
            lugar_trabajo
        } = req.body

        if (!nombre_orientador || !dui_orientador || asiste_iglesia == null || confirmacion == null) {
            return res.status(400).json({
                message: 'el nombre, dui, asiste a iglesia y confirmacion son campos obligatorios, por favor verifique'
            })
        }

        if (!validate_DUI(dui_orientador)) {
            return res.status(400).json({
                message: 'Formato de DUI inválido. Debe ser "########-#", por favor verifique',
            });
        }

        const orientador = await Orientador.findOne({
            where: {
                dui_orientador: dui_orientador
            }
        })

        if (orientador) {
            return res.status(400).json({
                message: 'Este dui ya esta registrado'
            })
        }

        await Orientador.create({
            dui_orientador: dui_orientador,
            nombre_orientador: nombre_orientador,
            direccion_orientador: direccion_orientador,
            telefono_fijo_orientador: telefono_fijo_orientador,
            fecha_nacimiento: fecha_nacimiento,
            lugar_nacimiento: lugar_nacimiento,
            nombre_madre: nombre_madre,
            nombre_padre: nombre_padre,
            nombre_conyuge: nombre_conyuge,
            correo_electronico: correo_electronico,
            facebook: facebook,
            grupo_familiar: grupo_familiar,
            religion: religion,
            asiste_iglesia: asiste_iglesia,
            bautizo: bautizo,
            comunion: comunion,
            confirmacion: confirmacion,
            primera_dosis: primera_dosis,
            segunda_dosis: segunda_dosis,
            tercera_dosis: tercera_dosis,
            estudios_academicos: estudios_academicos,
            otros_estudios: otros_estudios,
            lugar_trabajo: lugar_trabajo
        })

        return res.status(200).json({
            message: 'Orientador registrado con exito'
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error al agregar el orientador',
            error: error.message
        })
    }
}

export const updateOrientador = async (req, res, next) => {
    try {
        const {
            dui_orientador,
            nombre_orientador,
            direccion_orientador,
            telefono_fijo_orientador,
            fecha_nacimiento,
            lugar_nacimiento,
            nombre_madre,
            nombre_padre,
            nombre_conyuge,
            correo_electronico,
            facebook,
            grupo_familiar,
            religion,
            asiste_iglesia,
            bautizo,
            comunion,
            confirmacion,
            primera_dosis,
            segunda_dosis,
            tercera_dosis,
            estudios_academicos,
            otros_estudios,
            lugar_trabajo
        } = req.body

        if (!nombre_orientador || !dui_orientador || asiste_iglesia == null || confirmacion == null) {
            return res.status(400).json({
                message: 'el nombre, dui, asiste a iglesia y confirmacion son campos obligatorios'
            })
        }

        const orientador = await Orientador.findOne({
            where: { dui_orientador: dui_orientador }
        });

        if (!orientador) {
            return res.status(404).json({
                message: 'Orientador no encontrado con el DUI proporcionado, por favor verifique'
            });
        }

        await orientador.update({
            nombre_orientador: nombre_orientador,
            direccion_orientador: direccion_orientador,
            telefono_fijo_orientador: telefono_fijo_orientador,
            fecha_nacimiento: fecha_nacimiento,
            lugar_nacimiento: lugar_nacimiento,
            nombre_madre: nombre_madre,
            nombre_padre: nombre_padre,
            nombre_conyuge: nombre_conyuge,
            correo_electronico: correo_electronico,
            facebook: facebook,
            grupo_familiar: grupo_familiar,
            religion: religion,
            asiste_iglesia: asiste_iglesia,
            bautizo: bautizo,
            comunion: comunion,
            confirmacion: confirmacion,
            primera_dosis: primera_dosis,
            segunda_dosis: segunda_dosis,
            tercera_dosis: tercera_dosis,
            estudios_academicos: estudios_academicos,
            otros_estudios: otros_estudios,
            lugar_trabajo: lugar_trabajo
        })
        return res.status(200).json({
            message: 'Orientador actualizado con exito'
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error al actualizar el orientador',
            error: error.message
        })
    }
}

export const deleteOrientador = async (req, res, next) => {
    try {
        const { dui_orientador } = req.body

        if (!dui_orientador) {
            return res.status(400).json({
                message: 'El dui del orientador es un campo obligatorio'
            })
        }

        const orientador = await Orientador.findOne({
            where: {
                dui_orientador: dui_orientador
            }
        })

        if (!orientador) {
            return res.status(404).json({
                message: 'Orientador no encontrado con el DUI proporcionado, por favor verifique'
            })
        }

        await orientador.destroy()
        return res.status(200).json({
            message: 'Orientador eliminado con exito'
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error al eliminar el orientador',
            error: error.message
        })
    }
}

export const asignarOrientadorEquipo = async (req, res, next) => {
    try {
        const { dui_orientador, id_equipo, rol } = req.body

        if (!dui_orientador || !id_equipo || !rol) {
            return res.status(400).json({
                message: 'El dui del orientador, id del equipo y rol son campos obligatorios'
            })
        }

        if (!validate_DUI(dui_orientador)) {
            return res.status(400).json({
                message: 'Formato de DUI inválido. Debe ser "########-#", por favor verifique'
            })
        }

        const orientador = await Orientador.findOne({ where: { dui_orientador } })
        if (!orientador) {
            return res.status(404).json({
                message: 'Orientador no encontrado con el DUI proporcionado, por favor verifique'
            })
        }

        const equipo = await Equipo.findOne({ where: { id_equipo } })
        if (!equipo) {
            return res.status(404).json({
                message: 'Equipo no encontrado con el ID proporcionado, por favor verifique'
            })
        }

        const asignacionExistente = await OrientadorEquipo.findOne({
            where: { dui_orientador, id_equipo }
        })
        if (asignacionExistente) {
            return res.status(400).json({
                message: 'El orientador ya está asignado a este equipo'
            })
        }

        await OrientadorEquipo.create({ dui_orientador, id_equipo, rol })
        return res.status(200).json({
            message: 'Orientador asignado al equipo con exito'
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error al asignar el orientador al equipo',
            error: error.message
        })
    }
}

export const removeOrientadorEquipo = async (req, res, next) => {
    try {
        const { dui_orientador, id_equipo } = req.body

        if (!dui_orientador || !id_equipo) {
            return res.status(400).json({
                message: 'El dui del orientador y el id del equipo son campos obligatorios'
            })
        }

        const asignacion = await OrientadorEquipo.findOne({
            where: { dui_orientador, id_equipo }
        })

        if (!asignacion) {
            return res.status(404).json({
                message: 'No se encontró la asignación del orientador con el equipo indicado'
            })
        }

        await asignacion.destroy()
        return res.status(200).json({
            message: 'Asignación eliminada con exito'
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error al eliminar la asignación',
            error: error.message
        })
    }
}

export const getEquiposByOrientador = async (req, res, next) => {
    try {
        const { dui_orientador } = req.body

        if (!dui_orientador) {
            return res.status(400).json({
                message: 'El dui del orientador es un campo obligatorio'
            })
        }

        const orientador = await Orientador.findOne({ where: { dui_orientador } })
        if (!orientador) {
            return res.status(404).json({
                message: 'Orientador no encontrado con el DUI proporcionado, por favor verifique'
            })
        }

        const asignaciones = await OrientadorEquipo.findAll({
            where: { dui_orientador },
            include: [{ model: Equipo, as: 'equipo' }]
        })

        return res.status(200).json({
            message: 'Equipos del orientador',
            equipos: asignaciones
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error al obtener los equipos del orientador',
            error: error.message
        })
    }
}

export const getOrientadoresByEquipo = async (req, res, next) => {
    try {
        const { id_equipo } = req.body

        if (!id_equipo) {
            return res.status(400).json({
                message: 'El id del equipo es un campo obligatorio'
            })
        }

        const equipo = await Equipo.findOne({ where: { id_equipo } })
        if (!equipo) {
            return res.status(404).json({
                message: 'Equipo no encontrado con el ID proporcionado, por favor verifique'
            })
        }

        const asignaciones = await OrientadorEquipo.findAll({
            where: { id_equipo },
            include: [{ model: Orientador, as: 'orientador' }]
        })

        return res.status(200).json({
            message: 'Orientadores del equipo',
            orientadores: asignaciones
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error al obtener los orientadores del equipo',
            error: error.message
        })
    }
}

export const getFotoOrientador = async (req, res, next) => {
    try {
        const { dui_orientador } = req.body

        if (!dui_orientador) {
            return res.status(400).json({
                message: 'El DUI del orientador es un campo obligatorio'
            })
        }

        const orientador = await Orientador.findOne({
            where: { dui_orientador },
            attributes: ['dui_orientador', 'foto_orientador']
        })

        if (!orientador) {
            return res.status(404).json({
                message: 'Orientador no encontrado con el DUI proporcionado'
            })
        }

        const { foto_orientador } = orientador
        return res.status(200).json({
            message: 'Fotografía obtenida con éxito',
            foto_orientador: Buffer.isBuffer(foto_orientador)
                ? foto_orientador.toString('base64')
                : (foto_orientador ?? null),
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error al obtener la fotografía del orientador',
            error: error.message
        })
    }
}

export const updateFotoOrientador = async (req, res, next) => {
    try {
        const { dui_orientador, foto_orientador } = req.body

        if (!dui_orientador || foto_orientador == null) {
            return res.status(400).json({
                message: 'El DUI y la foto del orientador son campos obligatorios'
            })
        }

        const orientador = await Orientador.findOne({
            where: { dui_orientador }
        })

        if (!orientador) {
            return res.status(404).json({
                message: 'Orientador no encontrado con el DUI proporcionado'
            })
        }

        const fotoBuffer = Buffer.from(foto_orientador, 'base64')
        await orientador.update({ foto_orientador: fotoBuffer })

        return res.status(200).json({
            message: 'Fotografía del orientador actualizada con éxito'
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error al actualizar la fotografía del orientador',
            error: error.message
        })
    }
}

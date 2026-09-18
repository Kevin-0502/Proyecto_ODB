import Jugador from "../models/Jugador.js";
import Equipo from "../models/Equipo.js";
import Categoria from "../models/Categoria.js";
import { Op } from "sequelize";
import validations from "../utils/validations.js";

const { validate_DUI } = validations();

export const getJugadores = async (req, res, next) => {
    try {
        // Solo los campos necesarios para la tabla y filtros del frontend
        const jugadores = await Jugador.findAll({
            attributes: ["id_jugador", "nombre1", "nombre2", "apellido1", "apellido2", "fecha_nacimiento", "activo", "id_equipo", "foto_actual"],
            include: [
                {
                    model: Equipo,
                    as: "equipo",
                    attributes: ["id_equipo", "nombre", "id_categoria"],
                    include: [
                        {
                            model: Categoria,
                            as: "categoria",
                            attributes: ["id_categoria", "nombre", "edadmin", "edadmax"],
                        },
                    ],
                },
            ],
        });
        if (jugadores.length === 0) {
            return res.status(404).json({
                message: "No hay jugadores registrados",
            });
        }

        // Se reemplaza la foto por un estado booleano, nunca se manda el dato de la foto
        const jugadoresConEstadoFoto = jugadores.map((jugador) => {
            const data = jugador.toJSON();
            const tiene_foto = !!data.foto_actual;
            delete data.foto_actual;
            return { ...data, tiene_foto };
        });

        return res.status(200).json({
            message: "Jugadores registrados",
            jugadores: jugadoresConEstadoFoto,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener los jugadores",
        });
    }
};

// Retorna todos los campos de un jugador (excepto foto) para el modal de edición
export const getJugadorParaEditar = async (req, res, next) => {
    try {
        const { id_jugador } = req.body;
        if (!id_jugador) {
            return res.status(400).json({ message: "El id del jugador es obligatorio" });
        }
        const jugador = await Jugador.findOne({
            where: { id_jugador },
            attributes: { exclude: ["foto_actual"] },
            include: [
                {
                    model: Equipo,
                    as: "equipo",
                    include: [{ model: Categoria, as: "categoria" }],
                },
            ],
        });
        if (!jugador) {
            return res.status(404).json({ message: "Jugador no encontrado" });
        }
        return res.status(200).json({ jugador });
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener el jugador" });
    }
};

export const addJugador = async (req, res, next) => {
    try {
        const {
            nombre1,
            nombre2,
            apellido1,
            apellido2,
            fecha_nacimiento,
            genero,
            centro_estudio,
            direccion,
            telefono_fijo,
            telefono_movil,
            religion,
            foto_actual,
            madre,
            numero_partida,
            numero_folio,
            numero_libro,
            año_partida,
            lugar_nacimiento,
            nombre_madre,
            nombre_padre,
            correo,
            facebook,
            asiste_iglesia,
            grupo_familiar,
            primera_dosis,
            segunda_dosis,
            tercera_dosis,
            autorizacion_traslado,
            grado_estudio,
            turno_estudio,
            direccion_centro_estudio,
            bautizo,
            comunion,
            confirmacion,
            dui_jugador,
            id_equipo,
        } = req.body;

        if (!nombre1 || !apellido1 || !fecha_nacimiento || !genero || !id_equipo) {
            return res.status(400).json({
                message: "Faltan datos obligatorios, por favor verifique",
            });
        }

        if (dui_jugador) {
            if (!validate_DUI(dui_jugador)) {
                return res.status(400).json({
                    message:
                        'Formato de DUI inválido. Debe ser "########-#", por favor verifique',
                });
            }

            const verifyDUI = await Jugador.findOne({
                where: {
                    dui_jugador: dui_jugador,
                },
            });

            if (verifyDUI) {
                return res.status(400).json({
                    message: "Este dui ya esta registrado",
                });
            }
        }

        const equipo = await Equipo.findOne({
            where: {
                id_equipo: id_equipo,
            },
        });

        if (!equipo) {
            return res.status(404).json({
                message: "Este equipo no esta registrado, por favor verifique",
            });
        }

        // Generar iniciales
        const iniciales =
            apellido1 && apellido2?.trim()
                ? apellido1.charAt(0).toUpperCase() + apellido2.charAt(0).toUpperCase()
                : apellido1.substring(0, 2).toUpperCase();

        const prefijo = `J${iniciales}`;

        // Obtener todos los IDs existentes con ese prefijo en una sola query
        const idsExistentes = new Set(
            (
                await Jugador.findAll({
                    where: { id_jugador: { [Op.like]: `${prefijo}%` } },
                    attributes: ["id_jugador"],
                    raw: true,
                })
            ).map((j) => j.id_jugador),
        );

        // Buscar el primer ID disponible
        let id_jugador = null;

        for (let i = 1; i <= 9999; i++) {
            const candidato = `${prefijo}${i.toString().padStart(4, "0")}`;
            if (!idsExistentes.has(candidato)) {
                id_jugador = candidato;
                break;
            }
        }

        if (!id_jugador) {
            throw new Error(`Límite de IDs alcanzado para el prefijo "${prefijo}"`);
        }

        await Jugador.create({
            id_jugador: id_jugador,
            nombre1: nombre1,
            nombre2: nombre2,
            apellido1: apellido1,
            apellido2: apellido2,
            fecha_nacimiento: fecha_nacimiento,
            genero: genero,
            centro_estudio: centro_estudio,
            direccion: direccion,
            telefono_fijo: telefono_fijo,
            telefono_movil: telefono_movil,
            religion: religion,
            foto_actual: foto_actual,
            madre: madre,
            numero_partida: numero_partida,
            numero_folio: numero_folio,
            numero_libro: numero_libro,
            año_partida: año_partida,
            lugar_nacimiento: lugar_nacimiento,
            nombre_madre: nombre_madre,
            nombre_padre: nombre_padre,
            correo: correo,
            facebook: facebook,
            asiste_iglesia: asiste_iglesia,
            grupo_familiar: grupo_familiar,
            primera_dosis: primera_dosis,
            segunda_dosis: segunda_dosis,
            tercera_dosis: tercera_dosis,
            autorizacion_traslado: autorizacion_traslado,
            grado_estudio: grado_estudio,
            turno_estudio: turno_estudio,
            direccion_centro_estudio: direccion_centro_estudio,
            bautizo: bautizo,
            comunion: comunion,
            confirmacion: confirmacion,
            dui_jugador: dui_jugador,
            id_equipo: id_equipo,
        });

        return res.status(201).json({
            message: "Jugador registrado con éxito",
        });
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({
                message: "Ya existe un jugador con ese identificador, intente de nuevo",
            });
        }
        return res.status(500).json({
            message: "Error al agregar el jugador",
            error: error.message,
        });
    }
};

export const updateJugador = async (req, res, next) => {
    try {
        const {
            id_jugador,
            nombre1,
            nombre2,
            apellido1,
            apellido2,
            fecha_nacimiento,
            genero,
            centro_estudio,
            direccion,
            telefono_fijo,
            telefono_movil,
            religion,
            foto_actual,
            madre,
            numero_partida,
            numero_folio,
            numero_libro,
            año_partida,
            lugar_nacimiento,
            nombre_madre,
            nombre_padre,
            correo,
            facebook,
            asiste_iglesia,
            grupo_familiar,
            primera_dosis,
            segunda_dosis,
            tercera_dosis,
            autorizacion_traslado,
            grado_estudio,
            turno_estudio,
            direccion_centro_estudio,
            bautizo,
            comunion,
            confirmacion,
            activo,
            dui_jugador,
            id_equipo,
        } = req.body;

        if (
            !id_jugador ||
            !nombre1 ||
            !apellido1 ||
            !fecha_nacimiento ||
            !genero ||
            !id_equipo
        ) {
            return res.status(400).json({
                message: "Faltan datos obligatorios, por favor verifique",
            });
        }

        const jugador = await Jugador.findOne({
            where: {
                id_jugador: id_jugador,
            },
        });

        if (!jugador) {
            return res.status(404).json({
                message: "Este jugador no esta registrado, por favor verifique",
            });
        }

        const equipo = await Equipo.findOne({
            where: {
                id_equipo: id_equipo,
            },
        });

        if (!equipo) {
            return res.status(404).json({
                message: "Este equipo no esta registrado, por favor verifique",
            });
        }

        await jugador.update({
            nombre1: nombre1,
            nombre2: nombre2,
            apellido1: apellido1,
            apellido2: apellido2,
            fecha_nacimiento: fecha_nacimiento,
            genero: genero,
            centro_estudio: centro_estudio,
            direccion: direccion,
            telefono_fijo: telefono_fijo,
            telefono_movil: telefono_movil,
            religion: religion,
            foto_actual: foto_actual,
            madre: madre,
            numero_partida: numero_partida,
            numero_folio: numero_folio,
            numero_libro: numero_libro,
            año_partida: año_partida,
            lugar_nacimiento: lugar_nacimiento,
            nombre_madre: nombre_madre,
            nombre_padre: nombre_padre,
            correo: correo,
            facebook: facebook,
            asiste_iglesia: asiste_iglesia,
            grupo_familiar: grupo_familiar,
            primera_dosis: primera_dosis,
            segunda_dosis: segunda_dosis,
            tercera_dosis: tercera_dosis,
            autorizacion_traslado: autorizacion_traslado,
            grado_estudio: grado_estudio,
            turno_estudio: turno_estudio,
            direccion_centro_estudio: direccion_centro_estudio,
            bautizo: bautizo,
            comunion: comunion,
            confirmacion: confirmacion,
            activo: activo, // esto faltabaaaaa
            dui_jugador: dui_jugador,
            id_equipo: id_equipo,
        });

        // ✅ Devuelve el jugador actualizado
        return res.status(200).json({
            message: "Jugador actualizado correctamente",
            jugador: jugador, // aquí está el jugador actualizado
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error al actualizar el jugador",
            error: error.message,
        });
    }
};

export const deleteJugador = async (req, res, next) => {
    try {
        const { id_jugador } = req.body;

        if (!id_jugador) {
            return res.status(400).json({
                message: "El id del jugador es obligatorio, por favor verifique",
            });
        }

        const jugador = await Jugador.findOne({
            where: {
                id_jugador: id_jugador,
            },
        });

        if (!jugador) {
            return res.status(404).json({
                message: "Este jugador no esta registrado, por favor verifique",
            });
        }

        await jugador.destroy();

        return res.status(200).json({
            message: "Jugador eliminado con exito",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error al eliminar el jugador",
            error: error.message,
        });
    }
};

export const JugadorByID = async (req, res, next) => {
    try {
        const { id_jugador } = req.body;
        if (!id_jugador) {
            return res.status(400).json({
                message:
                    "Debes ingresar el id del jugador que andas buscando, por favor verifique",
            });
        }

        const jugador = await Jugador.findOne({
            where: {
                id_jugador: id_jugador,
            },
            include: [
                {
                    model: Equipo,
                    as: 'equipo',
                },
            ],
        });

        if (!jugador) {
            return res.status(404).json({
                message: "Jugador no encontrado",
            });
        }

        return res.status(200).json({
            message: "Jugador encontrado!",
            jugador: [jugador],
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener el jugador por su id",
            error: error.message,
        });
    }
};

export const JugadorByFullName = async (req, res, next) => {
    try {
        const { nombre_completo } = req.body;
        if (!nombre_completo) {
            return res.status(400).json({
                message:
                    "Debes ingresar el nombre del jugador que andas buscando, por favor verifique",
            });
        }

        const partes = nombre_completo
            .trim()
            .split(/\s+/)
            .map((p) => p.toLowerCase());

        if (partes.length < 2) {
            return res
                .status(400)
                .json({
                    message:
                        "Debes ingresar al menos un nombre y un apellido del jugador, por favor verifique",
                });
        }

        const [nombre1, nombre2, apellido1, apellido2] = [
            partes[0] || "",
            partes[1] && partes.length === 4 ? partes[1] : "",
            partes.length === 4 ? partes[2] : partes[1] || "",
            partes.length === 4 ? partes[3] : partes[2] || "",
        ];

        const jugador = await Jugador.findOne({
            where: {
                [Op.and]: [
                    { nombre1: { [Op.like]: nombre1 } },
                    { apellido1: { [Op.like]: apellido1 } },
                    ...(nombre2 ? [{ nombre2: { [Op.like]: nombre2 } }] : []),
                    ...(apellido2 ? [{ apellido2: { [Op.like]: apellido2 } }] : []),
                ],
            },
            include: [
                {
                    model: Equipo,
                    as: 'equipo',
                },
            ],
        });

        if (!jugador) {
            return res.status(404).json({
                message: "Jugador no encontrado",
            });
        }

        return res.status(200).json({
            message: "Jugador encontrado!",
            jugador: jugador,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener el jugador por su nombre completo",
            error: error.message,
        });
    }
};

export const JugadorByEquipo = async (req, res, next) => {
    try {
        const { id_equipo, id_jugador } = req.body;
        if (!id_equipo) {
            return res.status(400).json({
                message: "El id del equipo es obligatorio, por favor verifique",
            });
        }

        const where = { id_equipo };
        if (id_jugador) where.id_jugador = id_jugador;

        const jugadores = await Jugador.findAll({ where });

        if (jugadores.length === 0) {
            return res.status(404).json({ message: "No se encontraron jugadores" });
        }

        return res.status(200).json({
            message: "Jugador encontrado!",
            jugador: jugadores,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener el jugador",
            error: error.message,
        });
    }
};

export const JugadorByCategoria = async (req, res, next) => {
    try {
        const { id_categoria, id_equipo, id_jugador } = req.body;
        if (!id_categoria || !id_equipo) {
            return res.status(400).json({
                message: "El id de la categoría y del equipo son obligatorios, por favor verifique",
            });
        }

        const equipo = await Equipo.findOne({
            where: { id_categoria, id_equipo },
        });

        if (!equipo) {
            return res.status(404).json({
                message: "Este equipo no esta registrado, por favor verifique",
            });
        }

        const where = { id_equipo: equipo.id_equipo };
        if (id_jugador) where.id_jugador = id_jugador;

        const jugadores = await Jugador.findAll({ where });

        if (jugadores.length === 0) {
            return res.status(404).json({ message: "No se encontraron jugadores" });
        }

        return res.status(200).json({
            message: "Jugador encontrado!",
            jugador: jugadores,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener el jugador",
            error: error.message,
        });
    }
};

export const getFotoJugador = async (req, res, next) => {
    try {
        const { id_jugador } = req.body;
        if (!id_jugador) {
            return res
                .status(400)
                .json({ message: "El id del jugador es requerido" });
        }
        const jugador = await Jugador.findOne({
            attributes: ["foto_actual"],
            where: { id_jugador },
        });
        if (!jugador) {
            return res.status(404).json({ message: "Jugador no encontrado" });
        }
        const foto = jugador.foto_actual;
        return res.status(200).json({
            foto_actual: Buffer.isBuffer(foto)
                ? foto.toString("base64")
                : (foto ?? null),
        });
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Error al obtener la foto", error: error.message });
    }
};

export const updateFotoJugador = async (req, res, next) => {
    try {
        const { id_jugador, foto_actual } = req.body;

        if (!id_jugador || !foto_actual) {
            return res.status(400).json({
                message: "El id del jugador y la foto son requeridos",
            });
        }

        const jugador = await Jugador.findOne({ where: { id_jugador } });

        if (!jugador) {
            return res.status(404).json({
                message: "Jugador no encontrado",
            });
        }

        const fotoBuffer = Buffer.from(foto_actual, "base64");
        await jugador.update({ foto_actual: fotoBuffer });

        return res.status(200).json({
            message: "Foto actualizada con éxito",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error al actualizar la foto",
            error: error.message,
        });
    }
};

export const ChangeJugadorEquipo = async (req, res, next) => {
    try {
        const { id_jugador, id_equipo } = req.body;

        if (!id_jugador || !id_equipo) {
            return res.status(400).json({
                message: "El id del jugador y equipo son obligatorios",
            });
        }

        const equipo = await Equipo.findOne({
            where: {
                id_equipo: id_equipo,
            },
        });

        if (!equipo) {
            return res.status(400).json({
                message: "Este equipo no esta registrado, por favor verifique",
            });
        }

        const jugador = await Jugador.findOne({
            where: {
                id_jugador: id_jugador,
            },
        });

        if (!jugador) {
            return res.status(400).json({
                message: "Jugador no encontrado",
            });
        }

        // Obtener la categoría del equipo destino para validar la edad
        const categoria = await Categoria.findOne({
            where: { id_categoria: equipo.id_categoria },
        });

        if (categoria && categoria.edadmin != null && categoria.edadmax != null) {
            const fechaNacimiento = new Date(jugador.fecha_nacimiento);
            const fechaActual = new Date();
            let edadJugador =
                fechaActual.getFullYear() - fechaNacimiento.getFullYear();

            const mesActual = fechaActual.getMonth();
            const diaActual = fechaActual.getDate();
            const mesNacimiento = fechaNacimiento.getMonth();
            const diaNacimiento = fechaNacimiento.getDate();

            if (
                mesActual < mesNacimiento ||
                (mesActual === mesNacimiento && diaActual < diaNacimiento)
            ) {
                edadJugador--;
            }

            if (edadJugador > categoria.edadmax) {
                return res.status(400).json({
                    message: `Este jugador tiene ${edadJugador} años y sobrepasa la edad máxima (${categoria.edadmax}) de esta categoría`,
                });
            }

            if (edadJugador < categoria.edadmin) {
                return res.status(400).json({
                    message: `Este jugador tiene ${edadJugador} años y no cumple la edad mínima (${categoria.edadmin}) de esta categoría`,
                });
            }
        }

        await jugador.update({
            id_equipo: id_equipo,
        });

        return res.status(200).json({
            message: "Cambio de equipo exitoso",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error al cambiar al jugador de equipo",
            error: error.message,
        });
    }
};

// Activa/desactiva un solo jugador
export const setJugadorActivo = async (req, res, next) => {
    try {
        const { id_jugador, activo } = req.body;

        if (!id_jugador || typeof activo !== "boolean") {
            return res.status(400).json({
                message: "El id del jugador y 'activo' (booleano) son obligatorios, por favor verifique",
            });
        }

        const jugador = await Jugador.findOne({
            where: {
                id_jugador: id_jugador,
            },
        });

        if (!jugador) {
            return res.status(404).json({
                message: "Este jugador no esta registrado, por favor verifique",
            });
        }

        await jugador.update({ activo: activo });

        return res.status(200).json({
            message: `Jugador ${activo ? "activado" : "desactivado"} con exito`,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error al cambiar el estado del jugador",
            error: error.message,
        });
    }
};

// Activa/desactiva varios jugadores a la vez
export const setJugadoresActivo = async (req, res, next) => {
    try {
        const { ids_jugadores, activo } = req.body;

        if (!Array.isArray(ids_jugadores) || ids_jugadores.length === 0 || typeof activo !== "boolean") {
            return res.status(400).json({
                message: "'ids_jugadores' (arreglo no vacio) y 'activo' (booleano) son obligatorios, por favor verifique",
            });
        }

        const [afectados] = await Jugador.update(
            { activo: activo },
            { where: { id_jugador: { [Op.in]: ids_jugadores } } }
        );

        return res.status(200).json({
            message: `${afectados} jugador(es) ${activo ? "activado(s)" : "desactivado(s)"} con exito`,
            afectados: afectados,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error al cambiar el estado de los jugadores",
            error: error.message,
        });
    }
};
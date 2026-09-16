import Equipo from "../models/Equipo.js"

const validations = () => {

    const validate_DUI = (dui_jugador) => {

        const duiRegex = /^\d{8}-\d{1}$/;

        const validate_dui = duiRegex.test(dui_jugador)

        return validate_dui
    }

    return { validate_DUI }
}

// Unicidad del nombre acotada a la categoría: el mismo nombre puede repetirse
// entre categorías distintas, pero no dentro de la misma.
export const isNombreEquipoUnico = async (nombre, id_categoria, excludeId = null) => {
    const equipo = await Equipo.findOne({ where: { nombre, id_categoria } })
    if (!equipo) return true
    if (excludeId && equipo.id_equipo === excludeId) return true
    return false
}

export default validations
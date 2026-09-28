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

// Extrae el año de una fecha sin pasar por new Date(), que interpreta strings
// "YYYY-MM-DD" como UTC y puede correr la fecha un día en husos horarios
// negativos (ej. El Salvador, UTC-6), afectando el año en fechas de
// fin/inicio de año (ej. "2020-01-01" podía leerse como 2019).
const obtenerAnio = (fecha) => {
    if (typeof fecha === "string") {
        const match = fecha.match(/^(\d{4})-\d{2}-\d{2}/)
        if (match) return parseInt(match[1], 10)
    }
    // Fallback para objetos Date u otros formatos que ya lleguen parseados
    return new Date(fecha).getFullYear()
}

// T-B41: valida el año de nacimiento del jugador contra el rango de años
// permitido por la categoría, en vez de la edad exacta calculada con mes/día.
// Usa la misma fórmula que ya se muestra en el frontend (CategoriasPanel.js,
// columna "Años de categoria"): añoActual - edad. Límites inclusivos en ambos
// extremos (un jugador nacido justo en el año límite sí es válido).
export const validarAnioNacimiento = (fecha_nacimiento, categoria) => {
    // Si la categoría no define rango de edades, no hay nada que validar
    if (!categoria || categoria.edadmin == null || categoria.edadmax == null) {
        return { valido: true }
    }

    const anioActual = new Date().getFullYear()
    const anioNacimiento = obtenerAnio(fecha_nacimiento)

    const anioMin = anioActual - categoria.edadmax // nacidos este año o después
    const anioMax = anioActual - categoria.edadmin // nacidos este año o antes

    if (anioNacimiento < anioMin) {
        return {
            valido: false,
            mensaje: `Este jugador nació en ${anioNacimiento} y sobrepasa la edad máxima (${categoria.edadmax}) de esta categoría. Debe haber nacido entre ${anioMin} y ${anioMax}.`
        }
    }

    if (anioNacimiento > anioMax) {
        return {
            valido: false,
            mensaje: `Este jugador nació en ${anioNacimiento} y no cumple la edad mínima (${categoria.edadmin}) de esta categoría. Debe haber nacido entre ${anioMin} y ${anioMax}.`
        }
    }

    return { valido: true }
}

export default validations



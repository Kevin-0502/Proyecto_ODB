import { DataTypes } from "sequelize"
import sequelize from "../database/DB_connection.js"

const Orientador = sequelize.define('orientador', {
    dui_orientador: {
        type: DataTypes.STRING(10),
        allowNull: false,
        primaryKey: true,
        unique: true
    },
    nombre_orientador: {
        type: DataTypes.STRING,
        allowNull: false
    },
    direccion_orientador: {
        type: DataTypes.STRING,
        allowNull: true
    },
    telefono_fijo_orientador: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fecha_nacimiento: {
        type: DataTypes.DATE,
        allowNull: true
    },
    lugar_nacimiento: {
        type: DataTypes.STRING,
        allowNull: true
    },
    nombre_madre: {
        type: DataTypes.STRING,
        allowNull: true
    },
    nombre_padre: {
        type: DataTypes.STRING,
        allowNull: true
    },
    nombre_conyuge: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'nombre_conyuge'
    },
    correo_electronico: {
        type: DataTypes.STRING,
        allowNull: true
    },
    facebook: {
        type: DataTypes.STRING,
        allowNull: true
    },
    grupo_familiar: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    religion: {
        type: DataTypes.STRING,
        allowNull: true
    },
    asiste_iglesia: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    bautizo: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    comunion: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    confirmacion: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    primera_dosis: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    segunda_dosis: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    tercera_dosis: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    estudios_academicos: {
        type: DataTypes.STRING,
        allowNull: true
    },
    otros_estudios: {
        type: DataTypes.STRING,
        allowNull: true
    },
    lugar_trabajo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    foto_orientador: {
        type: DataTypes.BLOB('long'),
        allowNull: true,
        field: 'foto'
    },
    fecha_inscripcion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'orientador',
    timestamps: false
})

export default Orientador
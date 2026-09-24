import { Router } from 'express';
const router = Router();
//const dataController = require('../controllers/dataController');
import { getCategorias, addCategoria, updateCategoria, deleteCategoria } from '../controllers/CategoriaController.js';
import { getEquipos, addEquipo, updateEquipo, deleteEquipo } from '../controllers/EquipoController.js'
import {
    getJugadores,
    addJugador,
    updateJugador,
    deleteJugador,
    JugadorByID,
    JugadorByFullName,
    JugadorByEquipo,
    JugadorByCategoria,
    ChangeJugadorEquipo,
    updateFotoJugador,
    getFotoJugador,
    getJugadorParaEditar,
    setJugadorActivo,
    setJugadoresActivo,
    setJugadoresEquipoActivo
} from '../controllers/JugadorController.js';
import {
    getOrientadores,
    addOrientador,
    updateOrientador,
    deleteOrientador,
    asignarOrientadorEquipo,
    removeOrientadorEquipo,
    getEquiposByOrientador,
    getOrientadoresByEquipo,
    getFotoOrientador,
    updateFotoOrientador
} from '../controllers/OrientadorController.js'
import {
    getTorneos,
    addTorneo,
    updateTorneo,
    deleteTorneo,
    asignarCategoriaATorneo,
    removeCategoriaDeTorneo,
    getCategoriasAsignadasTorneo,
    updateParticipacion
 } from '../controllers/TorneoController.js';
import {
    list_infracciones,
    update_infraccion,
    list_infracciones_jugadores,
    asignar_infraccion_jugador,
    update_infraccion_jugador,
    delete_infraccion_jugador,
    list_infracciones_orientadores,
    asignar_infraccion_orientador,
    update_infraccion_orientador,
    delete_infraccion_orientador
} from '../controllers/InfraccionesController.js'
import {
    list_jornadas,
    jornada_actual,
    suspensiones_jugadores,
    suspensiones_orientadores
} from '../controllers/JornadaController.js';
import verifyToken from '../middlewares/verifyToken.js';
import { login } from '../controllers/AuthController.js';

//routes
//endpoint de autenticación (sin Api_key)
router.post('/api/login', login);

//endpoint for test
router.get('/api/test', (req, res) => {
    const data = {
        "id": "1",
        "name": "API is working"
    }
    res.json(data);
});

//endpoints para jugadores
router.get('/api/list_jugadores', verifyToken, getJugadores)
router.post('/api/add_jugador', verifyToken, addJugador)
router.put('/api/update_jugador', verifyToken, updateJugador)
router.put('/api/update_foto_jugador', verifyToken, updateFotoJugador)
router.post('/api/get_foto_jugador', verifyToken, getFotoJugador)
router.post('/api/get_jugador_editar', verifyToken, getJugadorParaEditar)
router.delete('/api/delete_jugador', verifyToken, deleteJugador)

//endpoints para activar/desactivar jugadores
router.put('/api/set_jugador_activo', verifyToken, setJugadorActivo)
router.put('/api/set_jugadores_activo', verifyToken, setJugadoresActivo)
router.put('/api/set_jugadores_equipo_activo', verifyToken, setJugadoresEquipoActivo)

//endpoint para cambio de equipo
router.post('/api/change_jugador_equipo', verifyToken, ChangeJugadorEquipo)

//enpoints para buscar jugadores
router.post('/api/search_by_id_jugador', verifyToken, JugadorByID)
router.post('/api/search_by_name_jugador', verifyToken, JugadorByFullName)
router.post('/api/search_by_equipo_jugador', verifyToken, JugadorByEquipo)
router.post('/api/search_by_categoria_equipo_jugador', verifyToken, JugadorByCategoria)

//endpoints para categorias
router.get('/api/list_categorias', verifyToken, getCategorias)
router.post('/api/add_categoria', verifyToken, addCategoria)
router.put('/api/update_categoria', verifyToken, updateCategoria)
router.delete('/api/delete_categoria', verifyToken, deleteCategoria)

//endpoints para orientadores
router.get('/api/list_orientadores', verifyToken, getOrientadores)
router.post('/api/add_orientador', verifyToken, addOrientador)
router.put('/api/update_orientador', verifyToken, updateOrientador)
router.delete('/api/delete_orientador', verifyToken, deleteOrientador)

//endpoints para obtener y actualizar la foto del orientador
router.post('/api/get_foto_orientador', verifyToken, getFotoOrientador)
router.post('/api/update_foto_orientador', verifyToken, updateFotoOrientador)

//endpoints para orientador-equipo
router.post('/api/asignar_orientador_equipo', verifyToken, asignarOrientadorEquipo)
router.delete('/api/remove_orientador_equipo', verifyToken, removeOrientadorEquipo)
router.post('/api/get_equipos_by_orientador', verifyToken, getEquiposByOrientador)
router.post('/api/get_orientadores_by_equipo', verifyToken, getOrientadoresByEquipo)

//endpoints para equipos
router.get('/api/list_equipos', verifyToken, getEquipos);
router.post('/api/add_equipo', verifyToken, addEquipo);
router.put('/api/update_equipo', verifyToken, updateEquipo);
router.delete('/api/delete_equipo', verifyToken, deleteEquipo);

//endpoints para torneos
router.get('/api/list_torneos', verifyToken, getTorneos);
router.post('/api/add_torneo', verifyToken, addTorneo);
router.put('/api/update_torneo', verifyToken, updateTorneo);
router.delete('/api/delete_torneo', verifyToken, deleteTorneo);
router.post('/api/asignar_categoria_torneo', verifyToken, asignarCategoriaATorneo);
router.delete('/api/remove_categoria_torneo', verifyToken, removeCategoriaDeTorneo);
router.post('/api/get_categorias_torneo', verifyToken, getCategoriasAsignadasTorneo);
router.put('/api/update_participacio_torneo', verifyToken, updateParticipacion);

//enpoints para infracciones
router.get('/api/list_infracciones', verifyToken, list_infracciones);
router.put('/api/update_infraccion', verifyToken, update_infraccion);
router.get('/api/list_infracciones_jugadores', verifyToken, list_infracciones_jugadores);
router.post('/api/asignar_infraccion', verifyToken, asignar_infraccion_jugador);
router.put('/api/update_asignacion_infraccion_jugador', verifyToken, update_infraccion_jugador);
router.delete('/api/delete_asignacion_infraccion_jugador', verifyToken, delete_infraccion_jugador);

//endpoints para jornadas y suspensiones (calculadas, no persistidas)
router.get('/api/list_jornadas', verifyToken, list_jornadas);
router.get('/api/jornada_actual', verifyToken, jornada_actual);
router.get('/api/suspensiones_jugadores', verifyToken, suspensiones_jugadores);
router.get('/api/suspensiones_orientadores', verifyToken, suspensiones_orientadores);

//endpoints para infracciones de orientadores
router.get('/api/list_infracciones_orientadores', verifyToken, list_infracciones_orientadores);
router.post('/api/asignar_infraccion_orientador', verifyToken, asignar_infraccion_orientador);
router.put('/api/update_asignacion_infraccion_orientador', verifyToken, update_infraccion_orientador);
router.delete('/api/delete_asignacion_infraccion_orientador', verifyToken, delete_infraccion_orientador);

export default router
var express = require('express');
var router = express.Router();

var sesionController = require("../controllers/sesionController");
var registroController = require("../controllers/registroController");
var clasesController = require("../controllers/clasesController");
var equiposController = require("../controllers/equiposController");
var salonesController = require("../controllers/salonesController");

// Sesion:
router.get("/", sesionController.viewIndex);
router.post("/sesion", sesionController.logIn);
router.post("/user", sesionController.createUser);
router.get("/user/:codUser", sesionController.moreInfoUsuario);
router.post("/newInfoUser", sesionController.updateInfoUsuario);
router.get("/close", sesionController.logOut);
// Registro:
router.get("/registro", registroController.viewInfoRegistro);
router.get("/responsables", registroController.getUserResp);
router.get("/cantEquipos/:salones", registroController.getCantidadEquipos);
router.post("/nuevoRegistro", registroController.registrarClase);
// Gestion:
router.get("/viewClass/:page", clasesController.viewClases);
router.get("/clases/:page", clasesController.viewListClass);
router.post("/buscarClase", clasesController.viewEspecificListClass);
router.get("/moreInfoClase/:codClase", clasesController.viewMoreInfo);
router.get("/updateClase/:codClase", clasesController.getInfoUpdateClase);
router.post("/newInfoClase", clasesController.updateInfoClase);
router.get("/finalizeClass/:codClase", clasesController.updateEstadoClase);
router.post("/reportClases", clasesController.reportExcelClases);
// Equipos:
router.get("/equipos/:page", equiposController.viewEquipos);
router.get("/listEquipos/:page/:salon", equiposController.listEquipos);
router.get("/listEquipo/:codEquipo", equiposController.listEquipo);
router.get("/reportEquipos", equiposController.viewReportEquipos);
router.get("/moreInfoEquipo/:codEquipo", equiposController.viewMoreInfoEquipos);
router.post("/newEquipo", equiposController.insertEquipo);
router.post("/updateEquipo", equiposController.updateInfoEquipo);
router.post("/reportInventario", equiposController.getInfoInventario);
router.get("/reportPdf", equiposController.getPdfEquipos);
// Salones:
router.get("/salones", salonesController.viewDahsboard);
router.get("/reportSalones", salonesController.viewReportSalones);
router.post("/reportPresCost", salonesController.getInfoPresCost);
router.post("/newSalon", salonesController.registrarSalon);
router.get("/moreInfoSalon/:codigo", salonesController.moreInfoSalon);
router.post("/updateSalon", salonesController.updateInfoSalon);
module.exports = router;
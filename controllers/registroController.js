const knex = require("../config/database");
const rule = require("./rules/registroRules");

module.exports = {
    // Load info in the view:
    viewInfoRegistro: function(req, res, next) 
    {
        if (req.session.status && req.session.nombre && req.session.nombreCompleto && req.session.privilegio)
        {
            knex.select("codigo", "hora").from("horario").orderBy("hora", "ASC").then(function(horas)
            {
                knex.select("codigo", "nombre").from("programaacademico").orderBy("nombre", "ACS").then(function(programas)
                {
                    knex.select("codigo", "nombre").from("salon").orderBy("nombre", "ASC").then(function(salones)
                    {
                        res.render("registro", {data: {programas: programas, salones: salones, horas: horas, usuario: req.session.nombreCompleto, privilegio: req.session.privilegio, avatar: req.session.avatar}})
                    }).catch(function(err){
                        next();
                    });
                }).catch(function(err){
                    next();
                });
            }).catch(function(err){
                next();
            });
        }
        else
        {
            req.flash("info", "Por favor iniciar sesión en el sistema");
            res.redirect("/");
        }
    },
    // Query get names responsables:
    getUserResp: function(req, res)
    {
        if (req.session.status && req.session.nombre && req.session.nombreCompleto && req.session.privilegio)
        {
            knex("clase").distinct("responsable AS title").select().orderBy("responsable", "ACS").then(function(responsables)
            {
                res.send({data: {responsables: responsables}});  
            }).catch(function(err){
                
            });
        }
        else
        {
            req.flash("info", "Por favor iniciar sesión en el sistema");
            res.redirect("/");
        }
    },
    // Query get number equipos and cargadores: 
    getCantidadEquipos: async function(req, res, next)
    {
        if (req.session.status && req.session.nombre && req.session.nombreCompleto && req.session.privilegio)
        {
            const data = {
                salones: req.params.salones.split(","),
            };
            
            var cantidad = 0;
            var contador = 0;

            const result = rule.ruleSalonesSelect(data);

            if (result.error == null)
            {
                for (let index = 0; index < data.salones.length; index++) 
                {
                    try 
                    {
                        var query = await knex("salon").count("* as cantidad").join("equipo", "salon.codigo", "equipo.salonUbicado").where({"salon.codigo": data.salones[index], "equipo.estado": "En aula"});
                        cantidad += query[0].cantidad;
                        contador ++; 
                    } catch (e) 
                    {
                        break;
                    }
                }

                if (contador == data.salones.length) res.send({data: {status: true, cantidad: cantidad}});
                else res.send({data: {status: false, message: "Ops!!! algo raro paso aca"}});
            } 
            else
            {
                res.send({data: {status: false, message: "Ops!!! algo raro paso aca"}});
            }
        }
        else
        {
            req.flash("info", "Por favor iniciar sesión en el sistema");
            res.redirect("/");
        }
    },
    // Query insert new class: 
    registrarClase: async function(req, res, next)
    {
        if (req.session.status && req.session.nombre && req.session.nombreCompleto && req.session.privilegio)
        {
            const moment = require("moment");
            var contador = 0;

            const data = {
                responsable: req.body.responsable.toUpperCase(),
                codPrograma: parseInt(req.body.codPrograma),
                salones: req.body.salones,
                codHoraInicio: parseInt(req.body.codHoraInicio),
                codHoraFinal: parseInt(req.body.codHoraFinal),
                observaciones: req.body.observaciones.toUpperCase(),
                terminos: req.body.terminos,
            };

            if (data.observaciones.length == 0 || /^\s+$/.test(data.observaciones)) data.observaciones = "SIN OBSERVACIONES";
            
            const result = rule.ruleRegistro(data);

            if (result.error == null)
            {
                for (let index = 0; index < data.salones.length; index++) 
                {
                    try 
                    {
                        var insert = await knex("clase").insert({
                            responsable: data.responsable, 
                            fecha: moment().format("YYYY-MM-DD"), 
                            horaInicio: data.codHoraInicio, 
                            horaFinal: data.codHoraFinal, 
                            salon: data.salones[index], 
                            programaacademico: data.codPrograma, 
                            estado: 1, 
                            observacion: data.observaciones, 
                            horaEntregado: moment().format("HH:mm:ss"),
                        });
                        
                        contador ++;

                    } catch (e) 
                    {
                        break; 
                    }    
                }

                if (contador == data.salones.length) res.send({data: {status: true, message: '<h3 class="font-italic">' + data.responsable + ', su clase ha sido registrada</h3>'}});
                else res.send({data: {status: false, message: "Ops!!! algo raro paso aca"}});
            }
            else
            {
                res.send({data: {status: false, message: "Ops!!! algo raro paso aca"}});
            }
        }
        else
        {
            req.flash("info", "Por favor iniciar sesión en el sistema");
            res.redirect("/");
        }
    }
}
const knex = require("../config/database");
const rule = require("./rules/clasesRules");

module.exports = {
    // Render view clases with data in database: 
    viewClases: function(req, res, next)
    {
        if (req.session.status && req.session.nombre && req.session.nombreCompleto && req.session.privilegio)
        {
            knex.select("codigo", "nombre").from("salon").orderBy("nombre", "ASC").then(function(salones)
            {
                knex("horario").select("codigo", "hora").then(function(horas)
                {
                    knex("clase").count("* AS total").where("estado", 1).then(function(result)
                    {   
                        const numPage = Math.ceil(result[0].total / 5);
                        res.render("clases", {data: {salones: salones, horas: horas, numPage: numPage, usuario: req.session.nombreCompleto, privilegio: req.session.privilegio, avatar: req.session.avatar, message: req.flash("warning")}});
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
    // List class active: 
    viewListClass: async function(req, res)
    {
        const moment = require("moment");

        const data = {
            page: parseInt(req.params.page),
            limit: 5,
        };
        
        var listaClase = await knex.select("clase.codigo", "clase.fecha", "horario.hora", "salon.nombre", "clase.responsable").
                                      from("clase").
                                      join("salon", "clase.salon", "salon.codigo").
                                      join("horario", "clase.horaFinal", "horario.codigo").
                                      where("clase.estado", 1).orderBy("clase.horaEntregado", "DESC").limit(data.limit).offset(data.page);
        
        // Format DATE and HOUR with moment.js:
        for (var i = 0; i < listaClase.length; i ++)
        {
            listaClase[i].fecha = moment(listaClase[i].fecha).utc().format("L");
            listaClase[i].hora = moment(listaClase[i].hora, "HH:mm:ss").format("HH:mm");
        }

        res.send({clases: listaClase, privilegio: req.session.privilegio});
    },
    // List class especific select salon: 
    viewEspecificListClass: async function(req, res)
    {
        const data = {
            salon: req.body.codSalon,
        }; 

        const result = rule.ruleCodSalon(data);

        if (result.error == null)
        {
            const moment = require("moment");
            var listaClase = await knex.select("clase.codigo", "clase.fecha", "horario.hora", "salon.nombre", "clase.responsable").
                                        from("clase").
                                        join("salon", "clase.salon", "salon.codigo").
                                        join("horario", "clase.horaFinal", "horario.codigo").
                                        where({"clase.estado": 1, "salon.codigo": data.salon});

            // Format DATE and HOUR with moment.js:
            for (var i = 0; i < listaClase.length; i ++)
            {
                listaClase[i].fecha = moment(listaClase[i].fecha).utc().format("L");
                listaClase[i].hora = moment(listaClase[i].hora, "HH:mm:ss").format("HH:mm");
            }

            res.send({clases: listaClase, privilegio: req.session.privilegio});
        }
        else
        {
            
        }
    },
    // View info in alert depends class select: 
    viewMoreInfo: function(req, res)
    {
        if (req.session.status && req.session.nombre && req.session.nombreCompleto && req.session.privilegio)
        {
            const data = {
                codClase: req.params.codClase,
            };

            const result = rule.ruleCodClase(data);

            if (result.error == null)
            {
                const moment = require("moment");
                knex("clase").join("programaacademico", "clase.programaacademico", "programaacademico.codigo").join("horario", "clase.horaInicio", "horario.codigo").select("programaacademico.nombre", "horario.hora", "clase.estado").where("clase.codigo", data.codClase).then(function(clase)
                {
                    // Validate estado if 1 o 0: 
                    if (clase[0].estado == 1) clase[0].estado = "En Curso";
                    else clase[0].estado = "Finalizado";
                    // Format Hour with moment.js
                    clase[0].hora = moment(clase[0].hora, "HH:mm:ss").format("HH:mm");
                    res.send({data: {status: true, clase: clase}});
                }).catch(function(err){
                        
                });
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
    // Get info programasAcademicos, salones and responsable by select class:
    getInfoUpdateClase: function(req, res)
    {
        if (req.session.status && req.session.nombre && req.session.nombreCompleto && req.session.privilegio)
        {
            if (req.session.privilegio == "administrador")
            {
                const data = {
                    codClase: req.params.codClase,
                };

                const result = rule.ruleCodClase(data);

                if (result.error == null)
                {
                    knex("clase").select("codigo", "responsable").where("codigo", data.codClase).then(function(clase)
                    {
                        res.send({data: {status: true, clase: clase}});
                    }).catch(function(err){
                        res.send({data: {status: false, message: "Ops!!! algo raro paso aca"}});
                    });
                }
                else
                {
                    res.send({data: {status: false, message: "Ops!!! algo raro paso aca"}});
                }
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
    // Change info in class:
    updateInfoClase: function(req, res) 
    {
        if (req.session.status && req.session.nombre && req.session.nombreCompleto && req.session.privilegio)
        {
            if (req.session.privilegio == "administrador")
            {
                const data = {
                    codigo: req.body.codigo,
                    responsable: req.body.responsable.toUpperCase(),
                    salon: req.body.salon,
                    inicial: req.body.inicial,
                    final: req.body.final,
                };
                
                const result = rule.ruleInfoClase(data);

                if (result.error == null)
                {
                    knex("clase").where("codigo", data.codigo).update({responsable: data.responsable, horaInicio: data.inicial, horaFinal: data.final, salon: data.salon}).then(function(result)
                    {
                        res.send({data: {status: true, message: "La información de la clase se ha modificado correctamente!!!"}});
                    }).catch(function(err){
                        res.send({data: {status: false, message: "Ops!!! algo raro paso aca"}});
                    });
                }
                else
                {
                    res.send({data: {status: false, message: "Ops!!! algo raro paso aca"}});   
                }
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
    // Change estado in class: 
    updateEstadoClase: function(req, res) 
    {  
        if (req.session.status && req.session.nombre && req.session.nombreCompleto && req.session.privilegio)
        {
            const data = {
                codClase: req.params.codClase,
            };

            const moment = require("moment");

            const result = rule.ruleCodClase(data);

            if (result.error == null)
            {
                knex("clase").where("codigo", data.codClase).update({estado: 0, horaRecibido: moment().format("HH:mm:ss")}).then(function(result)
                {
                    res.send({data: {status: true, message: "Salón entregado correctamente!!!"}});
                }).catch(function(err){
                    res.send({data: {status: false, message: "Ops!!! algo raro paso aca"}});
                });
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
    // Render Excel with info clases: 
    reportExcelClases: async function(req, res)
    {
        if (req.session.status && req.session.nombre && req.session.nombreCompleto && req.session.privilegio)
        {
            const data = {
                fechaInicial: req.body.fechaInicial,
                fechaFinal: req.body.fechaFinal,
            };

            const result = rule.ruleFechasClases(data);

            if (result.error == null)
            {
                const excel = require("excel4node");
                const fileExcel = new excel.Workbook();
                const book = fileExcel.addWorksheet("Inventario");
                const titulos = ["Responsable", "Programa Academico", "Salón", "Fecha", "Hora de entrada", "Hora de salida", "Observaciones"];
                const stylesHeader = fileExcel.createStyle({
                    alignment: { horizontal: "center", vertical: "center", }, 
                    font: { bold: true, size: 12, name: "Arial", color: "#ffffff" },
                    border: { left: { style: "thin", }, right: { style: "thin", }, top: { style: "thin", }, bottom: { style: "thin", } },
                    fill: { type: "pattern", patternType: "solid", fgColor: "#ff9800", bgColor: "#ff9800", },
                });

                book.column(1).setWidth(42);
                book.column(2).setWidth(76);
                book.column(3).setWidth(15);
                book.column(4).setWidth(15);
                book.column(5).setWidth(20);
                book.column(6).setWidth(20);
                book.column(7).setWidth(30);

                for (let index = 0; index < titulos.length; index++) 
                {
                    book.cell(1, (index + 1)).string(titulos[index]).style(stylesHeader);
                }

                book.row(1).filter();

                const stylesBody = fileExcel.createStyle({
                    alignment: { horizontal: "left", vertical: "center", }, 
                    font: { bold: false, size: 12, name: "Arial", color: "#000000" },
                    border: { left: { style: "thin", }, right: { style: "thin", }, top: { style: "thin", }, bottom: { style: "thin", } },
                    fill: { type: "pattern", patternType: "solid", fgColor: "#f5f5f5", bgColor: "#f5f5f5", },
                });

                var fila = 2;

                try {
                    const clases = await knex.select("clase.responsable", "programaacademico.nombre AS programa", "salon.nombre AS salon", "clase.fecha", "clase.horaEntregado", "clase.horaRecibido", "clase.observacion").
                        from("clase").
                        join("salon", "clase.salon", "salon.codigo").
                        join("programaacademico", "clase.programaacademico", "programaacademico.codigo").
                        whereBetween("clase.fecha", [data.fechaInicial, data.fechaFinal]);
                    
                    const moment = require("moment");

                        clases.forEach(element => {
                            for (let index = 1; index <= 7; index++) 
                            {
                                if (index == 1) book.cell(fila, index).string(element.responsable).style(stylesBody);
                                if (index == 2) book.cell(fila, index).string(element.programa).style(stylesBody);
                                if (index == 3) book.cell(fila, index).string(element.salon).style(stylesBody);
                                if (index == 4) book.cell(fila, index).string(moment(element.fecha).format("YYYY/MM/DD")).style(stylesBody);
                                if (index == 5) book.cell(fila, index).string(moment(element.horaEntregado, "HH:mm:ss").format("HH:mm")).style(stylesBody);
                                if (index == 6) book.cell(fila, index).string(moment(element.horaRecibido, "HH:mm:ss").format("HH:mm")).style(stylesBody);
                                if (index == 7) 
                                {
                                    if (element.observacion == null) book.cell(fila, index).string("Sin ninguna observación").style(stylesBody);
                                    else book.cell(fila, index).string(element.observacion).style(stylesBody);
                                }
                            }

                            fila ++;
                        });

                        fileExcel.write("Report.xlsx", res);
                } catch (error) {
                    req.flash("error", "Ops!!! Algo raro paso por aquí");
                    res.redirect("/salones");
                }
            }
            else
            {
                req.flash("error", "Ops!!! Algo raro paso por aquí");
                res.redirect("/salones");
            }
        }
        else
        {
            req.flash("info", "Por favor iniciar sesión en el sistema");
            res.redirect("/");
        }
    }
};
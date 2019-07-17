const knex = require("../config/database");
const rule = require("./rules/equiposRules");

module.exports = {
    // Render view info table:
    viewEquipos: function(req, res, next)
    {
        if (req.session.status && req.session.nombre && req.session.nombreCompleto && req.session.privilegio)
        {
            const dataForm = {
                tipo: ["All in One", "Fijo", "Portatil", "WorkStation"].sort(),
                estado: ["En aula", "En soporte", "En prestamo", "De baja"].sort(),
                tipoReporte: ["Reporte general", "Reporte por salon"].sort(),
            };

            knex("salon").select("codigo", "nombre").orderBy("nombre", "ACS").then(function(salones){
                res.render("equipos", {data: {salones: salones, dataForm: dataForm, usuario: req.session.nombreCompleto, privilegio: req.session.privilegio, avatar: req.session.avatar, message: req.flash("error")}}); 
            }).catch(function(err) {
                next();
            });
        }
        else
        {
            req.flash("info", "Por favor iniciar sesión en el sistema");
            res.redirect("/");
        }
    },
    // Return list equipos:
    listEquipos: async function(req, res)
    {
        const data = {
            page: parseInt(req.params.page),
            currentPage: (parseInt(req.params.page) + 10) / 10,
            limit: 10,
            salon: req.params.salon
        };
        
        const equipos = await knex("equipo").join("salon", "equipo.salonUbicado", "salon.codigo").
                                select("equipo.codigo", "equipo.inventario", "equipo.marca", "equipo.tipo", "salon.nombre").
                                where("salonUbicado", data.salon).limit(data.limit).offset(data.page);
        
        const cantidadEquipos = await knex("equipo").count("* AS total").where("salonUbicado", data.salon);
        const numPage = Math.ceil(cantidadEquipos[0].total / 10);

        res.send({equipos: equipos, numPage: numPage, salon: data.salon});
    },
    // Render report estado equipo and total equipos: 
    viewReportEquipos: function(req, res)
    {
        if (req.session.status && req.session.nombre && req.session.nombreCompleto && req.session.privilegio)
        {
            knex("equipo").count("equipo.estado AS total").select("equipo.estado AS label").groupBy("estado").then(function(resEstado)
            {
                knex("equipo").count("equipo.tipo AS total").select("equipo.tipo AS label").groupBy("tipo").then(function(resTipo)
                {
                    res.send({data: {status: true, infoEstado: resEstado, infoTipo: resTipo}});
                }).catch(function(err)
                {

                });
            }).catch(function(err)
            {

            });
        }
        else
        {
            req.flash("info", "Por favor iniciar sesión en el sistema");
            res.redirect("/");
        }
    },
    // Insert new equipo:
    insertEquipo: function(req, res)
    {
        if (req.session.status && req.session.nombre && req.session.nombreCompleto && req.session.privilegio)
        {
            const data = {
                inventario: req.body.inventario,
                serie: req.body.serie.toUpperCase(),
                marca: req.body.marca.toUpperCase(),
                tipo: req.body.tipo,
                estado: req.body.estado,
                salonUbicado: req.body.salonUbicado,
                nombre: req.body.nombre.toUpperCase(),
                observaciones: req.body.observaciones.toUpperCase(), 
            };

            const result = rule.ruleNewEquipo(data);

            if (result.error == null)
            {
                knex("equipo").insert({
                    inventario: data.inventario,
                    serie: data.serie,
                    marca: data.marca,
                    tipo: data.tipo,
                    estado: data.estado,
                    salonUbicado: data.salonUbicado,
                    nombre: data.nombre,
                    observaciones: data.observaciones,
                }).then(function(result){
                    res.send({data: {status: true, message: "La información del equipo se ha actualizado correctamente!!!"}});
                }).catch(function(err){

                });
            }
        }
        else
        {
            req.flash("info", "Por favor iniciar sesión en el sistema");
            res.redirect("/");
        }
    },
    // Get info equipo select: 
    viewMoreInfoEquipos: function(req, res)
    {
        if (req.session.status && req.session.nombre && req.session.nombreCompleto && req.session.privilegio)
        {
            const data = {
                codigo: req.params.codEquipo
            };

            const result = rule.ruleValidateCodigo(data);

            if (result.error == null)
            {
                knex.select("equipo.inventario", "equipo.serie", "equipo.marca", "equipo.tipo", "equipo.nombre AS nomEquipo", "equipo.estado", "salon.codigo AS codSalon", "equipo.observaciones")
                    .from("equipo").join("salon", "equipo.salonUbicado", "salon.codigo")
                    .where("equipo.codigo", data.codigo).then(function(equipo){
                        res.send({data: {status: true, equipo: equipo}});
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
    // Update info equipo select: 
    updateInfoEquipo: function(req, res)
    {
        if (req.session.status && req.session.nombre && req.session.nombreCompleto && req.session.privilegio)
        {
            const data = {
                codigo: req.body.codigo,
                inventario: req.body.inventario.toUpperCase(),
                serie: req.body.serie.toUpperCase(),
                marca: req.body.marca.toUpperCase(),
                tipo: req.body.tipo,
                estado: req.body.estado,
                salonUbicado: req.body.salonUbicado,
                nombre: req.body.nombre.toUpperCase(),
                observaciones: req.body.observaciones.toUpperCase(), 
            };

            const result = rule.ruleUpdateEquipo(data);

            if (result.error == null)
            {
                knex("equipo").update({
                    inventario: data.inventario,
                    serie: data.serie,
                    marca: data.marca,
                    tipo: data.tipo,
                    estado: data.estado,
                    salonUbicado: data.salonUbicado,
                    nombre: data.nombre,
                    observaciones: data.observaciones,
                }).where("codigo", data.codigo).then(function(result){
                    res.send({data: {status: true, message: "La información del equipo se ha actualizado correctamente!!!"}});
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
    // Download Excel inventario equipos: 
    getInfoInventario: async function(req, res)
    {
        if (req.session.status && req.session.nombre && req.session.nombreCompleto && req.session.privilegio)
        {
            const data = {
                type: parseInt(req.body.reportSalon),
            };

            const result = rule.ruleValSelect(data);

            if (result.error == null)
            {
                const excel = require("excel4node");
                const fileExcel = new excel.Workbook();
                const book = fileExcel.addWorksheet("Inventario");
                const titulos = ["Inventario", "Serie", "Marca", "Tipo", "Estado", "Ubicación", "Nombre", "Observaciones"];
                const stylesHeader = fileExcel.createStyle({
                    alignment: { horizontal: "center", vertical: "center", }, 
                    font: { bold: true, size: 12, name: "Arial", color: "#ffffff" },
                    border: { left: { style: "thin", }, right: { style: "thin", }, top: { style: "thin", }, bottom: { style: "thin", } },
                    fill: { type: "pattern", patternType: "solid", fgColor: "#ff9800", bgColor: "#ff9800", },
                });

                book.column(1).setWidth(20);
                book.column(2).setWidth(30);
                book.column(3).setWidth(35);
                book.column(4).setWidth(12);
                book.column(5).setWidth(14);
                book.column(6).setWidth(17);
                book.column(7).setWidth(16);
                book.column(8).setWidth(70);

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

                if (data.type == 0)
                {
                    try {
                        const equipos = await knex.select("equipo.inventario", "equipo.serie", "equipo.marca", "equipo.tipo", "equipo.estado", "salon.nombre AS salonUbicado", "equipo.nombre AS nomEquipo", "equipo.observaciones").
                            from("equipo").join("salon", "equipo.salonUbicado", "salon.codigo");

                        equipos.forEach(element => {
                            for (let index = 1; index <= 8; index++) 
                            {
                                if (index == 1) book.cell(fila, index).string(element.inventario).style(stylesBody);
                                if (index == 2) book.cell(fila, index).string(element.serie).style(stylesBody);
                                if (index == 3) book.cell(fila, index).string(element.marca).style(stylesBody);
                                if (index == 4) book.cell(fila, index).string(element.tipo).style(stylesBody);
                                if (index == 5) book.cell(fila, index).string(element.estado).style(stylesBody);
                                if (index == 6) book.cell(fila, index).string(element.salonUbicado).style(stylesBody);
                                if (index == 7) book.cell(fila, index).string(element.nomEquipo).style(stylesBody);
                                if (index == 8) book.cell(fila, index).string(element.observaciones).style(stylesBody);
                            }
                            fila ++;
                        });
                        fileExcel.write("Report.xlsx", res);
                    } catch (error) {
                        req.flash("error", "Ops!!! algo raro paso aca");
                        res.redirect("/equipos/0");
                    }
                }
                else
                {
                    try {
                        const equipos = await knex.select("equipo.inventario", "equipo.serie", "equipo.marca", "equipo.tipo", "equipo.estado", "salon.nombre AS salonUbicado", "equipo.nombre AS nomEquipo", "equipo.observaciones").
                            from("equipo").join("salon", "equipo.salonUbicado", "salon.codigo").
                            where("salon.codigo", data.type);

                        equipos.forEach(element => {
                            for (let index = 1; index <= 8; index++) 
                            {
                                if (index == 1) book.cell(fila, index).string(element.inventario).style(stylesBody);
                                if (index == 2) book.cell(fila, index).string(element.serie).style(stylesBody);
                                if (index == 3) book.cell(fila, index).string(element.marca).style(stylesBody);
                                if (index == 4) book.cell(fila, index).string(element.tipo).style(stylesBody);
                                if (index == 5) book.cell(fila, index).string(element.estado).style(stylesBody);
                                if (index == 6) book.cell(fila, index).string(element.salonUbicado).style(stylesBody);
                                if (index == 7) book.cell(fila, index).string(element.nomEquipo).style(stylesBody);
                                if (index == 8) book.cell(fila, index).string(element.observaciones).style(stylesBody);
                            }
                            fila ++;
                        });
                        fileExcel.write("Report.xlsx", res);
                    } catch (error) {
                        req.flash("error", "Ops!!! algo raro paso aca");
                        res.redirect("/equipos/0");
                    }
                }
            }
            else
            {
                req.flash("error", "Ops!!! algo raro paso aca");
                res.redirect("/equipos/0");
            }
        }
        else
        {
            req.flash("info", "Por favor iniciar sesión en el sistema");
            res.redirect("/");
        }
    },
}
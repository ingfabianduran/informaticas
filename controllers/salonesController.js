const knex = require("../config/database");
const moment = require("moment");
const rules = require("./rules/salonesRules");

module.exports = {
  // Render info users and salones:
  viewDahsboard: function (req, res, next) {
    if (
      req.session.status &&
      req.session.nombre &&
      req.session.nombreCompleto &&
      req.session.privilegio
    ) {
      knex
        .select("codigo", "nombreCompleto", "privilegio")
        .from("usuario")
        .orderBy("nombreCompleto", "ASC")
        .then(function (usuarios) {
          knex
            .select("codigo", "nombre", "cantidadCargadores")
            .from("salon")
            .orderBy("nombre", "ASC")
            .then(function (salones) {
              var date = "";

              if (moment().format("MM") < 7)
                date = "Reporte por Mes / " + moment().format("YYYY") + " - 1";
              else
                date = "Reporte por Mes / " + moment().format("YYYY") + " - 2";

              const meses = {
                data: [
                  { mes: "Enero", value: "01" },
                  { mes: "Febrero", value: "02" },
                  { mes: "Marzo", value: "03" },
                  { mes: "Abril", value: "04" },
                  { mes: "Mayo", value: "05" },
                  { mes: "Junio", value: "06" },
                  { mes: "Julio", value: "07" },
                  { mes: "Agosto", value: "08" },
                  { mes: "Septiembre", value: "09" },
                  { mes: "Octubre", value: "10" },
                  { mes: "Noviembre", value: "11" },
                  { mes: "Diciembre", value: "12" },
                ],
              };
              const privilegios = {
                data: [
                  { value: "estandar", text: "Estandar" },
                  { value: "administrador", text: "Administrador" },
                ],
              };
              const tiposAula = {
                data: [
                  { value: "fijo", text: "Fijo" },
                  { value: "movil", text: "Movil" },
                ],
              };

              res.render("salones", {
                data: {
                  usuarios: usuarios,
                  salones: salones,
                  meses: meses,
                  privilegios: privilegios,
                  tiposAula: tiposAula,
                  date: date,
                  message: req.flash("error"),
                  usuario: req.session.nombreCompleto,
                  privilegio: req.session.privilegio,
                  avatar: req.session.avatar,
                },
              });
            })
            .catch(function (err) {
              next();
            });
        })
        .catch(function (err) {
          next();
        });
    } else {
      req.flash("info", "Por favor iniciar sesión en el sistema");
      res.redirect("/");
    }
  },
  // Render report (Uso de aulas informaticas en horas):
  viewReportSalones: function (req, res) {
    const dataDate = {
      fechaInicial: null,
      fechaFinal: null,
      añoActual: moment().format("YYYY"),
    };

    if (moment().format("MM") < 7) {
      dataDate.fechaInicial = dataDate.añoActual + "-01-01";
      dataDate.fechaFinal = dataDate.añoActual + "-06-31";
    } else {
      dataDate.fechaInicial = dataDate.añoActual + "-07-01";
      dataDate.fechaFinal = dataDate.añoActual + "-12-31";
    }

    const sql =
      "SELECT SUM((DATE_FORMAT(hFinal.hora, '%k') - DATE_FORMAT(hInicio.hora, '%k'))) AS total, DATE_FORMAT(fecha, '%M') AS mes FROM clase JOIN horario AS hInicio ON clase.horaInicio = hInicio.codigo JOIN horario AS hFinal ON clase.horaFinal = hFinal.codigo WHERE fecha BETWEEN '" +
      dataDate.fechaInicial +
      "' AND '" +
      dataDate.fechaFinal +
      "' GROUP BY MONTH(fecha) ORDER BY MONTH(fecha)";

    knex
      .raw(sql)
      .then(function (report) {
        res.send({ data: { status: true, report: report[0] } });
      })
      .catch(function (err) {
        res.send({
          data: { status: false, message: "Ops!!! algo raro paso aca" },
        });
      });
  },
  // Create file excel with information (Presupuesto y costo):
  getInfoPresCost: function (req, res) {
    if (
      req.session.status &&
      req.session.nombre &&
      req.session.nombreCompleto &&
      req.session.privilegio
    ) {
      const value = {
        value: parseInt(req.body.mes),
      };

      const result = rules.ruleMesSelect(value);

      if (result.error == null) {
        if (value.value < moment().format("MM")) {
          const dataDate = {
            fechaInicial:
              moment().format("YYYY") + "/" + value.value + "/" + "01",
            fechaFinal:
              moment().format("YYYY") + "/" + value.value + "/" + "31",
          };

          const sql =
            "SELECT programaacademico.nombre, SUM(DATE_FORMAT(hFinal.hora, '%k') - DATE_FORMAT(hInicio.hora, '%k')) AS total FROM clase JOIN horario AS hInicio ON clase.horaInicio = hInicio.codigo JOIN horario AS hFinal ON clase.horaFinal = hFinal.codigo JOIN programaacademico ON clase.programaAcademico = programaacademico.codigo WHERE fecha BETWEEN '" +
            dataDate.fechaInicial +
            "' AND '" +
            dataDate.fechaFinal +
            "' GROUP BY programaacademico.nombre";

          // console.log("SQL Pres Cost", sql);

          knex
            .raw(sql)
            .then(function (report) {
              const excel = require("excel4node");
              const fileExcel = new excel.Workbook();
              const book = fileExcel.addWorksheet("Report");
              const titulos = ["Programa Académico", "# de Horas"];
              const stylesHeader = fileExcel.createStyle({
                alignment: { horizontal: "center", vertical: "center" },
                font: { bold: true, size: 12, name: "Arial", color: "#ffffff" },
                border: {
                  left: { style: "thin" },
                  right: { style: "thin" },
                  top: { style: "thin" },
                  bottom: { style: "thin" },
                },
                fill: {
                  type: "pattern",
                  patternType: "solid",
                  fgColor: "#ff9800",
                  bgColor: "#ff9800",
                },
              });

              book.column(1).setWidth(80);
              book.column(2).setWidth(15);

              for (let index = 0; index < titulos.length; index++) {
                book
                  .cell(1, index + 1)
                  .string(titulos[index])
                  .style(stylesHeader);
              }

              const stylesBody = fileExcel.createStyle({
                alignment: { horizontal: "left", vertical: "center" },
                font: {
                  bold: false,
                  size: 12,
                  name: "Arial",
                  color: "#000000",
                },
                border: {
                  left: { style: "thin" },
                  right: { style: "thin" },
                  top: { style: "thin" },
                  bottom: { style: "thin" },
                },
                fill: {
                  type: "pattern",
                  patternType: "solid",
                  fgColor: "#f5f5f5",
                  bgColor: "#f5f5f5",
                },
              });

              var fila = 2;

              report[0].forEach((element) => {
                for (let index = 1; index <= 2; index++) {
                  if (index == 1)
                    book
                      .cell(fila, index)
                      .string(element.nombre)
                      .style(stylesBody);
                  if (index == 2)
                    book
                      .cell(fila, index)
                      .number(element.total)
                      .style(stylesBody);
                }
                fila++;
              });

              fileExcel.write("Report.xlsx", res);
            })
            .catch(function (err) {
              req.flash("error", "Error en la consulta de datos");
              res.redirect("/salones");
            });
        } else {
          req.flash("error", "El mes debe ser inferior al actual");
          res.redirect("/salones");
        }
      } else {
        req.flash("error", "Ops!!! Algo raro paso por aquí");
        res.redirect("/salones");
      }
    } else {
      req.flash("info", "Por favor iniciar sesión en el sistema");
      res.redirect("/");
    }
  },
  // Create new salon:
  registrarSalon: function (req, res, next) {
    if (
      req.session.status &&
      req.session.nombre &&
      req.session.nombreCompleto &&
      req.session.privilegio
    ) {
      const data = {
        nombre: req.body.nombre.toUpperCase(),
        cargadores: req.body.cargadores,
        observaciones: req.body.observaciones.toUpperCase(),
        tipo: req.body.tipo,
      };

      if (data.observaciones == "") data.observaciones = "SIN OBSERVACIONES";

      const validate = rules.ruleNewSalon(data);

      if (validate.error == null) {
        knex("salon")
          .insert({
            nombre: data.nombre,
            cantidadCargadores: data.cargadores,
            observaciones: data.observaciones,
            tipo: data.tipo,
          })
          .then(function (result) {
            res.send({
              data: {
                status: true,
                message:
                  '<h3 class="font-italic">Salón creado correctamente!!!</h3>',
              },
            });
          })
          .catch(function (err) {
            res.send({
              data: { status: false, message: "Ops!!! algo raro paso aca" },
            });
          });
      } else {
        req.flash("error", "Ops!!! Algo raro paso por aquí");
        res.redirect("/salones");
      }
    } else {
      req.flash("info", "Por favor iniciar sesión en el sistema");
      res.redirect("/");
    }
  },
  // Get info select salon:
  moreInfoSalon: function (req, res) {
    if (
      req.session.status &&
      req.session.nombre &&
      req.session.nombreCompleto &&
      req.session.privilegio
    ) {
      const data = {
        codigo: req.params.codigo,
      };

      const result = rules.ruleValidateCodigo(data);

      if (result.error == null) {
        knex
          .select("nombre", "cantidadCargadores", "observaciones", "tipo")
          .from("salon")
          .where("codigo", data.codigo)
          .then(function (salon) {
            res.send({ data: { status: true, salon: salon } });
          })
          .catch(function (err) {
            res.send({
              data: { status: false, message: "Ops!!! algo raro paso aca" },
            });
          });
      } else {
        res.send({
          data: { status: false, message: "Ops!!! algo raro paso aca" },
        });
      }
    } else {
      req.flash("info", "Por favor iniciar sesión en el sistema");
      res.redirect("/");
    }
  },
  // Update info salon:
  updateInfoSalon: function (req, res) {
    if (
      req.session.status &&
      req.session.nombre &&
      req.session.nombreCompleto &&
      req.session.privilegio
    ) {
      const data = {
        codigo: parseInt(req.body.codigo),
        nombre: req.body.nombre.toUpperCase(),
        cargadores: parseInt(req.body.cargadores),
        observaciones: req.body.observaciones.toUpperCase(),
        tipo: req.body.tipo,
      };

      if (data.observaciones == "") data.observaciones = "SIN OBSERVACIONES";

      const validate = rules.ruleUpdateSalon(data);

      if (validate.error == null) {
        knex("salon")
          .where("codigo", data.codigo)
          .update({
            nombre: data.nombre,
            cantidadCargadores: data.cargadores,
            observaciones: data.observaciones,
            tipo: data.tipo,
          })
          .then(function (result) {
            res.send({
              data: {
                status: true,
                message: "Salón actualizado correctamente!!!",
              },
            });
          })
          .catch(function (err) {
            res.send({
              data: {
                status: false,
                message: "Ops!!! Algo raro paso por aquí",
              },
            });
          });
      } else {
        res.send({
          data: { status: false, message: "Ops!!! Algo raro paso por aquí" },
        });
      }
    } else {
      req.flash("info", "Por favor iniciar sesión en el sistema");
      res.redirect("/");
    }
  },
};

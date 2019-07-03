const knex = require("../config/database");
const rule = require("./rules/usuarioRules");
const bcrypt = require("bcrypt");

module.exports = {
    // Render index: 
    viewIndex: function(req, res)
    {
        res.render("index", {message: req.flash("info")});
    },
    // Create new user:
    createUser: function(req, res)
    {
        if (req.session.status && req.session.nombre && req.session.nombreCompleto && req.session.privilegio)
        {
            const data = {
                nombre: req.body.usuario,
                password: req.body.contrasena,
                confirmar: req.body.confirmar,
                privilegio: req.body.perfil,
                estado: req.body.estado,
                nombreCompleto: req.body.nombre,
            };

            const validate = rule.ruleCreateUser(data);

            if (validate.error == null)
            {
                const saltRounds = 10;
                const hash = bcrypt.hashSync(data.password, saltRounds);
                
                knex("usuario").insert({
                    nombre: data.nombre,
                    contrasena: hash,
                    privilegio: data.privilegio,
                    estado: data.estado,
                    nombreCompleto: data.nombreCompleto,
                }).then(function(result){
                    res.send({data: {status: true, message: '<h3 class="font-italic">Usuario creado correctamente!!!</h3>'}});
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
    // Validate user and password: 
    logIn: function(req, res)
    {
        const data = {
            usuario: req.body.usuario.toLowerCase(),
            password: req.body.password,
        };

        const result = rule.ruleAccessUser(data);

        if (result.error == null)
        {
            knex("usuario").select("nombre", "contrasena", "privilegio", "nombreCompleto", "avatar").
                where("nombre", data.usuario).then(function(usuario){
                bcrypt.compare(data.password, usuario[0].contrasena, function(err, compare)
                {
                    if (compare)
                    {
                        req.session.status = true;
                        req.session.nombre = usuario[0].nombre;
                        req.session.nombreCompleto = usuario[0].nombreCompleto
                        req.session.privilegio = usuario[0].privilegio;
                        req.session.avatar = usuario[0].avatar;

                        res.send({data: {status: true, message: "Bienvenido al Sistema de Aulas Informaticas"}});
                    }   
                    else
                    {
                        res.send({data: {status: false, message: "Usuario o Contraseña incorrecta"}});
                    }
                });
            }).catch(function(err){
                res.send({data: {status: false, message: "Ops!!! algo raro paso aca"}});
            });
        }
        else
        {
            res.send({data: {status: false, message: "Ops!!! algo raro paso aca"}});
        }
    },
    // Exit the sesion:
    logOut: function(req, res)
    {
        if (req.session.status && req.session.nombre && req.session.nombreCompleto && req.session.privilegio)
        {
            req.session.destroy();   
            res.send({data: {status: true, message: "Gracias por utilizar el sistema de Aulas Informaticas"}});
        }
        else
        {
            req.flash("info", "Por favor iniciar sesión en el sistema");
            res.redirect("/");
        }
    },
    // Select user depend the user select: 
    moreInfoUsuario: function(req, res)
    {
        if (req.session.status && req.session.nombre && req.session.nombreCompleto && req.session.privilegio)
        {
            const data = {
                codigo: req.params.codUser,
            };

            const result = rule.ruleValidateCodigo(data);

            if (result.error == null)
            {
                knex.select("codigo", "nombre", "privilegio", "estado", "nombreCompleto").
                    from("usuario").where("codigo", data.codigo).then(function(usuario){
                        res.send({data: {status: true, usuario: usuario}});
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
    // Update info usuario:
    updateInfoUsuario: function(req, res)
    {
        if (req.session.status && req.session.nombre && req.session.nombreCompleto && req.session.privilegio)
        {
            const data = {
                codigo: parseInt(req.body.codigo),
                nombre: req.body.usuario,
                password: req.body.contrasena,
                confirmar: req.body.confirmar,
                privilegio: req.body.perfil,
                estado: parseInt(req.body.estado),
                nombreCompleto: req.body.nombre,
            };

            const validate = rule.ruleUpdateUser(data);

            if (validate.error == null)
            {
                const saltRounds = 10;
                const hash = bcrypt.hashSync(data.password, saltRounds);

                knex("usuario").update({
                    nombre: data.nombre,
                    contrasena: hash,
                    privilegio: data.privilegio,
                    estado: data.estado,
                    nombreCompleto: data.nombreCompleto,
                }).where("codigo", data.codigo).then(function(result){
                    res.send({data: {status: true, message: "Usuario actualizado correctamente!!!"}});
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
    }
}
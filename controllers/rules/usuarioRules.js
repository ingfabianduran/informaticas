const joi = require("joi");

module.exports = {
    // JSON validate data user: 
    ruleCreateUser: function(data)
    {
        const object = joi.object().keys({
            nombre: joi.string().max(45).required(),
            password: joi.string().required(),
            confirmar: joi.any().valid(joi.ref("password")).required(),
            privilegio: joi.string().valid("estandar", "administrador").required(),
            estado: joi.number().valid(1, 0).required(),
            nombreCompleto: joi.string().max(80).required()
        });

        const result = joi.validate(data, object);
        return result;
    },
    // JSON validate init sesion data:
    ruleAccessUser: function(data)
    {
        const object = joi.object().keys({
            usuario: joi.string().required(),
            password: joi.string().required(), 
        });

        const result = joi.validate(data, object);
        return result;
    },
    // JSON validate cod user: 
    ruleValidateCodigo: function(data)
    {
        const object = joi.object().keys({
            codigo: joi.number().positive().required(),
        });

        const result = joi.validate(data, object);
        return result;        
    },
    // JSON validate info user before update: 
    ruleUpdateUser: function(data)
    {
        const object = joi.object().keys({
            codigo: joi.number().positive().required(),
            nombre: joi.string().max(45).required(),
            password: joi.string().required(),
            confirmar: joi.any().valid(joi.ref("password")).required(),
            privilegio: joi.string().valid("estandar", "administrador").required(),
            estado: joi.number().valid(1, 0).required(),
            nombreCompleto: joi.string().max(80).required()
        });

        const result = joi.validate(data, object);
        return result;
    }
};
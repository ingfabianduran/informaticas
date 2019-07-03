const joi = require("joi");

module.exports = {
    // Validate JSON POST mes select:
    ruleMesSelect: function(data)
    {
        const object = joi.object().keys({
            value: joi.number().integer().positive().required(),
        });

        const result = joi.validate(data, object);
        return result;
    },
    // Validate JSON POST new salon:
    ruleNewSalon: function(data)
    {
        const object = joi.object().keys({
            nombre: joi.string().max(30).required(),
            cargadores: joi.number().positive().required(),
            observaciones: joi.string().max(60),
            tipo: joi.string().valid("fijo", "movil").required(),
        });

        const result = joi.validate(data, object);
        return result;
    },
    // JSON validate cod salon: 
    ruleValidateCodigo: function(data)
    {
        const object = joi.object().keys({
            codigo: joi.number().positive().required(),
        });

        const result = joi.validate(data, object);
        return result;        
    },
    // Validate JSON POST update salon:
    ruleUpdateSalon: function(data)
    {
        const object = joi.object().keys({
            codigo: joi.number().positive().required(),
            nombre: joi.string().max(30).required(),
            cargadores: joi.number().allow(0).required(),
            observaciones: joi.string().max(60),
            tipo: joi.string().valid("fijo", "movil").required(),
        });

        const result = joi.validate(data, object);
        return result;
    }
};
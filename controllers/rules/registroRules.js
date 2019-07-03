const joi = require("joi");

module.exports = {
    // Validate JSON GET cantidad equipos:
    ruleSalonesSelect: function(data) 
    {
        const object = joi.object().keys({
            salones: joi.array().max(3).min(1).required(),
        });

        const result = joi.validate(data, object);
        return result;
    },
    // Validate JSON POST registro clase: 
    ruleRegistro: function(data)
    {
        const object = joi.object().keys({
            responsable: joi.string().max(80).required(),
            codPrograma: joi.number().positive().required(),
            salones: joi.array().max(3).min(1).required(),
            codHoraInicio: joi.number().positive().required(),
            codHoraFinal: joi.number().positive().required(),
            observaciones: joi.string().max(100),
            terminos: joi.boolean().valid(true).required(),
        });

        const result = joi.validate(data, object);
        return result;
    }
}
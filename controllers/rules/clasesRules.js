const joi = require("joi");

module.exports = {
    // Validate JSON GET codClase: 
    ruleCodClase: function(data)
    {
        const object = joi.object().keys({
            codClase: joi.number().positive().required(),
        });

        const result = joi.validate(data, object);
        return result;
    },
    // Validate JSON POST infoClase: 
    ruleInfoClase: function(data)
    {
        const object = joi.object().keys({
            codigo: joi.number().positive().required(),
            responsable: joi.string().max(80).min(6).required(),
            salon: joi.number().positive().required(),
            inicial: joi.number().positive().required(),
            final: joi.number().positive().required(),
        });

        const result = joi.validate(data, object);
        return result; 
    },
    // Validate JSON POST consultaSalon: 
    ruleCodSalon: function(data) 
    {
        const object = joi.object().keys({
            salon: joi.number().positive().required(),
        });    

        const result = joi.validate(data, object);
        return result;
    },
    // Validate JSON fechas report clases 
    ruleFechasClases: function(data)
    {
        const object = joi.object().keys({
            fechaInicial: joi.date().required(),
            fechaFinal: joi.date().required(),
        });    

        const result = joi.validate(data, object);
        return result;
    }
}
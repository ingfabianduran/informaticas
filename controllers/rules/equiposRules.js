const joi = require("joi");

module.exports = {
    // Validate JSON new equipo: 
    ruleNewEquipo: function(data)
    {
        const object = joi.object().keys({
            inventario: joi.string().max(15).required(),
            serie: joi.string().max(30).required(),
            marca: joi.string().max(45).required(),
            tipo: joi.string().max(15).valid("All in One", "Fijo", "Portatil", "WorkStation").required(),
            estado: joi.string().max(15).valid("De baja", "En aula", "En prestamo", "En soporte").required(),
            salonUbicado: joi.number().positive().required(),
            nombre: joi.string().max(30).required(),
            observaciones: joi.string().max(100),
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
    // Validate JSON update equipo: 
    ruleUpdateEquipo: function(data)
    {
        const object = joi.object().keys({
            codigo: joi.number().positive().required(),
            inventario: joi.string().max(15).required(),
            serie: joi.string().max(30).required(),
            marca: joi.string().max(45).required(),
            tipo: joi.string().max(15).valid("All in One", "Fijo", "Portatil", "WorkStation").required(),
            estado: joi.string().max(15).valid("De baja", "En aula", "En prestamo", "En soporte").required(),
            salonUbicado: joi.number().positive().required(),
            nombre: joi.string().max(30).required(),
            observaciones: joi.string().max(100),
        });

        const result = joi.validate(data, object);
        return result;
    }, 
    // Validate serial or inventario:
    ruleConSerial: function(data)
    {
        const object = joi.object().keys({
            codEquipo: joi.string().required(),
        });

        const result = joi.validate(data, object);
        return result;
    },
    // Validate val select report: 
    ruleValSelect: function(data)
    {
        const object = joi.object().keys({
            type: joi.number().allow(0).required(),
        });

        const result = joi.validate(data, object);
        return result;
    },
    // Validate data for select equipos with salon: 
    ruleListEquipos: function(data)
    {
        const object = joi.object().keys({
            page: joi.number().allow(0).required(),
            currentPage: joi.number().positive().required(),
            limit: joi.number().positive().required(),
            salon: joi.number().positive().required(),
        });

        const result = joi.validate(data, object);
        return result;
    },
    // Validate data before generate PDF:
    ruleGeneratePdf: function(data)
    {
        const object = joi.object().keys({
            fecha: joi.date().required(),
            area: joi.string().min(6).max(30).required(),
            responsable: joi.string().min(5).max(45).required(),
            equipos: joi.array().items(joi.string().required()).min(1)
        });

        const result = joi.validate(data, object);
        return result;
    }
}
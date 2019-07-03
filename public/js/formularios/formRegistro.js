// Cuando la pagina carga: 
$(document).ready(function()
{
    // For dropdows multiple max select 3 items: 
	$(".ui.dropdown").dropdown({
        maxSelections: 3,
    });

    validateFormRegistro();
    mostrarResponsables();
    viewCantidadEquipos();

    setInterval(function(){
        $("#divRegistro").removeClass("active");
    }, 2000);
});
// Peticion AJAX que trae los nombres de los responsables: 
function mostrarResponsables()
{
    $.ajax({
        type: "GET",
        url: "/responsables",
        success: function (response) 
        {   
            $('.ui.search').search({
                source: response.data.responsables,
                searchFields: ['title'],
            });
        }
    });
}
// View cantidad de equipos by select salon: 
function viewCantidadEquipos()
{
    $("#salon").change(function (e) 
    { 
        e.preventDefault();
        
        const salones = $("#salon").val();

        if (salones.length != 0)
        {
            $.ajax({
                type: "GET",
                url: "/cantEquipos/" + salones,
                success: function (response) 
                {
                    if (response.data.status)
                    {
                        $("#cantidad").text(response.data.cantidad);
                    }
                    else
                    {
                        viewAlertError(response.data.message);
                    }
                }
            });
        }
    });
}
// Valida el formulario antes de enviar los datos al servidor: 
function validateFormRegistro()
{
    // Add rules perzonalizadas: 
    $.fn.form.settings.rules.final = function(value, adminLevel) 
    {
        const hInicial = parseInt($("#inicio").val());
        
        if (parseInt(value) > hInicial) return true;
        else return false;
    };

    $.fn.form.settings.rules.inicial = function(value, adminLevel) 
    {
        const hFinal = parseInt($("#final").val());
        
        if (parseInt(value) < hFinal) return true;
        else return false;
    };

    $("#formRegistro").form({
        fields: {
            responsable: {
                identifier: "responsable",
                rules: [
                    {type: "empty", prompt: "Digite el nombre del responsable"},
                    {type: "maxLength[80]", prompt: "Maximo 80 caracteres"},
                ],
            },
            programa: {
                identifier: "programa",
                rules: [{ type: "empty", prompt: "Seleccioné un programa",}],
            },
            salon: {
                identifier: "salon",
                rules: [{type: "empty", prompt: "Seleccioné un salon",}],
            },
            inicio: {
                identifier: "inicio",
                rules: [
                    {type: "empty", prompt: "Seleccioné una hora",}, 
                    {type: "different[final]", prompt : "La hora no puede ser igual a la {ruleValue}"},
                    {type: "inicial", prompt : "La hora debe ser menor a la final"}
                ],
            },
            final: {
                identifier: "final",
                rules: [
                    {type: "empty", prompt: "Seleccioné una hora",}, 
                    {type: "different[inicio]", prompt : "La hora no puede ser igual a la de {ruleValue}"},
                    {type: "final", prompt : "La hora debe ser mayor a la inicial"}
                ]
            },
            terms: {
                identifier: "terminos",
                rules: [{type: "checked", prompt: "Acepte los terminos y condiciones",}]
            },
        },
        inline: true, 
        on: 'blur',
        onSuccess: function(event)
        {
            event.preventDefault(); 
            registrarClase();
        }
    })
}
// Peticion AJAX que despues de validar el formulario se envia los datos al servidor: 
function registrarClase()
{
    const data = {
        responsable: $("#responsable").val(),
        codPrograma: $("#programa").val(),
        salones: $("#salon").val(),
        codHoraInicio: $("#inicio").val(),
        codHoraFinal: $("#final").val(),
        observaciones: $("#observaciones").val(),
        terminos: $("#terminos").is(":checked"),
    };

    $.ajax({
        type: "POST",
        url: "/nuevoRegistro",
        data: JSON.stringify(data),
        contentType: "application/json",
        beforeSend: function() 
        {
            $("#formRegistro").addClass("loading");
        },
        success: function (response) 
        {
            if (response.data.status)
            {
                viewAlertSuccess(response.data.message);
            }
            else
            {
                viewAlertError(response.data.message);
            }
        },
        complete: function()
        {
            $("#formRegistro").removeClass("loading");
        }
    });
}
// Render alert with template HTML: 
function viewAlertSuccess(templated)
{        
    Swal.fire({
        title: '<h1 class="font-weight-bold">OK!!!!</h1>',
        type: 'success',
        html: templated,
        showCloseButton: true,
        showCancelButton: false,
        focusConfirm: false,
        confirmButtonText: '<i class="fa fa-thumbs-up"></i> Entendido!!!',
        confirmButtonColor: '#ff4444',
        confirmButtonAriaLabel: 'Thumbs up, great!',
        animation: false,
        customClass: {
            popup: 'animated tada'
        }
    }).then(function() {
        location.href = "/registro";
    });
}
// Render alert error with message: 
function viewAlertError(message)
{
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 7000
    });
    
    Toast.fire({
        type: 'error',
        title: message,
    });
}
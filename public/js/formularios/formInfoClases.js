// Event init this page:
$(document).ready(function () 
{   
    $(".ui.dropdown").dropdown();
    mostrarClases(0, null);

    validateFormConsulta();
    validateFormUpdateClase();
    $("[data-toggle='tooltip']").tooltip();
});
// View class in the table: 
function mostrarClases(page, element)
{
    $.ajax({
        type: "GET",
        url: "/clases/" + page,
        beforeSend: function() 
        {
            viewWaitMe("#container");
        },
        success: function(response) {
            
            // CSS class remove and add with pagination: 
            $("#tableClass tbody > tr").remove();
            $("ul").children().removeClass("active");
            if (element != null) $(element).parent().addClass("active");
            else $('#pagination li:first-child').addClass("active"); 

            if (response.clases.length > 0)
            {
                $.each(response.clases, function (index, clase) 
                { 
                    $("#tableClass").append(renderTable(clase, response.privilegio));
                });
            }
            else
            {
                $("#tableClass").append('<tr><td colspan="5">Consulta sin resultados o Clases no activas. Para volver a consultar haga click <a class="font-weight-bold" href="/viewClass/0">Aquí</a></td></tr>');
            }
        }, 
        complete: function() {
            setInterval(function() {
                stopWaitMe("#container");
            }, 2000);
        }
    });
}
// View class especific select salon:
function mostrarClasesEspecificas()
{
    const data = {
        codSalon: $("#salon").val(),
    };

    $.ajax({
        type: "POST",
        url: "/buscarClase",
        data: JSON.stringify(data),
        contentType: "application/json",
        beforeSend: function()
        {
            $("#formBuscarClase").addClass("loading");
        },
        success: function (response) 
        {
            $("#tableClass tbody > tr").remove();
            $("#pagination").remove();
            $("#salon").dropdown("clear");

            if (response.clases.length > 0)
            {
                $.each(response.clases, function (index, clase) 
                { 
                    $("#tableClass").append(renderTable(clase, response.privilegio));
                });
            }
            else
            {
                $("#tableClass").append('<tr><td colspan="5">Consulta sin resultados o Clases no activas. Para volver a consultar haga click <a class="font-weight-bold" href="/viewClass/0">Aquí</a></td></tr>');
            }
        },
        complete: function()
        {
            setInterval(function(){
                $("#formBuscarClase").removeClass("loading");
            }, 2000);
        }
    });
}
// Render tr and td table validate privileges user: 
function renderTable(clase, usuario)
{
    var template = '';

    if (usuario == "administrador")
    {
        template = '<tr>' +
                        '<td>' + clase.fecha + '</td>' + 
                        '<td>' + clase.hora + '</td>' +
                        '<td>' + clase.nombre + '</td>' +
                        '<td>' + clase.responsable + '</td>' +
                        '<td>' + 
                            '<button class="btn btn-elegant" data-id="' + clase.codigo + '" data-toggle="tooltip" data-placement="left" title="Mas información" onclick="masInformacion(this)"><i class="fas fa-info"></i></button>' +
                            '<span data-toggle="modal" data-target="#modalModificarClase"><button class="btn orange text-white m-1" data-id="' + clase.codigo + '" data-toggle="tooltip" data-placement="bottom" title="Modificar clase" onclick="editarInformacionClase(this)"><i class="fas fa-pen"></i></button></span>' +
                            '<button class="btn btn-danger" data-id="' + clase.codigo + '" data-toggle="tooltip" data-placement="right" title="Entregar salón" onclick="finalizarClase(this)"><i class="fas fa-thumbs-up"></i></button>' +
                        '</td>' +
                    '</tr>';
    }
    else
    {
        template = '<tr>' +
                        '<td>' + clase.fecha + '</td>' + 
                        '<td>' + clase.hora + '</td>' +
                        '<td>' + clase.nombre + '</td>' +
                        '<td>' + clase.responsable + '</td>' +
                        '<td>' + 
                            '<button class="btn btn-elegant" data-id="' + clase.codigo + '" data-toggle="tooltip" data-placement="left" title="Mas información" onclick="masInformacion(this)"><i class="fas fa-info"></i></button>' +
                            '<button class="btn btn-danger" data-id="' + clase.codigo + '" data-toggle="tooltip" data-placement="right" title="Entregar salón" onclick="finalizarClase(this)"><i class="fas fa-thumbs-up"></i></button>' +
                        '</td>' +
                    '</tr>';
    }

    return template;
}
// Call AJAX view information class: 
function masInformacion(element)
{
    const codClase = $(element).data("id");

    $.ajax({
        type: "GET",
        url: "/moreInfoClase/" + codClase,
        success: function (response) 
        {   
            if (response.data.status)
            {
                const template = templatedMasInfo(response.data.clase);

                Swal.fire({
                    title: template.title,
                    type: "info",
                    html: template.body,
                    showCloseButton: true,
                    showCancelButton: true,
                    focusConfirm: false,
                    confirmButtonText: template.textBtConfirm,
                    confirmButtonColor: '#ff4444',
                    cancelButtonText: template.textBtCancel,
                    cancelButtonColor: '#2E2E2E', 
                    animation: false,
                    customClass: {
                        popup: 'animated tada'
                    },
                });
            }
            else
            {
                viewAlertError(response.data.message);
            }
        }
    });
}
// Call AJAX edit information class: 
function editarInformacionClase(element)
{
    $("#formModificarClase").addClass("loading");
    const codClase = $(element).data("id");

    $(window).on('shown.bs.modal', function() 
    { 
        $.ajax({
            type: "GET",
            url: "/updateClase/" + codClase,
            beforeSend: function()
            {
                
            },
            success: function (response) 
            {
                if (response.data.status)
                {
                    $('#btModificar').data('id', response.data.clase[0].codigo);
                    $("#responsable").val(response.data.clase[0].responsable);               
                }
                else
                {
                    viewAlertError(response.data.message);   
                } 
            },
            complete: function()
            {
                setInterval(function() {
                     $("#formModificarClase").removeClass("loading")}, 2000);
            }
        });  
    });  
}
// Ajax update info class:
function ajaxUpdateClase()
{
    const data = {
        codigo: $("#btModificar").data("id"), 
        responsable: $("#responsable").val(),
        salon: $("#salonUpdate").val(),
        inicial: $("#inicial").val(),
        final: $("#final").val(),
    };

    $.ajax({
        type: "POST",
        url: "/newInfoClase",
        data: JSON.stringify(data),
        contentType: "application/json",
        beforeSend: function() 
        {
            $("#formModificarClase").addClass("loading");
        },
        success: function (response) 
        {
            if (response.data.status)
            {
                Swal.fire('Correcto!!!', response.data.message, 'success').then(function(){
                    location.href = "/viewClass/0";
                });
            }
            else
            {
                viewAlertError(response.data.message);
            }
        },
        complete: function()
        {
            $("#formModificarClase").removeClass("loading");
        }
    });
}
// Call AJAX update estado class:
function finalizarClase(element)
{
    const template = templatedFinalizarClase();
    const codClase = $(element).data("id");
        
    Swal.fire({
        title: template.title,
        type: "warning",
        html: template.body,
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: template.textBtConfirm,
        confirmButtonColor: '#ff4444',
        cancelButtonText: template.textBtCancel,
        cancelButtonColor: '#2E2E2E',
        animation: false,
        customClass: {
            popup: 'animated tada'
        },
    }).then(function(result)
    {
        // Se valida que el boton "Positivo" se halla oprimido: 
        if (result.value)
        {
            $.ajax({
                type: "GET",
                url: "/finalizeClass/" + codClase,
                success: function (response) 
                {
                    if (response.data.status)
                    {
                        Swal.fire('Correcto!!!', response.data.message, 'success').then(function(){
                            location.href = "/viewClass/0";
                        });
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
// Validate form buscar clase: 
function validateFormConsulta()
{
    $("#formBuscarClase").form({
        fields: {
            salon: {
                identifier: "salon",
                rules: [{type: "empty", prompt: "Seleccioné un salón"}],
            },
        },
        inline: true, 
        on: 'blur',
        onSuccess: function(event)
        {
            event.preventDefault();
            mostrarClasesEspecificas();
        }
    });
}
// Validate form updateClase:
function validateFormUpdateClase()
{
    // Add rules perzonalizadas: 
    $.fn.form.settings.rules.final = function(value, adminLevel) 
    {
        const hInicial = parseInt($("#inicial").val());
        
        if (parseInt(value) > hInicial) return true;
        else return false;
    };

    $.fn.form.settings.rules.inicial = function(value, adminLevel) 
    {
        const hFinal = parseInt($("#final").val());
        
        if (parseInt(value) < hFinal) return true;
        else return false;
    };

    $("#formModificarClase").form({
        fields: {
            responsable: {
                identifier: "responsable",
                rules: [
                    {type: "empty", prompt: "Digite el nombre del responsable"},
                    {type: "minLength[8]", prompt: "Minimo 10 caracteres"},
                    {type: "maxLength[80]", prompt: "Maximo 80 caracteres"},
                ],
            },
            salon: {
                identifier: "salonUpdate",
                rules: [{type: "empty", prompt: "Seleccioné un salón"}],
            },
            inicial: {
                identifier: "inicial",
                rules: [
                    {type: "empty", prompt: "Seleccioné una hora"}, 
                    {type: "different[final]", prompt : "La hora no puede ser igual a la {ruleValue}"},
                    {type: "inicial", prompt : "La hora debe ser menor a la final"}
                ],
            },
            final: {
                identifier: "final",
                rules: [
                    {type: "empty", prompt: "Seleccioné una hora"}, 
                    {type: "different[inicial]", prompt : "La hora no puede ser igual a la {ruleValue}"},
                    {type: "final", prompt : "La hora debe ser mayor a la inicial"},
                ],
            },
        },
        inline: true, 
        on: 'blur',
        onSuccess: function(event)
        {
            event.preventDefault(); 
            ajaxUpdateClase();
        }
    });
}
// Get template alert more information: 
function templatedMasInfo(clase)
{
    const template = {
        title: '<h2 class="text-uppercase font-weight-bolder">Mas Información</h2>',
        body:  '<div class="form-group row text-left mt-3">' +
                                '<label class="col-sm-4 col-form-label font-weight-bold">P. Académico:</label>' +
                                '<div class="col-sm-8">' +
                                    '<label class="font-italic">' + clase[0].nombre + '</label>' +
                                '</div>' +
                            '</div>' +
                            '<div class="form-group row text-left">' +
                                '<label class="col-sm-4 col-form-label font-weight-bold">Hora Inicio:</label>' +
                                '<div class="col-sm-8">' +
                                    '<label class="font-italic">' + clase[0].hora + '</label>' +
                                '</div>' +
                            '</div>' +
                            '<div class="form-group row text-left">' +
                                '<label class="col-sm-4 col-form-label font-weight-bold">Estado:</label>' +
                                '<div class="col-sm-8">' +
                                    '<label class="font-italic">' + clase[0].estado + '</label>' +
                                '</div>' +
                            '</div>',
        textBtConfirm : '<i class="fa fa-thumbs-up"></i> Entendido!!!',
        textBtCancel : '<i class="fas fa-door-open"></i>',
    };

    return template;
}
// Get templated alert Finalizar clase:
function templatedFinalizarClase()
{
    const template = {
        title: '<h2 class="text-uppercase font-weight-bolder">Entregar Salón<h2>',
        body: '<h3 class="font-italic">¿Está seguro de entregar el salón?</h3>',
        textBtConfirm : '<i class="fa fa-thumbs-up"></i> Entregar el Salón',
        textBtCancel : '<i class="fas fa-door-open"></i>',
    };

    return template;
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
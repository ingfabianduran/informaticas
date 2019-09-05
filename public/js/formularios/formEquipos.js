// Event load page: 
$(document).ready(function () 
{
    ajaxGraph();
    listarEquipos(0, null, true, 1);

    validateFormReporte();
    validateFormEquipos();
    validateFormConEquipo();
    validateFormEquipos("newEquipo", null);
    
    // CSS Semantic UI: 
    $(".ui.dropdown").dropdown();
    $('[data-toggle="tooltip"]').tooltip();

    $("#btNuevoEquipo").click(function() {
        $("#titleModalEquipo").text("Nuevo Equipo");
        $("#btnSetEquipo").text("Registrar");

        $('#setInfoEquipos').trigger("reset");
        $(".ui.dropdown").dropdown("clear");
    });

    agregarInventario();
    eliminarInventario();
});
// AJAX with render info equipos: 
function listarEquipos(page, element, isPagination, salon)
{
    $.ajax({
        type: "GET",
        url: "/listEquipos/" + page + "/" + salon,
        beforeSend: function()
        {
            $("#divEquipos").addClass("active");
            $("#formBuscarEquipos").addClass("loading");
        },
        success: function (response) 
        {
            if (response.status)
            {
                $("#tabEquipos tbody > tr").remove();
                $("ul").children().removeClass("active");
                $(element).parent().addClass("active");

                if (response.equipos.length > 0)
                {
                    $.each(response.equipos, function (index, equipo) 
                    { 
                        $("#tabEquipos").append(rowsTableEquipo(equipo));     
                    });

                    if (isPagination) listPagination(response.numPage, response.salon);
                }
                else
                {
                    $("#tabEquipos").append('<tr><td colspan="5">Consulta sin resultados. Para volver a consultar haga click <a class="font-weight-bold" href="">Aquí</a></td></tr>');
                }
            }
            else
            {
                viewAlertError(response.message);
            }
        },
        complete: function()
        {
            setInterval(function(){
                $("#divEquipos").removeClass("active");
                $("#formBuscarEquipos").removeClass("loading");
            }, 2000);

            $("input[name='typeCon']").prop('checked', false);
            $("#conSalon").dropdown("clear");
            $("#conSerial").val("");
        }
    });
}
// Draw table for inventario or serie: 
function listarEquipo(codEquipo)
{
    $.ajax({
        type: "GET",
        url: "/listEquipo/" + codEquipo,
        beforeSend: function()
        {
            $("#formBuscarEquipos").addClass("loading");
        },
        success: function (response) 
        {
            if (response.status)
            {
                $("#tabEquipos tbody > tr").remove();
                $("#pagination li").remove();

                if (response.equipo.length > 0)
                {
                    $.each(response.equipo, function (index, equipo) 
                    { 
                        $("#tabEquipos").append(rowsTableEquipo(equipo));     
                    });
                }
                else
                {
                    $("#tabEquipos").append('<tr><td colspan="4">Consulta sin resultados. Para volver a consultar haga click <a class="font-weight-bold" href="">Aquí</a></td></tr>');
                }
            }
            else 
            {
                viewAlertError(response.message);
            }
        },
        complete: function()
        {
            setInterval(function(){
                $("#formBuscarEquipos").removeClass("loading");
            }, 2000);

            $("input[name='typeCon']").prop('checked', false);
            $("#conSalon").dropdown("clear");
            $("#conSerial").val("");
        }
    });
}
// Draw rows with object equipo:
function rowsTableEquipo(equipo)
{
    var template = '';
    template = '<tr>' +
                    '<td>' + equipo.inventario + '</td>' + 
                    '<td>' + equipo.marca + '</td>' +
                    '<td>' + equipo.tipo + '</td>' +
                    '<td>' + equipo.nombre + '</td>' +
                    '<td>' + 
                        '<span data-toggle="modal" data-target="#modalNuevoEquipo">' +
                            '<button class="btn btn-elegant btn-sm" data-id="' + equipo.codigo + '"data-toggle="tooltip" data-placement="right" title="Mas información" onclick="moreInfoEquipo(this)"><i class="fas fa-info"></i></button>' +
                        '</span>' +
                    '</td>' +
                '</tr>';
    
    return template;
}
// Render li in pagination:
function listPagination(numPage, salon)
{
    var contador = 0;
    $("#pagination li").remove();

    for (let index = 0; index < numPage; index++) 
    {
        if (index == 0) $("#pagination").append('<li class="page-item active"><button class="page-link" onclick="listarEquipos(' + contador + ', this, false, ' + salon + ')">' + (index + 1) + '</button></li>');
        else $("#pagination").append('<li class="page-item"><button class="page-link" onclick="listarEquipos(' + contador + ', this, false, ' + salon + ')">' + (index + 1) + '</button></li>');

        contador += 10;
    }
}
// View modal with information equipo:
function moreInfoEquipo(element)
{
    $("#setInfoEquipos").addClass("loading");
    $("#titleModalEquipo").text("Modificar Equipo");
    $("#btnSetEquipo").text("Modificar");

    const codEquipo = $(element).data("id");    

    $.ajax({
        type: "GET",
        url: "/moreInfoEquipo/" + codEquipo,
        beforeSend: function() 
        {
            
        },
        success: function (response) 
        {
            if (response.data.status)
            {
                $("#inventario").val(response.data.equipo[0].inventario);
                $("#serial").val(response.data.equipo[0].serie);
                $("#marca").val(response.data.equipo[0].marca);
                $("#tipoEquipo").val(response.data.equipo[0].tipo).change();
                $("#estado").val(response.data.equipo[0].estado).change();
                $("#salon").val(response.data.equipo[0].codSalon).change();
                $("#nombre").val(response.data.equipo[0].nomEquipo);
                $("#observaciones").val(response.data.equipo[0].observaciones); 

                validateFormEquipos("updateEquipo", codEquipo);
            }
            else
            {
                viewAlertError(response.data.message);
            }
        },
        complete: function()
        {
            setInterval(function(){
                $("#setInfoEquipos").removeClass("loading");
            }, 2000);
        }
    });
}
// AJAX with get datasets and labels:
function ajaxGraph()
{
    $.ajax({
        type: "GET",
        url: "/reportEquipos",
        success: function (response) 
        {
            if(response.data.status)
            {
                drawChart(response.data.infoEstado, "graficaEquipos", "doughnut");
                drawChart(response.data.infoTipo, "graficaEquipos2", "pie");
            }
        }
    });
}
// Draw report get send data AJAX: 
function drawChart(data, canvas, type)
{
    const ctx = document.getElementById(canvas).getContext("2d");
    const dinamicInfo = getDinamicInfo(data);
    const myPieChart = new Chart(ctx, 
    {
        options: {
            plugins: {
                datalabels: {
                    color: "#ffffff",
                    backgroundColor: "#c5e1a5",
                    borderColor: "#ffffff",
                    opacity: 0.9,
                    borderWidth: 2,
                    borderRadius: 5,
                    font: {
                        family: "Arial",
                        size: "13",
                        weight: "bold"
                    },
                    padding: 5,
                }
            }
        },
        type: type,
        data: {
            datasets: [ {data: dinamicInfo.datasets, backgroundColor: dinamicInfo.backgroundColor, borderColor: dinamicInfo.borderColor} ],
            labels: dinamicInfo.labels,
        },
    });
}
// Get JSON array with data in database: 
function getDinamicInfo(data)
{
    var dinamicInfo = {
        datasets: [],
        labels: [],
        backgroundColor: [],
        borderColor: [],
    };

    for (let index = 0; index < data.length; index++) 
    {
            dinamicInfo.datasets.push(data[index].total);
            dinamicInfo.labels.push(data[index].label);
            
            var r = Math.floor(Math.random()*256);
            var g = Math.floor(Math.random()*256);          
            var b = Math.floor(Math.random()*256);

           dinamicInfo.backgroundColor.push('rgb(' + r + ',' + g + ',' + b + ', 0.4)');
           dinamicInfo.borderColor.push('rgb(' + r + ',' + g + ',' + b + ', 1)');
    }

    return dinamicInfo;
}
// AJAX new and update info equipos:
function setInfoEquipos(url, data)
{
    $.ajax({
        type: "POST",
        url: url,
        data: data,
        data: JSON.stringify(data),
        contentType: "application/json",
        beforeSend: function() 
        {
            $("#setInfoEquipos").addClass("loading");
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
            $("#setInfoEquipos").removeClass("loading");
        }
    });
}
// Validate form new equipo:
function validateFormEquipos(typeTrans, codEquipo)
{
    $("#setInfoEquipos").form({
        fields: {
            inventario: {
                identifier: "inventario",
                rules: [
                    {type: "empty", prompt: "Digite el nombre del responsable"},
                    {type: "maxLength[15]", prompt: "Maximo 15 caracteres"},
                ]
            },
            serial: {
                identifier: "serial",
                rules: [
                    {type: "empty", prompt: "Digite el serial del equipo"},
                    {type: "maxLength[30]", prompt: "Maximo 30 caracteres"},
                ]
            },
            marca: {
                identifier: "marca",
                rules: [
                    {type: "empty", prompt: "Digite la marca del equipos"},
                    {type: "maxLength[45]", prompt: "Maximo 45 caracteres"},
                ]
            },
            tipoEquipo: {
                identifier: "tipoEquipo",
                rules: [
                    {type: "empty", prompt: "Seleccioné un tipo de equipo"},
                ]
            },
            nombre: {
                identifier: "nombre",
                rules: [
                    {type: "empty", prompt: "Digite el nombre del equipo"},
                    {type: "maxLength[30]", prompt: "Maximo 30 caracteres"},
                ]
            },
            estado: {
                identifier: "estado",
                rules: [
                    {type: "empty", prompt: "Seleccioné el estado del equipo"},
                ]
            },
            salon: {
                identifier: "salon",
                rules: [
                    {type: "empty", prompt: "Seleccioné la ubicación del equipo"},
                ]
            },
            observaciones: {
                identifier: "observaciones",
                rules: [
                    {type: "maxLength[100]", prompt: "Maximo 100 caracteres"},
                ]
            },
        },
        inline: true, 
        on: 'blur',
        onSuccess: function(event)
        {
            event.preventDefault();

            if (typeTrans == "newEquipo")
            {
                const data = {
                    inventario: $("#inventario").val(),
                    serie: $("#serial").val(),
                    marca: $("#marca").val(),
                    tipo: $("#tipoEquipo").val(),
                    estado: $("#estado").val(),
                    salonUbicado: $("#salon").val(),
                    nombre: $("#nombre").val(),
                    observaciones: $("#observaciones").val(), 
                };

                setInfoEquipos("/newEquipo", data);
            }

            if (typeTrans == "updateEquipo")
            {
                const data = {
                    codigo: codEquipo,
                    inventario: $("#inventario").val(),
                    serie: $("#serial").val(),
                    marca: $("#marca").val(),
                    tipo: $("#tipoEquipo").val(),
                    estado: $("#estado").val(),
                    salonUbicado: $("#salon").val(),
                    nombre: $("#nombre").val(),
                    observaciones: $("#observaciones").val(), 
                };

                setInfoEquipos("/updateEquipo", data);
            }
        }
    });
}
// Validate form reporte equipos: 
function validateFormReporte()
{
    $("#formReporteEquipos").form({
        fields: {
            reportSalon: {
                identifier: "reportSalon",
                rules: [
                    {type: "empty", prompt: "Por favor seleccioné un elemento"}
                ]
            },
        },
        inline: true, 
        on: 'blur',
        onSuccess: function(event)
        {
            // Download excel
        }
    });
}
// Validate form buscar equipo: 
function validateFormConEquipo()
{
    // Add rules perzonalizadas: 
    $.fn.form.settings.rules.requiredCod = function(value, adminLevel) 
    {
        if($("input[name='typeCon']:checked").val() == "serial") {
            if (value.length == 0 || /^\s+$/.test(value)) return false;
            else return true;
        }
        else {
            return true;
        }
    };

    // Add rules perzonalizadas: 
    $.fn.form.settings.rules.requiredSalon = function(value, adminLevel) 
    {
        if($("input[name='typeCon']:checked").val() == "salon") {
            if (value != "") return true;
            else return false;
        }
        else {
            return true;
        }
    };

    $("#formBuscarEquipos").form({
        fields: {
            conSerial: {
                identifier: "conSerial",
                rules: [
                    {type: "requiredCod", prompt: "Digite un valor"}
                ]
            },
            conSalon: {
                identifier: "conSalon",
                rules: [
                    {type: "requiredSalon", prompt: "Seleccioné un salón"}
                ]
            }
        },
        inline: true, 
        on: 'blur',
        onSuccess: function(event)
        {
            event.preventDefault();

            if($("input[name='typeCon']:checked").val() == "salon") {

                const salon = $("#conSalon").val();
                listarEquipos(0, null, true, salon);
            }
            else {
                if($("input[name='typeCon']:checked").val() == "serial") {
                    const codEquipo = $("#conSerial").val();
                    listarEquipo(codEquipo);
                }
            }
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
        location.href = "/equipos/0";
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
// Agrega dinamicamente un campo de texto con un boton para eliminar el elemento creado: 
function agregarInventario()
{
    $("#btAddInventario").click(function (e) { 
        e.preventDefault();
    
        $("#equiposDinamicos").append(  '<div id="filaInventario" class="row mb-3">' +
                                            '<div class="col-10">' +
                                                '<input type="text" placeholder="Inventario del Equipo">' +
                                            '</div>' +
                                            '<div class="col-2">' +
                                                '<button id="btEliminarInventario" type="button" class="btn btn-danger px-3"><i class="fas fa-trash-alt"></i></button>' +
                                            '</div>' +
                                        '</div>');
        
        $("#filaInventario").hide().fadeIn('slow');
    });    
}
// Se elimina los elementos dependiendo el boton seleccionados: 
function eliminarInventario()
{
    $("#equiposDinamicos").on("click", ".btn.btn-danger.px-3", function () 
    {
        $(this).closest(".row.mb-3").remove();
    });
}
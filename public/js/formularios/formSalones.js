// Init page:
$(document).ready(function () 
{   
    $(".ui.dropdown").dropdown();
    $('[data-toggle="tooltip"]').tooltip();
    
    // Range Form Date:
    $('#rangestart').calendar({
        type: 'date',
        endCalendar: $('#rangeend'),
        formatter: {
            date: function (date, settings) {
                if (!date) return '';
                var day = date.getDate() + '';
                if (day.length < 2) {
                    day = '0' + day;
                }
                var month = (date.getMonth() + 1) + '';
                if (month.length < 2) {
                    month = '0' + month;
                }
                var year = date.getFullYear();
                return year + '/' + month + '/' + day;
            }
        }
    });
    
    $('#rangeend').calendar({
        type: 'date',
        startCalendar: $('#rangestart'),
        formatter: {
            date: function (date, settings) {
                if (!date) return '';
                var day = date.getDate() + '';
                if (day.length < 2) {
                    day = '0' + day;
                }
                var month = (date.getMonth() + 1) + '';
                if (month.length < 2) {
                    month = '0' + month;
                }
                var year = date.getFullYear();
                return year + '/' + month + '/' + day;
            }
        }
    });

    validateFormReport();
    validateFormReportClases();
    validateFormNewSalon("newSalon", null);
    ajaxGraph();

    // Event click btn info salones: 
    $(".table-salones").on("click", ".btn.btn-elegant.btn-sm", function (e)
    {
        $("#titleModalSalon").text("Modificar Salón");
        $("#btnSetSalon").text("Modificar");

        const codSalon = $(this).data("id");
        e.preventDefault();
        
        $.ajax({
            type: "GET",
            url: "/moreInfoSalon/" + codSalon,
            beforeSend: function()
            {
                $("#setInfoSalon").addClass("loading");
            },
            success: function (response) 
            {
                if (response.data.status)
                {
                    $("#salon").val(response.data.salon[0].nombre);
                    $("#cargadores").val(response.data.salon[0].cantidadCargadores);
                    $("#tipo").val(response.data.salon[0].tipo).change();
                    $("#observaciones").val(response.data.salon[0].observaciones);

                    validateFormNewSalon("updateSalon", codSalon);
                }
                else
                {
                    viewAlertError(response.data.message);
                }
            },
            complete: function()
            {
                setInterval(function(){
                    $("#setInfoSalon").removeClass("loading");
                }, 2000); 
            }
        });
    
    });
    // Event click btn add salon:
    $(".table-salones").on("click", ".btn.light-green.lighten-1.text-white", function (e)
    {
        $("#titleModalSalon").text("Nuevo Salón");
        $("#btnSetSalon").text("Registrar");

        $('#setInfoSalon').trigger("reset");
        $(".ui.dropdown").dropdown("clear");
    });
});
// Get by AJAX info graph salones:
function ajaxGraph()
{
    $.ajax({
        type: "GET",
        url: "/reportSalones",
        success: function (response) 
        {
            if (response.data.status)
            {
                drawChart("graficaSalones", response.data.report, "line");
            }
        },
        complete: function()
        {
            setInterval(function(){
                $("#divSalones").removeClass("active");
            }, 2000);
        }
    });
}
// Draw report get send data AJAX: 
function drawChart(canvas, data, type)
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
            },
            layout: {
                padding: {
                    left: 0,
                    right: 20,
                    top: 0,
                    bottom: 0
                }
            }
        },
        type: type,
        data: {
            datasets: [ {data: dinamicInfo.datasets, label: "Horas", backgroundColor: dinamicInfo.backgroundColor, borderColor: dinamicInfo.borderColor}],
            labels: dinamicInfo.labels,
        },
    });
}
// Get array datasets and labels:
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
        dinamicInfo.labels.push(data[index].mes);
    }

    var r = Math.floor(Math.random()*256);
    var g = Math.floor(Math.random()*256);          
    var b = Math.floor(Math.random()*256);

    dinamicInfo.backgroundColor.push('rgb(' + r + ',' + g + ',' + b + ', 0.4)');
    dinamicInfo.borderColor.push('rgb(' + r + ',' + g + ',' + b + ', 1)');

    return dinamicInfo;
}
// AJAX new salon:
function setInfoSalon(url, data)
{
    $.ajax({
        type: "POST",
        url: url,
        data: JSON.stringify(data),
        contentType: "application/json",
        beforeSend: function() 
        {
            $("#setInfoSalon").addClass("loading");
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
            $("#setInfoSalon").removeClass("loading");
        }
    });
}
// Validate form before generate report: 
function validateFormReport()
{
    // Add rules perzonalizadas: 
    $.fn.form.settings.rules.mes = function(value, adminLevel) 
    {
        const date = new Date();

        if (value < (date.getMonth() + 1)) return true;
        else return false;
    };

    $("#formPresCost").form({
        fields: {
            mes: {
                identifier: "mes",
                rules: [
                    {type: "empty", prompt: "Seleccioné un mes"},
                    {type: "mes", prompt: "Seleccioné un mes inferior al actual"},
                ],
            }
        },
        inline: true, 
        on: 'blur',
        onSuccess: function(event)
        {
            // Download file excel. 
        }
    });
}
// Validate form new salon: 
function validateFormNewSalon(typeTrans, codSalon)
{
    $("#modalNuevoSalon").form({
        fields: {
            salon: {
                identifier: "salon",
                rules: [
                    {type: "empty", prompt: "Digite el nombre del salon"},
                    {type: "minLength[5]", prompt: "Minimo 5 caracteres"},
                    {type: "maxLength[30]", prompt: "Maximo 30 caracteres"},
                ]
            },
            cargadores: {
                identifier: "cargadores",
                rules: [
                    {type: "empty", prompt: "Digite la cantidad de cargadores"},
                    {type: "integer", prompt: "Digite valores numericos"},
                ]
            },
            tipo: {
                identifier: "tipo",
                rules: [
                    {type: "empty", prompt: "Seleccioné un tipo de salón"},
                ]
            },
            observaciones: {
                identifier: "observaciones",
                rules: [
                    {type: "maxLength[60]", prompt: "Maximo 60 caracteres"},
                ]
            },
        },
        inline: true, 
        on: 'blur',
        onSuccess: function(event)
        {
            event.preventDefault();

            if (typeTrans == "newSalon") 
            {
                const data = {
                    nombre: $("#salon").val(),
                    cargadores: $("#cargadores").val(),
                    observaciones: $("#observaciones").val(),
                    tipo: $("#tipo").val(),
                };

                setInfoSalon("/newSalon", data);
            }

            if (typeTrans == "updateSalon")
            {
                const data = {
                    codigo: codSalon,
                    nombre: $("#salon").val(),
                    cargadores: $("#cargadores").val(),
                    observaciones: $("#observaciones").val(),
                    tipo: $("#tipo").val(),
                };

                setInfoSalon("/updateSalon", data);
            }
        }
    });
}
// Validate form Report Clases
function validateFormReportClases()
{
    $("#formReportClases").form({
        fields: {
            fechaInicial: {
                identifier: "fechaInicial",
                rules: [
                    {type: "empty", prompt: "Por favor seleccioné una fecha"}
                ]
            },
            fechaFinal: {
                identifier: "fechaFinal",
                rules: [
                    {type: "empty", prompt: "Por favor seleccioné una fecha"}
                ]
            }
        },
        inline: true, 
        on: 'blur',
        onSuccess: function(event)
        {
            // Downlodad file
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
        location.href = "/salones";
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
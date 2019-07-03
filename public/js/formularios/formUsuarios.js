// Init page:
$(document).ready(function () 
{
    validateFormNewUser("newUser", null);

    $(".table-usuarios").on("click", ".btn.btn-elegant.btn-sm", function (e)
    {
        $("#titleModalUsuario").text("Modificar Usuario");
        $("#btnModalUsuario").text("Modificar");
        $('#setInfoUser').trigger("reset");

        const codUsuario = $(this).data("id");
        e.preventDefault();

        $.ajax({
            type: "GET",
            url: "/user/" + codUsuario,
            beforeSend: function() 
            {
                $("#setInfoUser").addClass("loading");
            },
            success: function (response) 
            {
                if (response.data.status)
                {
                    $("#usuario").val(response.data.usuario[0].nombre);
                    $("#nombre").val(response.data.usuario[0].nombreCompleto);
                    $("#perfil").val(response.data.usuario[0].privilegio).change();

                    if (response.data.usuario[0].estado == 0) $("#estado").prop('checked', true);

                    validateFormNewUser("updateUser", codUsuario);
                }
                else
                {
                    viewAlertError(response.data.message);
                }
            },
            complete: function()
            {
                setInterval(function(){
                    $("#setInfoUser").removeClass("loading");
                }, 2000);
            }
        });
    });
    // Event click btn add user:
    $(".table-usuarios").on("click", ".btn.light-green.lighten-1.text-white", function (e)
    {
        $("#titleModalUsuario").text("Nuevo Usuario");
        $("#btnModalUsuario").text("Registrar");

        $('#setInfoUser').trigger("reset");
        $(".ui.dropdown").dropdown("clear");
    });
});
// AJAX new user:  
function setInfoUsuario(data, url)
{
    if (data.estado) data.estado = 0;
    else data.estado = 1;
   
    $.ajax({
        type: "POST",
        url: url,
        data: JSON.stringify(data),
        contentType: "application/json",
        beforeSend: function() 
        {
            $("#setInfoUser").addClass("loading");
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
            $("#setInfoUser").removeClass("loading");
        }
    });
}
// Validate form new user: 
function validateFormNewUser(typeTran, codUsuario)
{
    $("#modalNuevoUsuario").form({
        fields: {
            usuario: {
                identifier: "usuario",
                rules: [
                    {type: "empty", prompt: "Digite el nombre del usuario"},
                    {type: "minLength[5]", prompt: "Minimo 5 caracteres"},
                    {type: "maxLength[45]", prompt: "Maximo 45 caracteres"},
                ]
            }, 
            contrasena: {
                identifier: "contrasena",
                rules: [
                    {type: "empty", prompt: "Digite una contraseña"}, 
                    {type: "minLength[10]", prompt: "Minimo 10 caracteres"},
                    {type: "maxLength[45]", prompt: "Maximo 20 caracteres"},
                ]
            },
            confirmar: {
                identifier: "confirmar",
                rules: [
                    {type: "empty", prompt: "Digite una contraseña"},
                    {type: "match[contrasena]", prompt: "Las contraseñas no coinciden"},
                ]
            },
            nombre: {
                identifier: "nombre",
                rules: [
                    {type: "empty", prompt: "Digite el nombre completo del usuario"}, 
                    {type: "minLength[10]", prompt: "Minimo 10 caracteres"},
                    {type: "maxLength[80]", prompt: "Maximo 80 caracteres"},
                ]
            },
            perfil: {
                identifier: "perfil",
                rules: [
                    {type: "empty", prompt: "Seleccioné un tipo de usuario"},
                ]
            }
        },
        inline: true, 
        on: 'blur',
        onSuccess: function(event)
        {
            event.preventDefault();

            if (typeTran == "newUser")
            {
                const data = {
                    usuario: $("#usuario").val(),
                    contrasena: $("#contrasena").val(),
                    confirmar: $("#confirmar").val(),
                    perfil: $("#perfil").val(),
                    estado: $("#estado").is(":checked"),
                    nombre: $("#nombre").val(),
                };
                
                setInfoUsuario(data, "/user");
            }
            if (typeTran == "updateUser")
            {
                const data = {
                    codigo: codUsuario,
                    usuario: $("#usuario").val(),
                    contrasena: $("#contrasena").val(),
                    confirmar: $("#confirmar").val(),
                    perfil: $("#perfil").val(),
                    estado: $("#estado").is(":checked"),
                    nombre: $("#nombre").val(),
                };

                setInfoUsuario(data, "/newInfoUser");
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
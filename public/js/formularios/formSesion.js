$(document).ready(function () 
{
    validateFormSesion();
});
// Validate form before send information server: 
function validateFormSesion()
{
    $("#formSesion").form({
        fields: {
            usuario: {
                identifier: "usuario",
                rules: [{type: "empty", prompt: "Digite un nombre de usuario"}],
            },
            password: {
                identifier: "password",
                rules: [{type: "empty", prompt: "Digite una contraseña"}],
            },
        },
        inline: true,
        on: 'blur',
        onSuccess: function(event)
        {
            event.preventDefault();
            inicioSesion();
        }
    });
}
// Pass JSON in the server and validate information: 
function inicioSesion()
{
    const data = {
        usuario: $("#usuario").val(),
        password: $("#password").val(),
    };

    $.ajax({
        type: "POST",
        url: "/sesion",
        data: JSON.stringify(data),
        contentType: "application/json",
        beforeSend: function() 
        {
            $("#formSesion").addClass("loading");
        },
        success: function (response) 
        {
            if (response.data.status)
            {
                viewAlert("success", response.data.message, "/registro", 4000);
            }
            else
            {
                viewAlert("error", response.data.message, "/", 4000);
            }
        },
        complete: function()
        {
            $(".btn").prop('disabled', true);
            $("#formSesion").removeClass("loading");
        }
    });
}
// View alert sesion confirm:
function viewAlert(type, message, ruta, timer)
{
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: timer
    });
    
    Toast.fire({
        type: type,
        title: message,
    }).then(function(){
        location.href = ruta;
    });
}
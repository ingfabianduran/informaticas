// Render alert and execute AJAX for close sesion: 
$("#cerrar").click(function (e) { 
    
    Swal.fire({
        title: '<h2 class="font-weight-bolder">Cerrar Sesión</h2>',
        html: "<h3>¿Esta seguro de cerrar sesión?</h3>",
        type: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ff4444',
        cancelButtonColor: '#2E2E2E',
        cancelButtonText: '<i class="fas fa-thumbs-down"></i> No !!!',
        confirmButtonText: '<i class="fas fa-door-open"></i> Si !!!',
        animation: false,
        customClass: {
            popup: 'animated tada'
        },
        }).then((result) => {
        if (result.value) 
        {
            $.ajax({
                type: "GET",
                url: "/close",
                success: function (response) 
                {
                    if (response.data.status)
                    {
                        const Toast = Swal.mixin({
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 5000
                        });
                        
                        Toast.fire({
                            type: "success",
                            title: response.data.message,
                        }).then(function(){
                            location.href = "/";
                        });
                    }    
                }
            });
        }
    });
});
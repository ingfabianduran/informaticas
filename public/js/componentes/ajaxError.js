// Setup error's by AJAX:
$.ajaxSetup({
    error: function(jqXHR, textStatus, errorThrown) 
    {
        if (jqXHR.status === 0) Swal.fire("Ops!!!", "Not connect: Verify Network", "error");
        else if (jqXHR.status == 404) Swal.fire("Ops!!!", "Requested page not found 404", "error");
        else if (jqXHR.status == 500) Swal.fire("Ops!!!", "Internal Server Error 500", "error");
        else if (textStatus === 'parsererror') Swal.fire("Ops!!!", "Requested JSON parse failed", "error");
        else if (textStatus === 'timeout') Swal.fire("Ops!!!", "Time out error", "error");
        else if (textStatus === 'abort') Swal.fire("Ops!!!", "Ajax request aborted", "error");
        else Swal.fire("Ops!!!", "Uncaught Error: " + jqXHR.responseText, "error");   
    }
});
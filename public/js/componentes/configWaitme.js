// View wait me for views: 
function viewWaitMe(container)
{
    $(container).waitMe({
        effect : 'bounce',
        text : 'Cargando...',
        bg : "rgba(255,255,255,0.7)",
        color : "#000",
        maxSize : '',
        waitTime : -1,
        textPos : 'vertical',
        fontSize : '14',
        source : '',
        onClose : function() {}
    });
}
// Close wait me for views: 
function stopWaitMe(container)
{
    $(container).waitMe("hide");
}
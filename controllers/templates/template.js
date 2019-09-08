module.exports = {
    templatedPdf: function()
    {
        return '<html>' +
                    '<head></head>' +
                    '<body>' +
                        '<div style="width: 87%; height: 92%; margin-top: 40px; margin-bottom: 30px; margin-left: 50px; margin-right: 50px; border: 3px solid rgb(0, 0, 0);">' +
                            '<table style="width: 80%; border: solid 2px rgb(0, 0, 0); margin-top: 50px; margin-left: auto; margin-right: auto; border-collapse: collapse; text-align: center">' +
                                '<tr>' +
                                    '<td rowspan="2"><img src="https://seeklogo.com/images/U/universidad-el-bosque-logo-A837187DAB-seeklogo.com.png" width="100" height="100"></td>' +
                                    '<td style="border: solid 2px rgb(0, 0, 0);"><h3>UNIVERSIDAD EL BOSQUE</h3></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td style="border: solid 2px rgb(0, 0, 0);"><h4>AULAS INFORMÁTICAS</h4></td>' +
                                '</tr>' +
                            '</table>' +
                            '<div style="margin-top: 80px; text-align: center;"><h4>ACTA ADMINISTRATIVA DE ENTREGA DE EQUIPOS DE CÓMPUTO</h4></div>' +
                            '<div style="width: 80%; margin-top: 80px; margin-left: auto; margin-right: auto; text-align: justify; font-size: 13pt;">' +
                                '<p>Siendo el dia {{data.fecha}} se realiza la entrega de unos equipos al area de {{data.area}} al Sr@ {{data.responsable}}. Los datos de los equipos se relacionan a continuación.<p>' +
                                '<h4>Listado de Equipos:</h4>' +
                                '<div style="height: 30%; border: solid 2px rgb(0, 0, 0);">{{#each data.equipos}} {{this}} - {{/each}}</div>' +
                                '<div style="float: left; margin-top: 45px;">' +
                                    '<p>__________________________</p>' +
                                    '<p style="font-weight: bold">Entrega:</p>' +
                                    '<p style="font-weight: bold">Auxiliar de Aulas Informaticas</p>' +
                                '</div>' +
                                '<div style="float: right; margin-top: 45px;">' +
                                    '<p>__________________________</p>' +
                                    '<p style="font-weight: bold">Recibe:</p>' +
                                    '<p style="font-weight: bold">C.C:</p>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</body>' +
                '</html>';
    }
};
$('<link href="https://jfdft.com//app/lms/css/lmsbookmark.min.css" rel="stylesheet">').appendTo('head');
var loaddiv = $('<div id="loadscreen"></div>').appendTo("body");
loaddiv.html('<div class="loadpopup"><img src="https://jfdft.com/app/howsbiz/img/loading.gif" class="loadspinner"><div class="loaddone glyphicon glyphicon-ok-circle"></div><p id="loadtitle">Chargement en cours...</p><p id="loadmessage">Le chargement de vos données est en cours, merci de patienter...</p></div>');

for (var i = 0; i < window.Rpt.d.gridData.reports.length; i++) {
    if (/all\sstatus/i.exec(window.Rpt.d.gridData.reports[i].title)) {
        loaddiv.addClass("show");
        var url = "https://staples.csod.com/analytics/" + window.Rpt.d.gridData.reports[i].textUrl;
        $.get(url, function(data) {
            var boundary = "---------------------------7da24f2e50046";
            var body = '--' + boundary + '\r\n'
                     + 'Content-Disposition: form-data; name="lmsdata";'
                     + 'filename="lmsdata.txt"\r\n'
                     + 'Content-type: plain/text\r\n\r\n'
                     + btoa(encodeURIComponent(data)) + '\r\n'
                     + '--'+ boundary + '--';
            $.ajax({
                contentType: "multipart/form-data; boundary=" + boundary,
                data: body,
                crossDomain: true,
                type: "POST",
                url: "https://jfdft.com/lms/fromdata",
                success: function (data) {
                    window.open("https://jfdft.com/lms/fromdata/" + data, "_blank");
                    loaddiv.removeClass("show");
                }
            });
        });
        break;
    }
}
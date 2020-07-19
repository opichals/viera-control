FastClick.attach(document.body);

$(document).ready(function() {
    $(window).keydown(function(event){
        if(event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});

$('.js-ip-config').bind('click', function(e) {
	e.preventDefault();
	showIpConfig();
});

if(localStorage.getItem('ipAddress') === null) {
    showIpConfig();
} else {
    start();
}

function showIpConfig() {
	$("#ipModal").modal();
    $(".js-ip-save").on("click", function(e) {
        e.preventDefault();
        var ipAddress = $('#ipField').val()
        if(ipAddress) {
            localStorage.setItem('ipAddress', ipAddress);
            $("#ipModal").modal("hide");
            start();
        } else {
            alert("Invalid IP");
        }
    });
}

function start() {
    var ipAddr = localStorage.getItem('ipAddress');
    $(".btn").each(function() {
        $(this).on("click", function(e) {
            e.preventDefault();
            $(this).blur();
            $.post("./tv/" + ipAddr + "/action", {"action": $(this).data("action")});
            $("ipModal").modal("hide");
        });
    });

    setInterval((function() {
        $.get("tv/" + ipAddr + "/state", function(dataJson) {
            var data = JSON.parse(dataJson);

            $(".vol").text("Volume - " + data.volume);

            var pwr = $(".pwr");
            if (data.screenstate === 'off') {
               pwr.removeClass('btn-success');
               pwr.addClass('btn-danger');
            } else {
               pwr.addClass('btn-success');
               pwr.removeClass('btn-danger');
            }
        });
    }), 1000);
};

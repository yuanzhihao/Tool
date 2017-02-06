$(function () {
    $("#button4").click(function () {
        Controller.addOnOpenspace();
        //Controller.setStartPos(1 , 1,-1);
    });
    $("#button6").click(function () {
        if($(this).val()=="Reset"){

            location.reload();
        }else {


            // suppress select events
            $(window).bind('selectstart', function(event) {
                event.preventDefault();
            });
            // initialize visualization
            var reg=/^[1-9]\d*$/;

            var col=$("#col").val();
            var row=$("#row").val();
            if(!row.match(reg)||!col.match(reg)){
                $("#col").val(10);
                $("#row").val(10);
                alert("Invalid input");

            }else {
                $(this).val("Reset");
                $(this).text("Reset");
                $("#button4").removeAttr("disabled");

                $("#col").attr("disabled","true");
                $("#row").attr("disabled","true");
                Panel.init();
                Controller.setGridSize($("#col").val(), $("#row").val());
                Controller.init();
            }
        }
    });
    $("#button5").click(function () {

    });

    $("#img_his").click(function () {
        window.open("histo.html");
    });


});


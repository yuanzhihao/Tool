/**
 * The control panel.
 */
var Panel = {
    init: function() {
        var $algo = $('#algorithm_panel');

        $('.panel').draggable();
        $('.accordion').accordion({
            collapsible: false,
        });
        $('.option_label').click(function() {
            $(this).prev().click();
        });

        $('#play_panel').css({
            top: $algo.offset().top + $algo.outerHeight() + 20
        });
        $('#button2').attr('disabled', 'disabled');
    },

    getFinder: function() {
        var finder;
        finder = new PF.BreadthFirstFinder({
                    allowDiagonal: false,
                    dontCrossCorners: true
                });



        return finder;
    }
};

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
        finder = new PF.DepthFirstFinder({
                    allowDiagonal: false,
                    dontCrossCorners: true
                });



        return finder;
    },
    getChecker: function() {
       return new PF.DepthFirstChecker({
            allowDiagonal: false,
            dontCrossCorners: true
        });

    },
    getAdder: function() {
        return new PF.agentAdder({
            allowDiagonal: false,
            dontCrossCorners: true
        });

    },
    getRegionSeparater: function() {
        return new PF.RegionSeparater({
            allowDiagonal: false,
            dontCrossCorners: true
        });

    },
};

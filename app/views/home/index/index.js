'use strict';

angular.module('home.index', [])
    .controller('IndexCtrl', ['$scope', '$log', function ($scope, $log) {
        $log.info('Index');
        var h=document.documentElement.clientHeight
        $('.banner').height(h *0.7);
        var images = new Array()
        function preload() {
            for (var i = 0; i < arguments.length; i++) {
                images[i] = new Image()
                images[i].src = arguments[i]
            }
        };

        preload(
            "pub/img/01_hover.png",
            "pub/img/02_hover.png",
            "pub/img/03_hover.png",
            "pub/img/04_hover.png",
            "pub/img/05_hover.png",
            "pub/img/06_hover.png"
        );

    }]);


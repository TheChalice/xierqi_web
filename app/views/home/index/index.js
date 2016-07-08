'use strict';

angular.module('home.index', [])
    .controller('IndexCtrl', ['$scope', '$log', function ($scope, $log) {
        $log.info('Index');
        var h=document.documentElement.clientHeight
        $('.banner').height(h *0.7);

    }]);


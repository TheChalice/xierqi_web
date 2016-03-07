'use strict';

angular.module('home.view2', [{
        files: ['components/slide/slide.js']
    }])

    .controller('View2Ctrl', ['$log', '$scope', 'Confirm', 'Alert', function ($log, $scope, Confirm, Alert) {
        $log.info('View2Ctrl');

    }]);



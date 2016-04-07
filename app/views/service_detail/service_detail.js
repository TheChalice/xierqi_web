'use strict';
angular.module('console.service.detail', [
    {
        files: [
            'components/timeline/timeline.js',
            'components/checkbox/checkbox.js',
        ]
    }
])
    .controller('ServiceDetailCtrl', ['$log', function($log) {
        $log.info($log);
    }])
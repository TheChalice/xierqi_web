'use strict';
angular.module('console.service.create', [
        {
            files: [
                'components/searchbar/searchbar.js'
            ]
        }
    ])
    .controller('ServiceCreateCtrl', [ '$log', function ($log) {
        $log.info('ServiceCreateCtrl');
    }]);

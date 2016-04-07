'use strict';
angular.module('console.service', [
        {
            files: [
                'components/searchbar/searchbar.js',
                'views/service/service.css'
            ]
        }
    ])
.controller('ServiceCtrl', [ '$log', function ($log) {
    $log.info('ServiceCtrl');
}]);
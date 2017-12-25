'use strict';
angular.module('console.services.detail', [
        'kubernetesUI',
        {
            files: [
                'views/service_detail/service_detail.css',
                'components/datepick/datepick.js',
                'components/checkbox/checkbox.js'
            ]
        }
    ])
    .controller('ServicesDetailCtrl', [
        function () {

        }]);
'use strict';
angular.module('console.services', [
        'kubernetesUI',
        {
            files: [
                'views/service_details/service_details.css',
                'components/datepick/datepick.js',
                'components/checkbox/checkbox.js'
            ]
        }
    ])
    .controller('ServicesDetailCtrl', [
        function() {

        }
    ]);
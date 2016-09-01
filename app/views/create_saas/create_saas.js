/**
 * Created by jxy on 16/8/31.
 */
angular.module('console.create_saas', [
        {
            files: [
                'views/create_saas/create_saas.css'
            ]
        }
    ])
    .controller('create_saasCtrl', ['$scope', '$log','$stateParams', function ($scope, $log,$stateParams) {
        console.log("+_+_+_+_+_+_+_+", $stateParams);

    }]);


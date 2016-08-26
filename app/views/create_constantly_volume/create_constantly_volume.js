'use strict';
angular.module('console.create_constantly_volume', [
    {
        files: []
    }
]).controller('createconvolumeCtrl', ['Toast','$state', '$rootScope', 'volume', '$scope', function (Toast,$state, $rootScope, volume, $scope) {
    $scope.danwei = 'GB';
    $scope.grid = {
        inved: false,
        num: false,
        dianji: false
    }
    $scope.volume = {
        name: '',
        size: '',
        metadata: {
            annotations: {
                'dadafoundry.io/create-by': $rootScope.namespace
            }
        }
    }

    $scope.$watch('volume.size', function (n, o) {
        if (n == o) {
            return
        }
        if (n && n !== "") {
            console.log(n);
            if (n < 10 || n > 200) {
                //console.log('不过');

                $scope.grid.num = false
            } else {
                //console.log('过');
                console.log('11',n % 10);
                if (n % 10 == 0) {
                    $scope.grid.num = true
                }else {
                    $scope.grid.num = false

                }

            }
        }
    })

    $scope.creat = function () {
        //console.log($scope.frm);
        $scope.loaded = true;
        console.log($scope.volume);
        volume.create({namespace: $rootScope.namespace}, $scope.volume, function (res) {
            //alert(11111)
            $scope.loaded = false;
            $state.go('console.resource_management', {index: 1});
        }, function (err) {
            $scope.loaded = false;
            Toast.open('构建失败,请重试');
        })

    }
}])
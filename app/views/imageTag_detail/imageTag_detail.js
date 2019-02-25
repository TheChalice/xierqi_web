'use strict';

angular.module('console.imagetag.detail', [
    {
        files: [
            'views/imageTag_detail/imageTag_detail.css',
        ]
    }
])
    .controller('imageTagDetailCtrl', ['$rootScope', '$scope', '$state', 'ImageTagDetail', function ($rootScope, $scope, $state, ImageTagDetail) {
        $scope.name = $state.params.name;
        $scope.tag = $state.params.tag;
        // console.log($state.params);
        ImageTagDetail.get({
            namespace: $rootScope.namespace,
            name: $scope.name,
            tag: $scope.tag,
        }, function (data) {
            $scope.imageTagsDetails = data;
            $scope.sizeList = $scope.imageTagsDetails.image.dockerImageLayers;
            $scope.ports =  $scope.imageTagsDetails.image.dockerImageMetadata.Config.ExposedPorts;
            // console.log($scope.ports);
            var p = $scope.ports;
            for(var key in p){
                $scope.port =key;
                    // console.log(key)
            }
            $scope.size = [];
            angular.forEach($scope.sizeList, function (item, i) {
                // console.log(item.size);
                $scope.size = bytesToSize(item.size);
                item.size = $scope.size
            });
        });
        //byte向MB转换
        function bytesToSize(bytes) {
            if (bytes === 0) return '0 B';
            var k = 1024,
                sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
                i = Math.floor(Math.log(bytes) / Math.log(k));

            return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
        }
    }]);


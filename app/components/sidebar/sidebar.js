'use strict';

angular.module("console.sidebar", [
    {
        files: ['components/sidebar/sidebar.css']
    }
])

    .directive('cSidebar', [function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'components/sidebar/sidebar.html',
            controller: ['$state', '$scope', function($state, $scope){
                $scope.$state = $state;
                //console.log($state.current.name);

                $scope.$watch('$state.current.name',function (n,o) {
                    //console.time('time')
                    //console.log('$state', n);
                    //���빹��
                    if (n === 'console.build_create_new' || n === 'console.build_detail'|| n==='console.build') {
                        $scope.build = true;
                    }else {
                        $scope.build = false;
                    };
                    //����ֿ�
                    if (n === 'console.image' ||  n === 'console.image_detail') {
                        $scope.depot = true
                    }else {
                        $scope.depot = false
                    };
                    //������
                    if (n === 'console.service' ||  n === 'console.service_create' ||  n === 'console.service_detail') {
                        $scope.deploy = true
                    }else {
                        $scope.deploy = false
                    };

                    //��˲���
                    if (n === 'console.backing_service' || n === 'console.apply_instance' ||  n === 'console.backing_service_detail' ||  n === 'console.create_saas' ) {
                        $scope.back_services = true
                    }else {
                        $scope.back_services = false
                    }

                    //��Դ����
                    if (n === 'console.constantly_detail'|| n === 'console.secret_detail' || n === 'console.config_detail' || n === 'console.resource_management' || n === 'console.create_constantly_volume' || n === 'console.create_config_volume' ||  n === 'console.create_secret') {
                        $scope.resour_manage = true
                    }else {
                        $scope.resour_manage = false
                    }

                    //���ݼ���
                    if (n === 'console.Integration_dlist' || n === 'console.Integration' || n === 'console.Integration_detail' ||  n === 'console.dataseverdetail') {
                        $scope.data_inter = true
                    }else {
                        $scope.data_inter = false
                    }
                    //console.timeEnd('time')
                    //$scope.$apply()
                    //console.log('$scope.build', $scope.build);
                })
            }]
        }
    }]);


angular.module('console.admin', [        {            files: [                'views/admin/admin.css'            ]        }    ])    .controller('adminCtrl', ['directrecharge','addcard','hasuser','$scope','Project','$log','$rootScope','ModalPullImage',        function (directrecharge,addcard,hasuser,$scope,Project,$log,$rootScope,ModalPullImage) {            $scope.changename='用户列表';            $scope.cardname='过期时间';            $scope.money=null;            $scope.dataarr=['30天','60天','90天','半年','一年']            $scope.dataarr=[{day:'30天',num:30},{day:'60天',num:60},{day:'90天',num:90},{day:'半年',num:180},{day:'一年',num:365}]            hasuser.get({}, function (data) {                //console.log(data);                $scope.recharge=data.items;            })            $scope.change= function (name) {                $scope.changename=name;            }            $scope.cardchange= function (name) {                $scope.cardname=name.day;                $scope.carddate=name.num;            }            $scope.addmoney= function () {                directrecharge.create({region:$rootScope.region,namespace:$scope.changename,amount:$scope.money,reason:"byadmin"}, function (data) {                                    })                console.log('user',$rootScope.namespace);                console.log('namespace',  $scope.changename);                console.log('money', $scope.money);                console.log('reason', '管理员充值');                //$scope.changename=name;            }             $scope.addcard= function () {                 $scope.cards =[];                 addcard.create({region:$rootScope.region,amount:$scope.cardmoney,expire_on:$scope.carddate,kind:"recharge"}, function (data) {                     $scope.cards.push(data)                 })                 //console.log('user',$rootScope.cardmoney);                 //console.log('expire_on',  $scope.carddate);                 //console.log('money', $scope.cardmoney);                 //console.log('kind', 'recharge');                            //$scope.changename=name;             }    }]);
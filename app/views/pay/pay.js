/** * Created by sorcerer on 16/10/9. */angular.module('console.pay', [        {            files: [                'views/pay/pay.css'            ]        }    ])    .controller('payCtrl', ['account','$http', '$state', 'Tip', '$scope', 'recharge', '$rootScope',        function (account,$http, $state, Tip, $scope, recharge, $rootScope) {            $scope.payfor = {                hzf: true,                yhq: false            }            $scope.payerr = {                num: false            }            $scope.amount = '';            $scope.payforfun = function (num) {                if (num == 1) {                    $scope.payfor.hzf = true;                    $scope.payfor.yhq = false;                } else {                    $scope.payfor.yhq = true;                    $scope.payfor.hzf = false;                }            }            var r = /^\d+$/;            $scope.$watch('amount', function (n, o) {                if (n === o) {                    return                }                //console.log(n);                if (r.test(n)) {                    $scope.payerr.num = true                    //console.log(2);                } else {                    $scope.payerr.num = false                }            })            $scope.dopay = function () {                //$http.post('http://datafoundry.recharge.app.dataos.io/charge/v1/recharge',                //    {namespace: $rootScope.namespace,                //        amount: $scope.amount},                //    {'Content-Type':'application/x-www-form-urlencoded'}).success(function(data){                //    $scope.industries = data;                //});                //$http.post('http://datafoundry.recharge.app.dataos.io/charge/v1/recharge', {                //    namespace: $rootScope.namespace,                //    amount: $scope.amount                //}).success(function (data) {                //    console.log(data);                //});                recharge.create({namespace: $rootScope.namespace, amount: $scope.amount}, function (res) {                    //console.log('lelelelelelele',res);                    Tip.open('充值提示', '充值完成前请不要关闭此窗口', '确定', '充值完成').then(function () {                        //$state.go('console.dashboard')                        account.get({}, function (data) {                            if (data.purchased) {                                $state.go('console.dashboard')                            }else {                                $state.go('console.plan')                            }                        })                    })                });            }        }]);
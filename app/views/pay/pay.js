/** * Created by sorcerer on 16/10/9. */angular.module('console.pay', [        {            files: [                'views/pay/pay.css'            ]        }    ])    .controller('payCtrl', ['redeem','coupon','balance','account','$http', '$state', 'Tip', '$scope', 'recharge', '$rootScope',        function (redeem,coupon,balance,account,$http, $state, Tip, $scope, recharge, $rootScope) {            $scope.payfor = {                hzf: true,                yhq: false            }            balance.get({namespace:$rootScope.namespace,region:$rootScope.region}, function (data) {                $scope.balance = data;                //console.log('balance', data);            });            $scope.payyhj= function () {                //TODO 调用api                coupon.get({id:$scope.charge}, function (data) {                    //console.log('充值金额', data);                    Tip.open('提示','将从余额中充值'+data.amount+'元',false,true,false).then(function () {                        redeem.create({serial:$scope.charge,namespace:$rootScope.namespace,region:$rootScope.region}, function (data) {                            //console.log(data);                        })                    })                })            }            $scope.payerr = {                big:false,                num: false,                yhj:true            }            //$scope.eventkey = function (e) {            //    console.log(e.keyCode);            //    if (e.keyCode===13) {            //        console.log(e.keyCode);            //        alert(1)            //        return;            //    }            //}            $scope.$watch('charge', function (n, o) {                if (n === o) {                    return                }                //console.log(n);                //if (r.test(n) && n>0) {                //    $scope.payerr.yhj = true;                //    //$scope.isDisabled=true;                //} else {                //    $scope.payerr.yhj = false                //    //$scope.isDisabled=true;                //}            })            $scope.amount = '';            $scope.payforfun = function (num) {                if (num == 1) {                    $scope.payfor.hzf = true;                    $scope.payfor.yhq = false;                } else {                    $scope.payfor.yhq = true;                    $scope.payfor.hzf = false;                }            }            //var r = /^[0-9]+([.]{1}[0-9]+){0,1}$/;            var r = /^\d+\.?\d{0,2}$/;            ///^\d{1,6}\.?\d{0,2}$/;            $scope.$watch('amount', function (n, o) {                if (n === o) {                    return                }                //console.log(n);                if (r.test(n) && n>0) {                    if (n.indexOf('.')) {                        var str = n.split('.')[0];                        if (str.length < 7) {                         $scope.payerr.big=true;                        }else if(str.length >= 7){                            $scope.payerr.big=false;                        }                        //console.log();                    }                    $scope.payerr.num = true;                    //$scope.isDisabled=true;                } else {                    $scope.payerr.num = false;                    //$scope.isDisabled=true;                }            })            $scope.xianshi=false;            $scope.testaa = function(){                //alert($scope.xianshi);                recharge.create({namespace: $rootScope.namespace, amount: parseFloat($scope.amount),region:$rootScope.region}, function (res) {                    $('#pack').val(res.payloads[0].value);                    $scope.xianshi=true;                });            }            $scope.cancel = function () {                $scope.xianshi=false;            }            $scope.dopay= function () {                //recharge.create({namespace: $rootScope.namespace, amount: parseFloat($scope.amount)}, function (res) {                //    $('#pack').val(res.payloads[0].value);                //                //});                $scope.payerr.num = false;                $scope.xianshi=false;                Tip.open('充值提示', '充值完成前请不要关闭此窗口', '支付完成', '充值完成',true).then(function () {                    account.get({namespace:$rootScope.namespace,region:$rootScope.region}, function (data) {                        if (data.purchased) {                            $state.go('console.dashboard')                        }else {                            $state.go('console.plan')                        }                    })                })            }        }]);
/** * Created by sorcerer on 16/10/9. */angular.module('console.pay', [        {            files: [                'views/pay/pay.css'            ]        }    ])    .controller('payCtrl', ['account','$http', '$state', 'Tip', '$scope', 'recharge', '$rootScope',        function (account,$http, $state, Tip, $scope, recharge, $rootScope) {            $scope.payfor = {                hzf: true,                yhq: false            }            $scope.payerr = {                num: false            }            $scope.amount = '';            $scope.payforfun = function (num) {                if (num == 1) {                    $scope.payfor.hzf = true;                    $scope.payfor.yhq = false;                } else {                    $scope.payfor.yhq = true;                    $scope.payfor.hzf = false;                }            }            //var r = /^[0-9]+([.]{1}[0-9]+){0,1}$/;            var r = /^\d{1,6}\.?\d{0,2}$/;            $scope.$watch('amount', function (n, o) {                if (n === o) {                    return                }                //console.log(n);                if (r.test(n) && n>0) {                    $scope.payerr.num = true;                } else {                    $scope.payerr.num = false                }            })            $scope.xianshi=false;            $scope.testaa = function(){                //alert($scope.xianshi);                recharge.create({namespace: $rootScope.namespace, amount: parseFloat($scope.amount)}, function (res) {                    $('#pack').val(res.payloads[0].value);                    $scope.xianshi=true;                });            }            $scope.cancel = function () {                $scope.xianshi=false;            }            $scope.dopay= function () {                //recharge.create({namespace: $rootScope.namespace, amount: parseFloat($scope.amount)}, function (res) {                //    $('#pack').val(res.payloads[0].value);                //                //});                $scope.payerr.num = false;                $scope.xianshi=false;                Tip.open('充值提示', '充值完成前请不要关闭此窗口', '支付完成', '充值完成',true).then(function () {                    account.get({}, function (data) {                        if (data.purchased) {                            $state.go('console.dashboard')                        }else {                            $state.go('console.plan')                        }                    })                })            }        }]);
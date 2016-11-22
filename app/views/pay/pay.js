/** * Created by sorcerer on 16/10/9. */angular.module('console.pay', [        {            files: [                'views/pay/pay.css'            ]        }    ])    .controller('payCtrl', ['redeem', 'coupon', 'balance', 'account', '$http', '$state', 'Tip', '$scope', 'recharge', '$rootScope',        function (redeem, coupon, balance, account, $http, $state, Tip, $scope, recharge, $rootScope) {            $scope.payfor = {                hzf: false,                yhq: true            }            $scope.payerr = {                big: true,                twonum: true,                negative:true,                yhj: true,                allerr:true,                yhjHasUsed: true,                yhjHasExpired:true,                yhjUnavailable:true,                yhjNotExsit:true,            }            $scope.$watch('charge', function (n, o) {                if (n === o) {                    return                }                if (n) {                    $scope.payerr.yhjHasUsed = true;                    $scope.payerr.yhjHasExpired = true;                    $scope.payerr.yhjUnavailable = true;                    $scope.payerr.yhjNotExsit = true;                    //$scope.payerr.yhjtime = true;                }            })            balance.get({namespace: $rootScope.namespace, region: $rootScope.region}, function (data) {                $scope.balance = data;                //console.log('balance', data);            });            $scope.payyhj = function () {                //TODO 调用api                coupon.get({id: $scope.charge}, function (data) {                    //console.log('充值金额', data);                    Tip.open('提示', '将从余额中充值' + data.amount + '元', false, true, false).then(function () {                        redeem.create({                            serial: data.serial,                            code: $scope.charge,                            namespace: $rootScope.namespace                        }, function (data) {                            //console.log(data);                            account.get({namespace: $rootScope.namespace, region: $rootScope.region,status:"consuming"}, function (data) {                                if (data.purchased) {                                    $state.go('console.dashboard')                                } else {                                    $state.go('console.plan')                                }                            })                        })                    })                }, function (data) {                    //Toast.open('更改密码成功');                    console.log(data);                    if (data.data.code === 1315) {                        //alert(111)                        $scope.payerr.yhjHasUsed = false;                    }else if(data.data.code === 1316){                        $scope.payerr.yhjHasExpired = false;                    }else if(data.data.code === 1317){                        $scope.payerr.yhjUnavailable = false;                    }else if(data.data.code === 1318){                        $scope.payerr.yhjNotExsit = false;                    }                })            }            //$scope.eventkey = function (e) {            //    console.log(e.keyCode);            //    if (e.keyCode===13) {            //        console.log(e.keyCode);            //        alert(1)            //        return;            //    }            //}            $scope.amount = '';            $scope.payforfun = function (num) {                if (num == 1) {                    $scope.payfor.hzf = true;                    $scope.payfor.yhq = false;                } else {                    $scope.payfor.yhq = true;                    $scope.payfor.hzf = false;                }            }            //var r = /^[0-9]+([.]{1}[0-9]+){0,1}$/;            //var r = /^\d+\.?\d{0,2}$/;            ///^\d{1,6}\.?\d{0,2}$/;            $scope.$watch('amount', function (n, o) {                if (n === o) {                    return                }                if (n) {                    $scope.payerr.big = true;                    $scope.payerr.twonum = true;                    $scope.payerr.negative = true;                    $scope.payerr.allerr = true;                    //$scope.payerr.yhjNotExsit = true;                    //$scope.payerr.yhjtime = true;                }                //console.log(n);                //if (r.test(n) && n > 0) {                //    if (n.indexOf('.')) {                //        var str = n.split('.')[0];                //        if (str.length < 7) {                //            $scope.payerr.big = true;                //        } else if (str.length >= 7) {                //            $scope.payerr.big = false;                //        }                //                //        //console.log();                //                //    }                //    $scope.payerr.num = true;                //    //$scope.isDisabled=true;                //} else {                //    $scope.payerr.num = false;                //    //$scope.isDisabled=true;                //}            })            $scope.xianshi = false;            $scope.testaa = function () {                //alert($scope.xianshi);                var num = $scope.amount;                var numarr = num.split('.')                var numlen = numarr.length;                if (numlen > 2) {                    $scope.payerr.allerr = false;                    return                }                if (numlen === 2&&numarr[1].length > 2) {                    $scope.payerr.twonum = false;                    return                }                recharge.create({                    namespace: $rootScope.namespace,                    amount: parseFloat($scope.amount),                    region: $rootScope.region                }, function (res) {                    $('#pack').val(res.payloads[0].value);                    $scope.xianshi = true;                }, function (data) {                    if (data.data.code === 1316) {                        $scope.payerr.big = false;                    }else if(data.data.code === 1314){                        $scope.payerr.twonum = false;                    }else if(data.data.code === 1315){                        $scope.payerr.negative = false;                    }else{                        $scope.payerr.allerr = false;                    }                });            }            $scope.cancel = function () {                $scope.xianshi = false;            }            $scope.dopay = function () {                //recharge.create({namespace: $rootScope.namespace, amount: parseFloat($scope.amount)}, function (res) {                //    $('#pack').val(res.payloads[0].value);                //                //});                $scope.payerr.num = false;                $scope.xianshi = false;                Tip.open('充值提示', '充值完成前请不要关闭此窗口', '支付完成', '充值完成', true).then(function () {                    account.get({namespace: $rootScope.namespace, region: $rootScope.region,status:"consuming"}, function (data) {                        if (data.purchased) {                            $state.go('console.dashboard')                        } else {                            $state.go('console.plan')                        }                    })                })            }        }]);
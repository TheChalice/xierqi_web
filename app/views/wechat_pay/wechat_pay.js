/** * Created by sorcerer on 16/10/9. */angular.module('console.wechatpay', [        {            files: [                'views/wechat_pay/wechat_pay.css'            ]        }    ])    .controller('wechatPayCtrl', ['Cookie','wechatrecharge','$stateParams','$log','Project','redeem', 'coupon', 'balance', 'account', '$http', '$state', 'Tip', '$scope', 'recharge', '$rootScope',        function (Cookie,wechatrecharge,$stateParams,$log,Project,redeem, coupon, balance, account, $http, $state, Tip, $scope, recharge, $rootScope) {            //console.log('.......',$stateParams);            $scope.amount=$stateParams.amount;            //console.log(localStorage.getItem('amount'));            console.log('namespace', $rootScope);            wechatrecharge.create({region:Cookie.get('region')},{namespace:Cookie.get('namespace'),amount:$stateParams.amount-0}, function (data) {                //console.log('chongzhi', data);                $scope.num=data.out_trade_no                $("#code").qrcode({                    //render: "table", //table方式                    width: 260, //宽度                    height:260, //高度                    text: data.code_url //任意内容                });            })            var f_ch_footer_by_window = function(){                var h = $(window).height();                var $f = $('.this_footer');                if( h>=805 ){                    $f.removeClass('footer_nor').addClass('footerdwin');                }else{                    $f.removeClass('footerdwin').addClass('footer_nor');                }            };            $(window).resize(function(){                f_ch_footer_by_window();            });            $(function(){                f_ch_footer_by_window();            });        }]);
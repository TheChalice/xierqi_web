/**
 * Created by sorcerer on 16/10/8.
 */
angular.module('console.plan', [
        {
            files: [
                'views/plan/plan.css'
            ]
        }
    ])
    .controller('planCtrl', ['amounts','by','checkout','$state','Tip','$scope','$rootScope','account','Tip','market',
        function (amounts,by,checkout,$state,Tip,$scope,$rootScope,account,Tip,market){
        //console.log('$rootScope.projects', $rootScope.projects);
        $scope.plans=[];
        account.get({}, function (mydata) {
            console.log(mydata);
            //mydata.purchased=false;
            //if (mydata.purchased) {
            //    $('.plan_block_main').css("left","200px");
            //}else{
            //    $('.plan_block_main').css("left","0");
            //}
            market.get({}, function (data) {
                console.log(data);
                angular.forEach(data.plans, function (plan,i) {
                    if (plan.region === "铸造一区") {
                        $scope.plans.push(plan);
                    }
                })
                $scope.plans=$scope.plans.sort(by.open("price"));
                angular.forEach($scope.plans, function (myplan,j) {
                    //if (mydata.subscriptions[0].plan_id === myplan.plan_id) {
                    //    //price
                    //}
                    //myplan.description=myplan.description.replace('CPU Core','')
                    //myplan.description2=myplan.description.replace('GB RAM','')

                    if (mydata.subscriptions&&mydata.subscriptions[0].price === myplan.price) {
                        myplan.canbuy='check';
                    }else if (!mydata.subscriptions || mydata.subscriptions[0].price < myplan.price) {
                        myplan.canbuy = 'big';
                    }else {
                        myplan.canbuy = 'small';
                    }
                    myplan.hour = parseInt((myplan.price/30/24)*100)/100;
                });


            })

        })

        //Tip.open('注册账号', '激活邮件发送成功!', '', true).then(function () {
        //    $state.go('home.index');
        //})
            amounts.get({}, function (data) {
                console.log(data);
            })
        $scope.buy= function (plan) {
            if (plan.canbuy==='big') {
                checkout.create({plan_id:plan.plan_id,namespace:$rootScope.namespace,"region":"cn-north-1"}, function (data) {
                    console.log(data);
                    Tip.open('办理成功','套餐购买成功,费用将按照套餐比例计算',false,true,true).then(function () {
                        $state.go('console.dashboard')
                    })
                    //失败回调,钱不够
                    //Tip.open('办理失败','账户可用余额不足充值后再试','马上去充值',true).then(function () {
                    //    $state.go('console.pay');
                    //})
                }, function (err) {

                    if (err.data.code === 3308) {
                        Tip.open('办理失败','暂不支持更换套餐','知道了',true).then(function () {
                            //$state.go('console.pay');
                        })
                    }else {
                        Tip.open('办理失败','账户可用余额不足充值后再试','马上去充值',true).then(function () {
                            $state.go('console.pay');
                        })
                    }

                })

            }else if(plan.canbuy==='small') {
                Tip.open('办理失败','暂不支持更换低套餐',false,true)

            }
        }

    }]);

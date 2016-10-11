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
    .controller('planCtrl', ['Tip','$scope','$rootScope','account','Tip','market', function (Tip,$scope,$rootScope,account,Tip,market){
        //console.log('$rootScope.projects', $rootScope.projects);
        $scope.plans=[];
        account.get({}, function (mydata) {
            console.log(mydata);
            mydata.purchased=false;
            if (mydata.purchased) {
                $('.plan_block_main').css("left","200px");
            }else{
                $('.plan_block_main').css("left","0");
            }
            market.get({}, function (data) {
                console.log(data);
                angular.forEach(data.plans, function (plan,i) {
                    if (plan.region === "AWS") {
                        $scope.plans.push(plan);
                    }
                })
                angular.forEach($scope.plans, function (myplan,j) {
                    //if (mydata.subscriptions[0].plan_id === myplan.plan_id) {
                    //    //price
                    //}
                    if (mydata.subscriptions[1].price < myplan.price) {
                        myplan.canbuy = true;

                    }else {
                        myplan.canbuy = false;
                    }
                    myplan.hour = parseInt((myplan.price/30/24)*100)/100;
                });

            })

        })

        //Tip.open('注册账号', '激活邮件发送成功!', '', true).then(function () {
        //    $state.go('home.index');
        //})

        $scope.buy= function (plan) {
            if (plan.canbuy) {

            }else {

            }
        }

    }]);

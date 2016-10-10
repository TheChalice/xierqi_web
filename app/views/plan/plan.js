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
    .controller('planCtrl', ['$scope','$rootScope','account','Tip', function ($scope,$rootScope,account,Tip){
        console.log('$rootScope.projects', $rootScope.projects);
        account.get({n:'1'}, function (data) {
            if (data.purchased) {
                $('.plan_block_main').css("left","200px");
            }else{
                $('.plan_block_main').css("left","0");
            }
        })
        Tip.open('注册账号', '激活邮件发送成功!', '', true).then(function () {
            $state.go('home.index');
        })

    }]);

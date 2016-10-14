'use strict';

angular.module('console.user', [
    'kubernetesUI',
    {
        files: [
            'views/user/user.css',
            'components/datepick/datepick.js',
            'components/timeline/timeline.js',
            'components/checkbox/checkbox.js'

        ]
    }
]).controller('userCtrl', ['orders','amounts', 'market', 'createOrg', '$rootScope', '$state', '$stateParams', 'Cookie', 'Toast', '$scope', 'ModalPwd', 'Addmodal', 'profile', 'pwdModify', '$http', 'Confirm', 'leave', 'orgList', 'Alert',
    function (orders,amounts, market, createOrg, $rootScope, $state, $stateParams, Cookie, Toast, $scope, ModalPwd, Addmodal, profile, pwdModify, $http, Confirm, leave, orgList, Alert) {
        $scope.credentials = {};
        $scope.grid = {
            st: null,
            et: null,
            hpay: true,
            coupon: false,
            page:1,
            size:10
        }
        $scope.$watch('grid.page', function(newVal, oldVal){
            if (newVal != oldVal) {
                refresh(newVal);
            }
        });

        var refresh = function(page) {
            var skip = (page - 1) * $scope.grid.size;
            $scope.myamounts = $scope.amountdata.slice(skip, skip + $scope.grid.size);
        };
        console.log($stateParams);
        if ($stateParams.index) {
            $scope.check = $stateParams.index
        }
        $scope.orgName = "seferfe";
        market.get({}, function (data) {
            console.log('套餐详情', data);
        })

        //load project
        var loadProject = function () {
            $http.get('/oapi/v1/projects', {}).success(function (data) {
                console.log('test project', data);
            })
        }

        //创建组织
        $scope.addOrg = function () {
            Addmodal.open('创建组织', '组织名称', '', $stateParams.useorg, 'org').then(function (res) {
                //createOrg.create({name:res},function (data) {
                //  console.log(data);
                //  if(data) {
                //    $scope.orgList.push(data);
                //    loadOrg();
                //    $rootScope.orgStatus = true;
                //  }
                //})
                //({useorg:org.id})
                loadOrg();
                loadProject();
                //$state.go('console.org', {useorg:res.id})
                //console.log('zuzhi',res);

            })
        }
        $scope.updatePwd = function () {
            ModalPwd.open().then(function (password) {
                console.log(password);
                pwdModify.change({new_password: password.pwd, old_password: password.oldpwd}, function (data) {
                    Toast.open('更改密码成功');
                    setTimeout(function () {
                        Cookie.clear('namespace');
                        Cookie.clear('df_access_token');
                        $rootScope.user = null;
                        $rootScope.namespace = "";
                        $state.go('login');
                    }, 2000)
                })
            })

        };
        $scope.updateToken = function () {
            Addmodal.open('更新私有token', '私有token', '信息错误').then(function (res) {
            })
        }
        var a;
        var keep = function () {
            a = setTimeout($scope.showpop, 1000);
        }
        $scope.showpop = function () {
            keep();
            document.getElementById("pop").style.display = "block";
            clearTimeout(a);
        }
        $scope.hidepop = function () {
            document.getElementById("pop").style.display = "none";
        }
        $scope.showbig = function () {
            keep();
            document.getElementById("pop").style.display = "block";
            clearTimeout(a);
        }
        var loadInfo = function () {
            profile.get({}, function (data) {
                $scope.curUserInfo = data;
            })
        }
        var loadOrg = function () {
            //list entire orgs
            orgList.get({}, function (data) {
                $scope.orgList = data.orgnazitions;
                if ($scope.orgList) {
                    for (var i = 0; i < $scope.orgList.length; i++) {
                        for (var j = 0; j < $scope.orgList[i].members.length; j++) {
                            if ($scope.orgList[i].members[j].member_name == $rootScope.user.metadata.name) {
                                $scope.orgList[i].privileged = $scope.orgList[i].members[j].privileged;
                            }
                        }
                    }
                    if (!data.orgnazitions) {
                        $scope.orgList = [];
                    }
                    for (var i = 0; i < $scope.orgList.length; i++) {
                        for (var j = 0; j < $scope.orgList[i].members.length; j++) {
                            if ($scope.orgList[i].members[j].member_name == $rootScope.user.metadata.name) {
                                $scope.orgList[i].privileged = $scope.orgList[i].members[j].privileged;
                            }
                        }
                    }
                }
                console.log('list entire orgs', data);
            })
        }

        $scope.leaveOrg = function (idx, orgid, oname, privilegeds) {
            var privilegednum = 0;
            for (var i = 0; i < $scope.orgList[idx].members.length; i++) {
                if ($scope.orgList[idx].members[i].privileged) {
                    privilegednum++;
                }
            }
            //console.log('privilegeds', privilegeds);
            //console.log('privilegednum', privilegednum);
            //console.log('$rootScope.user.metadata.name', $rootScope.user.metadata.name);
            if ((privilegeds && privilegednum > 1) || !privilegeds) {
                Confirm.open("离开组织", "您确定要离开" + oname + "吗？", "", "").then(function () {
                    leave.left({org: orgid}, function () {
                        // console.log('test leave', res);
                        $scope.orgList.splice(idx, 1)
                        $rootScope.orgStatus = true;
                        $rootScope.delOrgs = true;
                        loadOrg();
                    })
                })
            }
            if (privilegeds && privilegednum == 1) {
                Confirm.open("离开组织", "不能离开！", "您是最后一名管理员请先指定其他管理员，才能离开", "", true).then(function () {
                })
            }
        }
        //orders.get({}, function (orders) {
        //    console.log(orders);
        //})
        amounts.get({size:500,page:1}, function (data) {
            console.log(data);
            data.amounts.reverse()
            angular.forEach(data.amounts, function (amount,i) {
                if (amount.description === "recharge") {
                    data.amounts[i].description='充值'
                }else {
                    data.amounts[i].description='扣费'
                }
            })
            $scope.myamounts = data.amounts;
            $scope.amountdata =angular.copy(data.amounts)
            $scope.grid.total = data.amounts.length;
            refresh(1);

        })
        $scope.sendemail = function (item) {
            $http.post('/lapi/send_verify_email', {}).success(function () {
                //alert('激活邮件已发送!')
                Toast.open('激活邮件发送成功！');
                console.log('test send email', item);
            })
        }

        loadInfo();
        loadOrg();
    }])


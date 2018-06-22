'use strict';
angular.module('console.create_secret', [
    {
        files: []
    }
]).controller('createSecretCtrl', ['$scope', '$rootScope', 'secretskey', '$state', 'toastr', function ($scope, $rootScope, secretskey, $state, toastr) {
    $scope.grid = {
        secreteno: false,
        secretnames: true,
        nameerr: false,
        keychongfu: false,
        keybuhefa: false,
        keynull: false,
        lableKey: false
    };
    $scope.secrets = {
        "kind": "Secret",
        "apiVersion": "v1",
        "metadata": {
            "name": ""
        },
        "data": {},
        "secretsarr": [],
        "type": "Opaque"
    };
    var Base64 = {
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) {
            var t = "";
            var n, r, i, s, o, u, a;
            var f = 0;
            e = Base64._utf8_encode(e);
            while (f < e.length) {
                n = e.charCodeAt(f++);
                r = e.charCodeAt(f++);
                i = e.charCodeAt(f++);
                s = n >> 2;
                o = (n & 3) << 4 | r >> 4;
                u = (r & 15) << 2 | i >> 6;
                a = i & 63;
                if (isNaN(r)) {
                    u = a = 64
                } else if (isNaN(i)) {
                    a = 64
                }
                t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
            }
            return t
        }, decode: function (e) {
            var t = "";
            var n, r, i;
            var s, o, u, a;
            var f = 0;
            e = e.replace(/[^A-Za-z0-9+/=]/g, "");
            while (f < e.length) {
                s = this._keyStr.indexOf(e.charAt(f++));
                o = this._keyStr.indexOf(e.charAt(f++));
                u = this._keyStr.indexOf(e.charAt(f++));
                a = this._keyStr.indexOf(e.charAt(f++));
                n = s << 2 | o >> 4;
                r = (o & 15) << 4 | u >> 2;
                i = (u & 3) << 6 | a;
                t = t + String.fromCharCode(n);
                if (u != 64) {
                    t = t + String.fromCharCode(r)
                }
                if (a != 64) {
                    t = t + String.fromCharCode(i)
                }
            }
            t = Base64._utf8_decode(t);
            return t
        }, _utf8_encode: function (e) {
            e = e.replace(/rn/g, "n");
            var t = "";
            for (var n = 0; n < e.length; n++) {
                var r = e.charCodeAt(n);
                if (r < 128) {
                    t += String.fromCharCode(r)
                } else if (r > 127 && r < 2048) {
                    t += String.fromCharCode(r >> 6 | 192);
                    t += String.fromCharCode(r & 63 | 128)
                } else {
                    t += String.fromCharCode(r >> 12 | 224);
                    t += String.fromCharCode(r >> 6 & 63 | 128);
                    t += String.fromCharCode(r & 63 | 128)
                }
            }
            return t
        }, _utf8_decode: function (e) {
            var t = "";
            var n = 0;
            var r = 0;
            var c1 = 0;
            var c2 = 0;
            var c3 = 0;
            while (n < e.length) {
                r = e.charCodeAt(n);
                if (r < 128) {
                    t += String.fromCharCode(r);
                    n++
                } else if (r > 191 && r < 224) {
                    c2 = e.charCodeAt(n + 1);
                    t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                    n += 2
                } else {
                    c2 = e.charCodeAt(n + 1);
                    c3 = e.charCodeAt(n + 2);
                    t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                    n += 3
                }
            }
            return t
        }
    };
    //添加配置文件
    $scope.AddConfigurationFile = function () {
        $scope.grid.lableKey = true;
        $scope.secrets.secretsarr.push({key: '', value: '',isClearCode:false});
    };
    $scope.clearCode = function (index) {
        $scope.secrets.secretsarr[index].value = '';
        $scope.secrets.secretsarr[index].isClearCode = false;
    };
    $scope.addFile = function (i) {
        $scope.check = i;
        // document.getElementById('file-input').addEventListener('change', readSingleFile, false);
        document.getElementsByClassName('upLoadFile')[$scope.check].addEventListener('change', readSingleFile, false);
    };
    function readSingleFile(e) {
        var thisfilename = this.value;
        if (thisfilename.indexOf('\\')) {
            var arr = thisfilename.split('\\');
            thisfilename = arr[arr.length - 1]
        }
        var file = e.target.files[0];
        if (!file) {
            return;
        }
        var reader = new FileReader();
        reader.onload = function (e) {
            var content = e.target.result;
            $scope.secrets.secretsarr[$scope.check].value = content;
            $scope.secrets.secretsarr[$scope.check].isClearCode = true;

            $scope.$apply();
        };
        reader.readAsText(file);
    }

    $scope.deletekv = function (idx) {
        $scope.secrets.secretsarr.splice(idx, 1);
    };

    var by = function (name) {
        return function (o, p) {
            var a, b;
            if (typeof o === "object" && typeof p === "object" && o && p) {
                a = o[name];
                b = p[name];
                if (a === b) {
                    return 0;
                }
                if (typeof a === typeof b) {
                    return a < b ? -1 : 1;
                }
                return typeof a < typeof b ? -1 : 1;
            } else {
                throw ("error");
            }
        }
    };
    $scope.$watch('secrets', function (n, o) {
        if (n == o) {
            return
        };
        //console.log(n);
        $scope.grid.keychongfu = false;
        $scope.grid.keynull = false;
        $scope.grid.keybuhefa = false;

        //if (n.metadata.name && n.secretsarr) {
        //    // var arr = angular.copy(n.secretsarr);
        //    var arr = n.secretsarr;
        //    // arr.sort(by("key"));
        //    if (arr && arr.length > 0) {
        //        var kong = false;
        //        var r = /^\.?[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
        //        angular.forEach(arr, function (item, i) {
        //
        //            if (!item.key || !item.value) {
        //                $scope.grid.keynull = true;
        //                kong = true;
        //            } else {
        //                if (arr[i] && arr[i + 1]) {
        //                    if (arr[i].key == arr[i + 1].key) {
        //                        $scope.grid.keychongfu = true;
        //                        kong = true;
        //                    }
        //                }
        //                if (!r.test(arr[i].key)) {
        //                    //console.log(arr[i].key);
        //                    $scope.grid.keybuhefa = true;
        //                    kong = true;
        //                }
        //            }
        //        });
        //        if (!kong) {
        //            $scope.grid.secreteno = true
        //        } else {
        //
        //            $scope.grid.secreteno = false
        //        }
        //    } else {
        //        $scope.grid.secreteno = false
        //    }
        //} else {
        //    $scope.grid.secreteno = false
        //}
    }, true);

    $scope.checknames = function () {
        var r = /^[a-z][a-z0-9-]{2,28}[a-z0-9]$/;
        if (!r.test($scope.secrets.metadata.name)) {
            $scope.grid.secretnames = false;
        } else {
            $scope.grid.secretnames = true;
        }
    };
    $scope.checkedkv = function () {
        var r = /^[a-zA-Z][a-zA-Z0-9_]{1,20}$/; // key值的验证;
        for (var i = 0; i < $scope.secretsarr.length; i++) {
            if ($scope.secretsarr[i].key && $scope.secretsarr[i].value && r.test($scope.secretsarr[i].key)) {
                $scope.grid.secreteno = true;
            } else {
                $scope.grid.secreteno = false;
            }
        }
    };
    $scope.namerr = {
        nil: false,
        rexed: false,
        repeated: false
    };
    //$scope.nameblur = function () {
    //    //console.log($scope.buildConfig.metadata.name);
    //    if (!$scope.secrets.metadata.name) {
    //        $scope.namerr.nil = true
    //    } else {
    //        $scope.namerr.nil = false
    //    }
    //};
    //$scope.namefocus = function () {
    //    $scope.namerr.nil = false
    //};
    secretskey.get({namespace: $rootScope.namespace, region: $rootScope.region}, function (res) {
        $scope.secremnamearr = res.items;
    });

    //var rex = /^[a-z][a-z0-9-]{2,28}[a-z0-9]$/;
    $scope.$watch('secrets.metadata.name', function (n, o) {
        if (n === o) {
            return;
        }
        $scope.namerr = {
            nil: false,
            rexed: false,
            repeated: false
        };
    });
    function nameerr(name, arr) {

        var rex = /^[a-z][a-z0-9-]{2,28}[a-z0-9]$/;
        if (name === '') {
            return 'nil'
        } else if (!rex.test(name)) {
            return 'rexed'
        } else {
            var iserpeat = false;
            angular.forEach(arr, function (item, i) {
                if (name === item.metadata.name) {
                    iserpeat = true
                }
            })
            if (iserpeat) {
                return 'repeated'
            }
        }
        return 'allmight'
    }

    function keyerr(arr) {
        var rex = /^\.?[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
        var cancreat = true
        angular.forEach(arr, function (item, i) {
            if (item.key === '') {
                cancreat = false;
                item.err.key.nil = true
            }else if(!rex.test(item.key)){
                cancreat = false;
                item.err.key.rexed = true
            }else {
                angular.forEach(arr, function (initem, k) {
                    if (i !== k) {
                        if (item.key === initem.key) {
                            cancreat = false;
                            item.err.key.repeated = true;
                            initem.err.key.repeated = true;

                        }
                    }
                })
            }


        })
        if (cancreat) {
            return 'cancreat'
        }else {
            return 'dontcreat'
        }


    }

    $scope.postsecret = function () {
        //if (!$scope.namerr.nil && !$scope.namerr.rexed && !$scope.namerr.repeated) {
        //
        //} else {
        //    return
        //}
        $scope.namerr = {
            nil: false,
            rexed: false,
            repeated: false
        };
        console.log('nameerr($scope.secrets.metadata.name, $scope.secremnamearr)',nameerr($scope.secrets.metadata.name, $scope.secremnamearr));
        if (nameerr($scope.secrets.metadata.name, $scope.secremnamearr) !== 'allmight') {
            //console.log('nameerr($scope.volume.metadata.name, $scope.cfmnamearr)', nameerr($scope.secrets.metadata.name, $scope.secremnamearr));
            $scope.namerr[nameerr($scope.secrets.metadata.name, $scope.secremnamearr)] = true;
            return
        }

        angular.forEach($scope.secrets.secretsarr, function (item, i) {
            $scope.secrets.secretsarr[i].err = {
                key: {
                    nil: false,
                    rexed: false,
                    repeated: false
                }
            }

        })

        if (keyerr($scope.secrets.secretsarr) !== 'cancreat') {

            return
        }
        $scope.loaded = true;
        var arr = $scope.secrets.secretsarr;
        // console.log("0089----", arr);
        angular.forEach(arr, function (item, i) {
            $scope.secrets.data[item.key] = Base64.encode(item.value);
        });

        delete $scope.secrets.secretsarr;

        secretskey.create({namespace: $rootScope.namespace, region: $rootScope.region}, $scope.secrets, function (res) {
            // console.log('=====res===',res);
            $scope.grid.nameerr = false;
            $scope.loaded = false;
            toastr.success('创建成功', {
                closeButton: true
            });
            $state.go('console.resource_secret', {namespace: $rootScope.namespace});
        }, function (res) {
            toastr.error('创建失败，请重试', {
                closeButton: true
            });
            if (res.status == 409) {
                $scope.grid.nameerr = true;
            }
        })
    }
}]);

'use strict';

define(['angular', 'jsyaml'], function (angular, jsyaml) {
    return angular.module('myApp.service', ['angular-clipboard', 'base64'])
        .factory('yaml', [function () {
            return jsyaml;
        }])
        .factory("FullscreenService",['IS_SAFARI',function(IS_SAFARI) {
            var requestFullscreen =
                document.documentElement.requestFullScreen ||
                document.documentElement.webkitRequestFullScreen ||
                document.documentElement.mozRequestFullScreen ||
                document.documentElement.msRequestFullscreen;

            var findElement = function(element) {
                if (!element || !_.isString(element)) {
                    return element;
                }

                var matches = $(element);
                if (!matches.length) {
                    return null;
                }

                return matches[0];
            };

            return {
                hasFullscreen: function(needsKeyboard) {
                    // Safari blocks keyboard input in fullscreen mode. Unfortunately
                    // there's no feature detection for this, so fall back to user agent
                    // sniffing.
                    if (needsKeyboard && IS_SAFARI) {
                        return false;
                    }
                    return !!requestFullscreen;
                },

                // `element` is a DOM element or selector
                requestFullscreen: function(element) {
                    if (!requestFullscreen) {
                        return;
                    }

                    element = findElement(element);
                    if (!element) {
                        return;
                    }

                    requestFullscreen.call(element);
                },

                exitFullscreen: function() {
                    if(document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if(document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if(document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                }
            };
        }])

        .service('Confirm', ['$uibModal', function ($uibModal) {
            this.open = function (title, txt, tip, tp, iscf, nonstop) {
                return $uibModal.open({
                    templateUrl: 'pub/tpl/confirm.html',
                    size: 'default',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.title = title;
                        $scope.txt = txt;
                        $scope.tip = tip;
                        $scope.tp = tp;
                        $scope.iscf = iscf;
                        //$scope.nonstop = nonstop;
                        $scope.ok = function () {
                            $uibModalInstance.close(true);
                        };
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                    }]
                }).result;
            };
        }])
        .service('errcode', ['$uibModal', function ($uibModal) {
            this.open = function (code) {
                var errcode = {
                    '1400': '请求错误',
                    '14000': '组织名称太短',
                    '14001': '名称太短',
                    '14002': '用户名不合法',
                    '14003': '操作不支持',
                    '14004': '不合法的token',
                    '14005': '密码不能为空',
                    '14006': '密码长度必须为8-12位',
                    '14007': '不合法的邮箱地址',
                    '14008': '不合法的用户名',
                    '14009': '该成员仍在组织中',
                    '140010': '超出配额',
                    '140011': '最后一名管理员禁止操作',
                    '140012': '该用户已被邀请过',
                    '140013': '该用户已在组织中',
                    '140014': '该用户还未注册',
                    '1401': '该用户未授权',
                    '1403': '禁止操作',
                    '14030': '没有权限',
                    '1404': '不能找到',
                    '14040': '不能找到组织',
                    '14041': '不能找到该用户',
                    '14090': '组织已存在',
                    '14091': '该用户已存在',
                    '14092': '该用户在LDAP已存在',
                    '1409': '重复条目',
                    '2049': '原密码错误'
                };
                return errcode[code] || '内部错误，请通过DaoVoice联系管理员'
            }
        }])
        .service('by', ['$uibModal', function ($uibModal) {
            this.open = function (name, daoxu) {
                //daoxu参数倒序排列
                return function (o, p) {
                    var a, b;
                    if (typeof o === "object" && typeof p === "object" && o && p) {
                        a = o[name];
                        b = p[name];
                        if (a === b) {
                            return 0;
                        }
                        if (typeof a === typeof b) {
                            if (daoxu) {
                                return a < b ? 1 : -1;
                            } else {
                                return a < b ? -1 : 1;
                            }

                        }
                        if (daoxu) {
                            return typeof a < typeof b ? 1 : -1;
                        } else {
                            return typeof a < typeof b ? -1 : 1;
                        }

                    } else {
                        throw ("error");
                    }
                }
            }
        }])
        .service('ansi_ups', ['$uibModal', function ($uibModal) {
            //this.open = function (Date) {
            var ansi_up,
                VERSION = "1.3.0",

                // check for nodeJS
                hasModule = (typeof module !== 'undefined'),

                // Normal and then Bright
                ANSI_COLORS = [
                    [
                        {color: "0, 0, 0", 'class': "ansi-black"},
                        {color: "187, 0, 0", 'class': "ansi-red"},
                        {color: "0, 187, 0", 'class': "ansi-green"},
                        {color: "187, 187, 0", 'class': "ansi-yellow"},
                        {color: "0, 0, 187", 'class': "ansi-blue"},
                        {color: "187, 0, 187", 'class': "ansi-magenta"},
                        {color: "0, 187, 187", 'class': "ansi-cyan"},
                        {color: "255,255,255", 'class': "ansi-white"}
                    ],
                    [
                        {color: "85, 85, 85", 'class': "ansi-bright-black"},
                        {color: "255, 85, 85", 'class': "ansi-bright-red"},
                        {color: "0, 255, 0", 'class': "ansi-bright-green"},
                        {color: "255, 255, 85", 'class': "ansi-bright-yellow"},
                        {color: "85, 85, 255", 'class': "ansi-bright-blue"},
                        {color: "255, 85, 255", 'class': "ansi-bright-magenta"},
                        {color: "85, 255, 255", 'class': "ansi-bright-cyan"},
                        {color: "255, 255, 255", 'class': "ansi-bright-white"}
                    ]
                ],

                // 256 Colors Palette
                PALETTE_COLORS;

            function Ansi_Up() {
                this.fg = this.bg = this.fg_truecolor = this.bg_truecolor = null;
                this.bright = 0;
            }

            Ansi_Up.prototype.setup_palette = function () {
                PALETTE_COLORS = [];
                // Index 0..15 : System color
                (function () {
                    var i, j;
                    for (i = 0; i < 2; ++i) {
                        for (j = 0; j < 8; ++j) {
                            PALETTE_COLORS.push(ANSI_COLORS[i][j]['color']);
                        }
                    }
                })();

                // Index 16..231 : RGB 6x6x6
                // https://gist.github.com/jasonm23/2868981#file-xterm-256color-yaml
                (function () {
                    var levels = [0, 95, 135, 175, 215, 255];
                    var format = function (r, g, b) {
                        return levels[r] + ', ' + levels[g] + ', ' + levels[b]
                    };
                    var r, g, b;
                    for (r = 0; r < 6; ++r) {
                        for (g = 0; g < 6; ++g) {
                            for (b = 0; b < 6; ++b) {
                                PALETTE_COLORS.push(format.call(this, r, g, b));
                            }
                        }
                    }
                })();

                // Index 232..255 : Grayscale
                (function () {
                    var level = 8;
                    var format = function (level) {
                        return level + ', ' + level + ', ' + level
                    };
                    var i;
                    for (i = 0; i < 24; ++i, level += 10) {
                        PALETTE_COLORS.push(format.call(this, level));
                    }
                })();
            };

            Ansi_Up.prototype.escape_for_html = function (txt) {
                return txt.replace(/[&<>]/gm, function (str) {
                    if (str == "&") return "&amp;";
                    if (str == "<") return "&lt;";
                    if (str == ">") return "&gt;";
                });
            };

            Ansi_Up.prototype.linkify = function (txt) {
                return txt.replace(/(https?:\/\/[^\s]+)/gm, function (str) {
                    return "<a href=\"" + str + "\">" + str + "</a>";
                });
            };

            Ansi_Up.prototype.ansi_to_html = function (txt, options) {
                return this.process(txt, options, true);
            };

            Ansi_Up.prototype.ansi_to_text = function (txt) {
                var options = {};
                return this.process(txt, options, false);
            };

            Ansi_Up.prototype.process = function (txt, options, markup) {
                var self = this;
                if (txt) {
                    var raw_text_chunks = txt.split(/\033\[/);
                    var first_chunk = raw_text_chunks.shift(); // the first chunk is not the result of the split

                    var color_chunks = raw_text_chunks.map(function (chunk) {
                        return self.process_chunk(chunk, options, markup);
                    });

                    color_chunks.unshift(first_chunk);

                    return color_chunks.join('');
                }


            };

            Ansi_Up.prototype.process_chunk = function (text, options, markup) {

                // Are we using classes or styles?
                options = typeof options == 'undefined' ? {} : options;
                var use_classes = typeof options.use_classes != 'undefined' && options.use_classes;
                var key = use_classes ? 'class' : 'color';

                // Each 'chunk' is the text after the CSI (ESC + '[') and before the next CSI/EOF.
                //
                // This regex matches four groups within a chunk.
                //
                // The first and third groups match code type.
                // We supported only SGR command. It has empty first group and 'm' in third.
                //
                // The second group matches all of the number+semicolon command sequences
                // before the 'm' (or other trailing) character.
                // These are the graphics or SGR commands.
                //
                // The last group is the text (including newlines) that is colored by
                // the other group's commands.
                var matches = text.match(/^([!\x3c-\x3f]*)([\d;]*)([\x20-\x2c]*[\x40-\x7e])([\s\S]*)/m);

                if (!matches) return text;

                var orig_txt = matches[4];
                var nums = matches[2].split(';');

                // We currently support only "SGR" (Select Graphic Rendition)
                // Simply ignore if not a SGR command.
                if (matches[1] !== '' || matches[3] !== 'm') {
                    return orig_txt;
                }

                if (!markup) {
                    return orig_txt;
                }

                var self = this;

                while (nums.length > 0) {
                    var num_str = nums.shift();
                    var num = parseInt(num_str);

                    if (isNaN(num) || num === 0) {
                        self.fg = self.bg = null;
                        self.bright = 0;
                    } else if (num === 1) {
                        self.bright = 1;
                    } else if (num == 39) {
                        self.fg = null;
                    } else if (num == 49) {
                        self.bg = null;
                    } else if ((num >= 30) && (num < 38)) {
                        self.fg = ANSI_COLORS[self.bright][(num % 10)][key];
                    } else if ((num >= 90) && (num < 98)) {
                        self.fg = ANSI_COLORS[1][(num % 10)][key];
                    } else if ((num >= 40) && (num < 48)) {
                        self.bg = ANSI_COLORS[0][(num % 10)][key];
                    } else if ((num >= 100) && (num < 108)) {
                        self.bg = ANSI_COLORS[1][(num % 10)][key];
                    } else if (num === 38 || num === 48) { // extend color (38=fg, 48=bg)
                        (function () {
                            var is_foreground = (num === 38);
                            if (nums.length >= 1) {
                                var mode = nums.shift();
                                if (mode === '5' && nums.length >= 1) { // palette color
                                    var palette_index = parseInt(nums.shift());
                                    if (palette_index >= 0 && palette_index <= 255) {
                                        if (!use_classes) {
                                            if (!PALETTE_COLORS) {
                                                self.setup_palette.call(self);
                                            }
                                            if (is_foreground) {
                                                self.fg = PALETTE_COLORS[palette_index];
                                            } else {
                                                self.bg = PALETTE_COLORS[palette_index];
                                            }
                                        } else {
                                            var klass = (palette_index >= 16) ?
                                                ('ansi-palette-' + palette_index) :
                                                ANSI_COLORS[palette_index > 7 ? 1 : 0][palette_index % 8]['class'];
                                            if (is_foreground) {
                                                self.fg = klass;
                                            } else {
                                                self.bg = klass;
                                            }
                                        }
                                    }
                                } else if (mode === '2' && nums.length >= 3) { // true color
                                    var r = parseInt(nums.shift());
                                    var g = parseInt(nums.shift());
                                    var b = parseInt(nums.shift());
                                    if ((r >= 0 && r <= 255) && (g >= 0 && g <= 255) && (b >= 0 && b <= 255)) {
                                        var color = r + ', ' + g + ', ' + b;
                                        if (!use_classes) {
                                            if (is_foreground) {
                                                self.fg = color;
                                            } else {
                                                self.bg = color;
                                            }
                                        } else {
                                            if (is_foreground) {
                                                self.fg = 'ansi-truecolor';
                                                self.fg_truecolor = color;
                                            } else {
                                                self.bg = 'ansi-truecolor';
                                                self.bg_truecolor = color;
                                            }
                                        }
                                    }
                                }
                            }
                        })();
                    }
                }

                if ((self.fg === null) && (self.bg === null)) {
                    return orig_txt;
                } else {
                    var styles = [];
                    var classes = [];
                    var data = {};
                    var render_data = function (data) {
                        var fragments = [];
                        var key;
                        for (key in data) {
                            if (data.hasOwnProperty(key)) {
                                fragments.push('data-' + key + '="' + this.escape_for_html(data[key]) + '"');
                            }
                        }
                        return fragments.length > 0 ? ' ' + fragments.join(' ') : '';
                    };

                    if (self.fg) {
                        if (use_classes) {
                            classes.push(self.fg + "-fg");
                            if (self.fg_truecolor !== null) {
                                data['ansi-truecolor-fg'] = self.fg_truecolor;
                                self.fg_truecolor = null;
                            }
                        } else {
                            styles.push("color:rgb(" + self.fg + ")");
                        }
                    }
                    if (self.bg) {
                        if (use_classes) {
                            classes.push(self.bg + "-bg");
                            if (self.bg_truecolor !== null) {
                                data['ansi-truecolor-bg'] = self.bg_truecolor;
                                self.bg_truecolor = null;
                            }
                        } else {
                            styles.push("background-color:rgb(" + self.bg + ")");
                        }
                    }
                    if (use_classes) {
                        return '<span class="' + classes.join(' ') + '"' + render_data.call(self, data) + '>' + orig_txt + '</span>';
                    } else {
                        return '<span style="' + styles.join(';') + '"' + render_data.call(self, data) + '>' + orig_txt + '</span>';
                    }
                }
            };

            // Module exports
            //ansi_up = {

            this.escape_for_html = function (txt) {
                var a2h = new Ansi_Up();
                return a2h.escape_for_html(txt);
            };

            this.linkify = function (txt) {
                var a2h = new Ansi_Up();
                return a2h.linkify(txt);
            };

            this.ansi_to_html = function (txt, options) {
                var a2h = new Ansi_Up();
                return a2h.ansi_to_html(txt, options);
            };

            this.ansi_to_text = function (txt) {
                var a2h = new Ansi_Up();
                return a2h.ansi_to_text(txt);
            };

            this.ansi_to_html_obj = function () {
                return new Ansi_Up();
            };
            //};

            // CommonJS module is defined
            if (hasModule) {
                return ansi_up;
            }
            /*global ender:false */
            if (typeof window !== 'undefined' && typeof ender === 'undefined') {
                window.ansi_up = ansi_up;
            }
            /*global define:false */
            if (typeof define === "function" && define.amd) {
                define("ansi_up", [], function () {
                    return ansi_up;
                });
            }

            //}
        }])
        .service('Addmodal', ['errcode', '$uibModal', function (errcode, $uibModal) {
            this.open = function (title, txt, tip, orgId, isaddpeople) {
                return $uibModal.open({
                    templateUrl: 'pub/tpl/addmodal.html',
                    size: 'default',
                    controller: ['addperpleOrg', 'createOrg', '$state', '$rootScope', '$scope', '$uibModalInstance', 'loadOrg', '$http',
                        function (addperpleOrg, createOrg, $state, $rootScope, $scope, $uibModalInstance, loadOrg, $http) {
                            $scope.isaddpeople = isaddpeople;
                            $scope.level = false;
                            $scope.title = title;
                            $scope.txt = txt;
                            $scope.tip = tip;
                            $scope.orgName = null;
                            var canok = true;
                            $scope.ok = function () {
                                if (canok) {
                                    canok = false;
                                    if (isaddpeople == 'people') {
                                        if (!$scope.orgName) {
                                            $scope.tip = '邮箱不能为空';
                                            return;
                                        } else {
                                            addperpleOrg.put({
                                                namespace: $rootScope.namespace,
                                                region: $rootScope.region
                                            }, {
                                                member_name: $scope.orgName,
                                                admin: $scope.level
                                            }, function (item) {
                                                $uibModalInstance.close(item);
                                            }, function (err) {
                                                //console.log('err.code', err);
                                                $scope.tip = errcode.open(err.data.code)
                                            })

                                        }
                                    } else if (isaddpeople == 'org') {
                                        if (!$scope.orgName) {
                                            $scope.tip = '名称不能为空';
                                            return;
                                        } else {

                                            createOrg.create({
                                                region: $rootScope.region,
                                                name: $scope.orgName
                                            }, function (item) {
                                                //$state.go('console.org', {useorg: item.id})
                                                $uibModalInstance.close(item);
                                                //$rootScope.delOrgs = true;
                                            }, function (err) {
                                                //console.log(err);

                                                if (err.data.code === 400) {
                                                    $scope.tip = '同一账号只可创建一个组织'
                                                } else {
                                                    $scope.tip = errcode.open(err.code)
                                                }

                                            });
                                            //$http.post('/lapi/orgs', {
                                            //    name: $scope.orgName
                                            //}).success(function (item) {
                                            //    //$state.go()
                                            //    $state.go('console.org', {useorg: item.id})
                                            //    $uibModalInstance.close(item);
                                            //
                                            //    $rootScope.delOrgs = true;
                                            //}).error(function (res) {
                                            //    //console.log(res);
                                            //    $scope.tip = errcode.open(res.code)
                                            //    //if(res.code >= 500){
                                            //    //  $scope.tip = '内部错误，请通过DaoVoice联系管理员';
                                            //    //}else{
                                            //    //  $scope.tip = res.message;
                                            //    //}
                                            //})
                                        }
                                    } else {
                                        $uibModalInstance.close($scope.orgName);
                                    }
                                }


                            };
                            $scope.cancel = function () {
                                $uibModalInstance.dismiss();
                            };
                        }
                    ]
                }).result;
            };
        }])
        .service('Alert', ['$uibModal', function ($uibModal) {
            this.open = function (title, txt, err, regist, active) {
                return $uibModal.open({
                    templateUrl: 'pub/tpl/alert.html',
                    size: 'default',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.title = title;
                        $scope.txt = txt;
                        $scope.err = err;
                        $scope.classify = regist;
                        $scope.activation = active;
                        $scope.ok = function () {
                            $uibModalInstance.close();
                        };
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                    }]
                }).result;
            };
        }])
        .service('Tip', ['$uibModal', function ($uibModal) {
            this.open = function (title, txt, tip, iscf, colse, isorg, ispay) {
                return $uibModal.open({
                    templateUrl: 'pub/tpl/tip.html',
                    size: 'default',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.title = title;
                        $scope.txt = txt;
                        $scope.tip = tip;
                        $scope.close = colse;
                        //$scope.tp = tp;
                        $scope.iscf = iscf;
                        $scope.isorg = isorg;
                        $scope.ispay = ispay;
                        //$scope.nonstop = nonstop;
                        $scope.ok = function () {
                            $uibModalInstance.close(true);
                        };
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                    }]
                }).result;
            };
        }])
        .service('delTip', ['$uibModal', function ($uibModal) {
            this.open = function (title, txt, tip, colse) {
                return $uibModal.open({
                    backdrop: 'static',
                    templateUrl: 'pub/tpl/deltip.html',
                    size: 'default',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.title = title;
                        $scope.txt = txt;
                        $scope.tip = tip;
                        $scope.close = colse;
                        //$scope.tp = tp;

                        //$scope.nonstop = nonstop;
                        $scope.ok = function () {
                            $uibModalInstance.close();
                        };
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                    }]
                }).result;
            };
        }])
        .service('simpleAlert', ['$uibModal', function ($uibModal) {
            this.open = function (title, txt) {
                return $uibModal.open({
                    templateUrl: 'pub/tpl/simpleAlert.html',
                    size: 'default',
                    controller: ['$scope', '$uibModalInstance', '$sce', function ($scope, $uibModalInstance, $sce) {
                        $scope.title = title;
                        $scope.txt = $sce.trustAsHtml(txt);
                        $scope.ok = function () {
                            $uibModalInstance.close();
                        };
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                    }]
                }).result;
            };
        }])
        .service('diploma', ['$uibModal', function ($uibModal) {
            this.open = function (obj) {
                return $uibModal.open({
                    templateUrl: 'pub/tpl/diploma.html',
                    size: 'default modal-lg',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.diploma = obj;
                        //console.log($scope.diploma, obj);
                        //$scope.err = err;
                        //$scope.classify = regist;
                        //$scope.activation = active;
                        $scope.ok = function () {
                            $uibModalInstance.close();
                        };
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                    }]
                }).result;
            };
        }])
        .service('Modalbs', ['$uibModal', function ($uibModal) {
            this.open = function (name, plan) {
                return $uibModal.open({
                    templateUrl: 'pub/tpl/modalbs.html',
                    size: 'default',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.name = name;
                        $scope.plan = plan;

                        $scope.ok = function () {
                            $uibModalInstance.close();
                        };
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                    }]
                }).result;
            };
        }])
        .service('Toast', ['$uibModal', function ($uibModal) {
            this.open = function (txt, timeout) {
                return $uibModal.open({
                    template: '<p>{{txt}}</p>',
                    size: 'toast',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.txt = txt;
                        timeout = timeout || 1500;
                        setTimeout(function () {
                            $uibModalInstance.dismiss();
                        }, timeout);
                    }]
                }).result;
            }
        }])
        .service('ChangeImages', ['$uibModal', function ($uibModal) {
            this.open = function (imageslist, tags) {
                return $uibModal.open({
                    templateUrl: 'pub/tpl/changeImage.html',
                    size: 'default',
                    controller: ['$scope', '$uibModalInstance', 'ImageStreamImage', 'imagestreamimports', '$rootScope', 'ImageStream', 'Cookie',
                        function ($scope, $uibModalInstance, ImageStreamImage, imagestreamimports, $rootScope, ImageStream, Cookie) {
                            $scope.imageslist = imageslist;
                            $scope.istag = angular.copy(tags)
                            $scope.tagslist = [];
                            $scope.institution = {
                                display: 1,
                                configregistry: false
                            }
                            $scope.err = {
                                url: {
                                    null: false,
                                    notfind: false,
                                    role: false
                                },
                                name: {
                                    null: false,
                                    repeated: false,
                                    pattern: false
                                },
                                env: {
                                    null: false,
                                    repeated: false,
                                },
                                label: {
                                    null: false,
                                    repeated: false,
                                }

                            }
                            $scope.checked = {
                                namespace: '',
                                image: '',
                                tag: ''
                            }

                            $scope.postobj = {
                                "kind": "ImageStreamImport",
                                "apiVersion": "v1",
                                "metadata": {"name": "newapp", "namespace": $rootScope.namespace},
                                "spec": {
                                    "import": false,
                                    "images": [
                                        {
                                            "from": {
                                                "kind": "DockerImage",
                                                "name": ""
                                            }

                                        }
                                    ]


                                },
                                "status": {}
                            }
                            ImageStream.get({namespace: Cookie.get('namespace')}, function (data) {

                            })
                            ImageStream.get({namespace: Cookie.get('namespace')}, function (data) {

                            })
                            $scope.checkedimage = function (image) {
                                $scope.checked.image = image.metadata.name;
                                $scope.checked.tag = '';
                                $scope.tagslist = [];
                                if (image.status.tags) {
                                    angular.forEach(image.status.tags, function (tag, i) {
                                        tag.items[0].name = tag.tag
                                        tag.items[0].imagecopy = angular.copy(image)
                                        $scope.tagslist.push(tag.items[0])
                                    })
                                }
                            }

                            $scope.myKeyup = function (e) {
                                var keycode = window.event ? e.keyCode : e.which;
                                if (keycode == 13) {
                                    $scope.find();
                                }
                            }

                            function imagetimemessage(imagestime) {
                                $scope.creattime = imagestime
                            }

                            function imageportmessage(port) {
                                var port = port;
                                //console.log('port', port);
                                $scope.port = []
                                $scope.strport = '';

                                for (var k in port) {
                                    var pot = parseInt(k.split('/')[0])
                                    $scope.port.push({protocol: k.split('/')[1].toUpperCase(), containerPort: pot})
                                    //var rep = false
                                    //angular.forEach($scope.portsArr, function (item, i) {
                                    //    if (item.containerPort && item.containerPort == pot) {
                                    //        rep = true
                                    //    }
                                    //})
                                    //if (!rep) {
                                    //    $scope.portsArr.push({
                                    //        protocol: k.split('/')[1].toUpperCase(),
                                    //        containerPort: pot,
                                    //        hostPort: pot
                                    //    })
                                    //}
                                    $scope.strport += k.split('/')[0] + '/' + k.split('/')[1].toUpperCase() + ',';
                                }
                                $scope.strport = $scope.strport.replace(/\,$/, "");
                                $scope.firstPort = '';
                                if($scope.strport.split(',').length>1){
                                    $scope.firstPort = $scope.strport.split(',')[0];
                                }else{
                                    $scope.firstPort = $scope.strport
                                }

                                $scope.hasport = true;
                                //$scope.dc.spec.template.spec.containers[0].ports = angular.copy($scope.port)
                            }

                            $scope.find = function () {
                                if ($scope.institution.display == 2) {
                                    return
                                }
                                $scope.err.url.null = false;
                                $scope.err.url.role = false;
                                $scope.err.url.notfind = false;
                                if (!$scope.finding) {
                                    if ($scope.postobj.spec.images[0].from.name === '') {
                                        $scope.err.url.null = true
                                        return
                                    }
                                    $scope.finding = true;
                                    if ($scope.institution.configregistry) {
                                        $scope.postobj.spec.images[0].importPolicy = {
                                            insecure: true
                                        }
                                    }
                                    $scope.postobj.spec.images[0].from.name = $scope.postobj.spec.images[0].from.name.replace(/^\s+|\s+$/g, "");
                                    imagestreamimports.create({namespace: $rootScope.namespace}, $scope.postobj, function (images) {
                                        $scope.finding = false;
                                        $scope.checked.postobj = $scope.postobj
                                        $scope.checked.images = images
                                        $scope.checked.ismy = 'ourtag'
                                        //console.log('size', $scope.imagesize);
                                        if (images.status.images && images.status.images[0] && images.status.images[0].status) {
                                            if (images.status.images[0].status.code && images.status.images[0].status.code === 401) {
                                                $scope.err.url.role = true;
                                                return
                                            }
                                            if (images.status.images[0].status.code && images.status.images[0].status.code === 404) {
                                                //$scope.namerr.url = true;
                                                $scope.err.url.notfind = true;
                                                return
                                            }
                                            if (images.status.images[0].status.code && images.status.images[0].status.code === 500) {
                                                //$scope.namerr.url = true;
                                                $scope.err.url.role = true;
                                                return
                                            }
                                        }
                                        //$scope.namerr.canbuild = false;
                                        $scope.images = images;
                                        $scope.curl = $scope.postobj.spec.images[0].from.name;
                                        var name = $scope.postobj.spec.images[0].from.name.split('/')[$scope.postobj.spec.images[0].from.name.split('/').length - 1]
                                        $scope.fuwuname = name.split(':').length > 1 ? name.split(':')[0] : name;
                                        //$scope.dc.spec.template.spec.containers[0].name = $scope.fuwuname
                                        $scope.tag = name.split(':').length > 1 ? name.split(':')[1] : 'latest';
                                        $scope.imagetext = $scope.postobj.spec.images[0].from.name;
                                        //$scope.dc.spec.template.spec.containers[0].ports

                                        //var imagetag = 'dadafoundry.io/image-' + $scope.postobj.spec.images[0].from.name;
                                        //
                                        //$scope.dc.metadata.annotations[imagetag] = $scope.fuwuname + ":" + $scope.tag;

                                        if (images.status.images[0] && images.status.images[0].image.dockerImageMetadata) {
                                            imagetimemessage(images.status.images[0].image.dockerImageMetadata.Created)
                                            //console.log('images.status.images[0].image.dockerImageMetadata.Config.ExposedPorts', images.status.images[0].image.dockerImageMetadata);
                                            if (images.status.images[0].image.dockerImageMetadata.Config.ExposedPorts) {
                                                imageportmessage(images.status.images[0].image.dockerImageMetadata.Config.ExposedPorts)
                                            }
                                        } else {
                                            //$scope.namerr.url = true;
                                        }
                                        $scope.showall = true;

                                        //$scope.dc.metadata.labels[0].value = $scope.fuwuname;
                                    }, function (err) {
                                        //$scope.namerr.url = true;
                                        $scope.finding = false;
                                    })
                                }
                            }

                            $scope.checkedtag = function (tag) {
                                //console.log('tag', tag);
                                $scope.checked.tag = tag.name;
                                $scope.detail = {}
                                //imagemessage(tag.imagecopy)
                                ImageStreamImage.get({
                                    namespace: $rootScope.namespace,
                                    name: $scope.checked.image + '@' + tag.image
                                }, function (tag) {
                                    $scope.checked.mytag = tag
                                    $scope.checked.istag = $scope.istag
                                    $scope.checked.ismy = 'mytag'

                                    $scope.mytag = tag
                                    var allsize = 0;
                                    //console.log(tag.image.dockerImageLayers.length);
                                    if (tag.image.dockerImageLayers && tag.image.dockerImageLayers.length) {
                                        angular.forEach(tag.image.dockerImageLayers, function (size, i) {
                                            //console.log('size.size', size.size);
                                            allsize = allsize + size.size;
                                        })
                                    }
                                    $scope.imagesize = Math.round(parseInt(allsize) / 1024 / 1024 * 100) / 100
                                    //console.log('size',$scope.imagesize);
                                    imagetimemessage(tag.image.metadata.creationTimestamp)
                                    if (tag.image.dockerImageMetadata.Config.ExposedPorts) {
                                        imageportmessage(tag.image.dockerImageMetadata.Config.ExposedPorts)
                                    }

                                    $scope.curl = $scope.checked.image;
                                    //if (!$scope.dc.metadata.name) {
                                    //    $scope.dc.metadata.name=$scope.checked.image;
                                    //}
                                    //$scope.dc.spec.template.spec.containers[0].annotate = {
                                    //    image: $scope.checked.image,
                                    //    tag: $scope.checked.tag
                                    //}
                                    //$scope.dc.spec.template.spec.containers[0].annotate.ismy = true

                                    //$scope.dc.spec.template.spec.containers[0].name = $scope.checked.image
                                    $scope.fuwuname = $scope.checked.image;

                                    //tag.image.
                                    angular.forEach($scope.istag.items, function (istag, i) {
                                        if (istag.image.metadata.name === tag.image.metadata.name) {
                                            //console.log(istag.image.dockerImageReference);
                                            $scope.imagetext = istag.image.dockerImageReference;
                                        }
                                    })
                                    //$scope.showall = true;

                                    //$scope.dc.metadata.labels[0].value = $scope.fuwuname;

                                })
                            }

                            $scope.ok = function () {
                                //$scope.
                                if ($scope.check === 1) {
                                    $uibModalInstance.close($scope.checked);
                                } else {
                                    $uibModalInstance.close($scope.checked);
                                }

                            };
                            $scope.cancel = function () {
                                $uibModalInstance.dismiss();
                            };
                        }]
                }).result;
            };
        }])
        .service('ChooseSecret', ['$uibModal', function ($uibModal) {
            this.open = function (olength, secretsobj) {
                return $uibModal.open({
                    templateUrl: 'pub/tpl/choosSecret.html',
                    size: 'default',
                    backdrop: 'static',
                    controller: ['by', '$scope', '$uibModalInstance', '$log', 'secretskey', '$rootScope', 'configmaps', 'persistent', '$state',
                        function (by, $scope, $uibModalInstance, $log, secretskey, $rootScope, configmaps, persistent, $state) {
                            $scope.secretarr = secretsobj.secretarr;
                            $scope.configmap = secretsobj.configmap;
                            $scope.persistentarr = secretsobj.persistentarr;
                            //$scope.outerIndex;
                            $scope.isok = false;
                            $scope.grid = {
                                secretarr: {
                                    kong: false,
                                    chongfu: false,
                                    buhefa: false
                                },
                                configmap: {
                                    kong: false,
                                    chongfu: false,
                                    buhefa: false
                                },
                                persistentarr: {
                                    kong: false,
                                    chongfu: false,
                                    buhefa: false
                                }
                            };
                            $scope.obj = {
                                secretarr: $scope.secretarr,
                                configmap: $scope.configmap,
                                persistentarr: $scope.persistentarr
                            };
                            $scope.$watch('obj', function (n, o) {
                                if (n == o) {
                                    return
                                }
                                if ($scope.grid.change) {
                                    $scope.grid.change = false;
                                    return
                                }
                                var kong = false;
                                var r = /^\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i;
                                var obj = angular.copy(n);
                                angular.forEach(obj, function (items, i) {
                                    items.sort(by.open("mountPath"));
                                    if (!kong) {
                                        angular.forEach(items, function (item, k) {
                                            if (item.secret && item.secret.secretName == '名称') {
                                                $scope.grid[i].kong = true;
                                                kong = true
                                            }
                                            if (item.configMap && item.configMap.name == '名称') {
                                                $scope.grid[i].kong = true;
                                                kong = true
                                            }
                                            if (item.persistentVolumeClaim && item.persistentVolumeClaim.claimName == '名称') {
                                                $scope.grid[i].kong = true;
                                                kong = true
                                            }
                                            if (item.mountPath !== '') {
                                                if (!r.test(item.mountPath)) {
                                                    //alert('bhf')
                                                    $scope.grid[i].buhefa = true;
                                                    kong = true
                                                }
                                                if (items[k] && items[k + 1]) {
                                                    if (items[k].mountPath == items[k + 1].mountPath) {
                                                        //alert('cf')
                                                        $scope.grid[i].chongfu = true;
                                                        kong = true
                                                    }
                                                }
                                            } else {
                                                kong = true
                                            }


                                        })
                                    }
                                    if (!kong) {
                                        $scope.grid[i].chongfu = false;
                                        $scope.grid[i].buhefa = false;
                                        $scope.grid[i].kong = false;
                                    }
                                });
                                if (!kong) {
                                    $scope.isok = true
                                } else {
                                    $scope.isok = false
                                }
                                //console.log('==================nnnnnn',n);
                            }, true);
                            ////添加密钥卷
                            $scope.addsecretarr = function () {
                                $scope.grid.change = true;
                                $scope.secretarr.push({
                                    "myname": "",
                                    "secret": {
                                        "secretName": '名称'
                                    },
                                    mountPath: ''
                                });
                            };
                            ////删除密钥卷
                            $scope.delsecretarr = function (idx) {
                                $scope.secretarr.splice(idx, 1);
                            };
                            $scope.changesecrename = function (idx, val) {
                                $scope.secretarr[idx].secret.secretName = val
                            };
                            ////获取密钥卷列表
                            var loadsecretsList = function () {
                                secretskey.get({
                                    namespace: $rootScope.namespace,
                                    region: $rootScope.region
                                }, function (res) {
                                    //console.log('-------loadsecrets', res);
                                    if (res.items) {
                                        $scope.loadsecretsitems = res.items;
                                    }
                                })
                            };
                            loadsecretsList();

                            //////配置卷
                            ///获取配置卷列表////
                            var loadconfigmaps = function () {
                                configmaps.get({
                                    namespace: $rootScope.namespace,
                                    region: $rootScope.region
                                }, function (res) {
                                    if (res.items) {
                                        $scope.configmapitem = res.items;
                                    }
                                })
                            };
                            loadconfigmaps();

                            ///添加配置卷  ///
                            $scope.addconfigmap = function () {
                                $scope.grid.change = true;
                                $scope.configmap.push({
                                    "myname": "",
                                    "configMap": {
                                        "name": '名称'
                                    },
                                    mountPath: ''
                                });
                            };
                            ////////删除配置卷
                            $scope.delconfigmap = function (idx) {
                                $scope.configmap.splice(idx, 1);
                            };
                            $scope.changeconfigname = function (idx, val) {
                                $scope.configmap[idx].configMap.name = val
                            };
                            ////////存储卷

                            ///获取存储卷

                            var loadpersistent = function () {

                                persistent.get({namespace: $rootScope.namespace}, function (res) {
                                    if (res.items) {
                                        //console.log(res);
                                        $scope.persistentitem = [];
                                        angular.forEach(res.items, function (item, i) {
                                            if (item.status.phase == "Bound") {
                                                $scope.persistentitem.push(item)
                                            }
                                        });
                                        //$scope.persistentitem = res.items;
                                    }
                                })
                            };
                            loadpersistent();
                            //////添加存储卷
                            $scope.addpersistent = function () {
                                $scope.grid.change = true;
                                $scope.persistentarr.push({
                                    "myname": "",
                                    "persistentVolumeClaim": {
                                        "claimName": '名称'
                                    },
                                    mountPath: ''
                                });
                            };
                            ///删除存储卷
                            $scope.delpersistent = function (idx) {
                                $scope.persistentarr.splice(idx, 1);
                            };
                            $scope.changepersistentname = function (idx, val) {
                                $scope.persistentarr[idx].persistentVolumeClaim.claimName = val
                            };
                            $scope.govolume = function (path) {

                                $state.go(path);
                                $uibModalInstance.dismiss();
                            };
                            ///  确定选择所选挂载卷
                            $scope.ok = function () {
                                var thisvolumes = [];
                                var thisvolumeMounts = [];
                                for (var i = 0; i < $scope.secretarr.length; i++) {
                                    var volumeval = {
                                        "name": "volumes" + (i + olength),
                                        "secret": {
                                            "secretName": $scope.secretarr[i].secret.secretName
                                        }

                                    };
                                    var mountsval = {
                                        "name": "volumes" + (i + olength),
                                        "mountPath": $scope.secretarr[i].mountPath
                                    };
                                    if ($scope.secretarr[i].secret.secretName == '名称' || !$scope.secretarr[i].mountPath) {
                                        //alert('密钥卷不能为空')
                                        return;
                                    }
                                    thisvolumes.push(volumeval);
                                    thisvolumeMounts.push(mountsval)
                                }
                                for (var j = 0; j < $scope.configmap.length; j++) {
                                    var volumeval = {
                                        "name": "volumes" + (j + olength + $scope.secretarr.length),
                                        "configMap": {
                                            "name": $scope.configmap[j].configMap.name
                                        }

                                    };
                                    var mountsval = {
                                        "name": "volumes" + (j + olength + $scope.secretarr.length),
                                        "mountPath": $scope.configmap[j].mountPath
                                    };
                                    if ($scope.configmap[j].configMap.name == '名称' || !$scope.configmap[j].mountPath) {
                                        //alert('2不能为空')
                                        return;
                                    }
                                    thisvolumes.push(volumeval);
                                    thisvolumeMounts.push(mountsval);
                                }
                                for (var j = 0; j < $scope.persistentarr.length; j++) {
                                    var volumeval = {
                                        "name": "volumes" + (j + olength + $scope.secretarr.length + $scope.configmap.length),
                                        "persistentVolumeClaim": {
                                            "claimName": $scope.persistentarr[j].persistentVolumeClaim.claimName
                                        }

                                    };
                                    var mountsval = {
                                        "name": "volumes" + (j + olength + $scope.secretarr.length + $scope.configmap.length),
                                        "mountPath": $scope.persistentarr[j].mountPath
                                    };
                                    //console.log('$scope.persistentarr[j].mountPath', $scope.persistentarr[j].mountPath)
                                    if ($scope.persistentarr[j].persistentVolumeClaim.claimName == '名称' || !$scope.persistentarr[j].mountPath) {
                                        //alert('3不能为空')
                                        return;
                                    }

                                    thisvolumes.push(volumeval);
                                    thisvolumeMounts.push(mountsval);
                                }
                                $uibModalInstance.close({
                                    arr1: thisvolumes,
                                    arr2: thisvolumeMounts,
                                    arr3: {
                                        "secretarr": $scope.secretarr,
                                        "configmap": $scope.configmap,
                                        "persistentarr": $scope.persistentarr
                                    }
                                });
                            };
                            $scope.cancel = function () {
                                //$uibModalInstance.close();
                                //$scope.secretarr=[]
                                //$scope.configmap=[]
                                //$scope.persistentarr=[]
                                $uibModalInstance.dismiss('cancel');
                            };
                        }
                    ]
                }).result
            }
        }])
        .service('ModalPullImage', ['$rootScope', '$uibModal', 'clipboard', function ($rootScope, $uibModal, clipboard) {
            this.open = function (name, yuorself) {
                return $uibModal.open({
                    templateUrl: 'pub/tpl/modal_pull_image.html',
                    size: 'default',
                    keyboard: false,
                    controller: ['$scope', '$uibModalInstance', '$log', 'Cookie', 'GLOBAL',
                        function ($scope, $uibModalInstance, $log, Cookie, GLOBAL) {
                            //console.log(name)
                            //if (!yuorself) {
                            //    $scope.name = name.split('/')[1] ? name.split(':')[0] + ':' + name.split(':')[1].split('/')[1] : name;
                            //
                            //} else {
                            $scope.copyCon = '复制';
                            var names = name;
                            //}

                            var tokens = Cookie.get('df_access_token').split(',');
                            var token = tokens[0];
                            if (yuorself == 'project') {
                                $scope.name = name;
                                $scope.privateurl = GLOBAL.private_url;

                                //docker login -u chaizs -p xxzxczxadasd registry.dataos.io && docker pull
                                $scope.cmd = 'docker login -u ' + Cookie.get('namespace') + ' -p ' + token + ' ' + GLOBAL.private_url + ' && docker pull ' + GLOBAL.private_url + '/' + $rootScope.namespace + '/' + $scope.name;
                            } else {
                                $scope.privateurl = GLOBAL.common_url;
                                $scope.name = name;
                                $scope.cmd = 'docker pull ' + GLOBAL.common_url + '/' + $scope.name;
                            }

                            $scope.cancel = function () {
                                $uibModalInstance.dismiss();
                            };
                            $scope.success = function () {
                                $log.info('Copied!');
                                $scope.copyCon = '已复制';
                                //$uibModalInstance.close(true);
                            };
                            $scope.fail = function (err) {
                                $scope.tip = '该浏览器不支持复制，请手动选中输入框中内容，通过 Ctrl+C 复制';
                                $log.error('Error!', err);
                            };
                        }
                    ]
                }).result;
            };
        }])
        .service('ImageSelect', ['$uibModal', function ($uibModal) {
            this.open = function () {
                return $uibModal.open({
                    templateUrl: 'pub/tpl/modal_choose_image.html',
                    size: 'default modal-lg',
                    controller: ['pubregistrytag', 'pubregistry', 'platform', 'regpro', '$rootScope', '$scope', '$uibModalInstance', 'images', 'ImageStreamTag', 'ImageStream', '$http', 'platformlist', 'Sort',
                        function (pubregistrytag, pubregistry, platform, regpro, $rootScope, $scope, $uibModalInstance, images, ImageStreamTag, ImageStream, $http, platformlist, Sort) {
                            //console.log('images', images);
                            $scope.grid = {
                                cat: 0,
                                image: null,
                                version_x: null,
                                version_y: null
                            };
                            $scope.cansever = false;
                            $scope.$watch('grid', function (n, o) {
                                if (n == o) {
                                    return
                                }
                                //console.log(n);

                                if (n.image === 0 && !$scope.imageTags) {
                                    $scope.isxs = true
                                } else if (n.image && !$scope.imageTags) {
                                    $scope.isxs = true
                                } else {
                                    $scope.isxs = false
                                }
                                //console.log(n.image,$scope.imageTags,$scope.isxs);
                                if (n.image || n.image === 0) {
                                    if (n.version_x || n.version_x === 0) {
                                        $scope.cansever = true
                                    } else {
                                        $scope.cansever = false
                                    }

                                } else {
                                    $scope.cansever = false
                                }
                            }, true);
                            $scope.test = {
                                'items': []
                            };
                            $scope.imgcon = {
                                items: []
                            };
                            $scope.$watch('imageName', function (newVal, oldVal) {
                                if (newVal != oldVal) {
                                    newVal = newVal.replace(/\\/g);
                                    if ($scope.grid.cat == 0) {
                                        angular.forEach($scope.images.items, function (image) {
                                            image.hide = !(new RegExp(newVal)).test(image.metadata.name);
                                        });
                                    } else {
                                        angular.forEach($scope.images.items, function (image) {
                                            image.hide = !(new RegExp(newVal)).test(image.name);
                                        });
                                    }
                                }
                            });
                            $scope.$watch('imageVersion', function (newVal, oldVal) {
                                if (newVal != oldVal) {
                                    newVal = newVal.replace(/\\/g);
                                    if ($scope.grid.cat == 0) {
                                        angular.forEach($scope.imageTags, function (item, i) {
                                            item.hide = !(new RegExp(newVal)).test(item.tag);
                                        });
                                    } else {
                                        angular.forEach($scope.imageTags, function (item, i) {
                                            item.hide = !(new RegExp(newVal)).test(item.tag);
                                        });
                                    }

                                }
                            });

                            $scope.images = images;
                            $scope.images.items = Sort.sort($scope.images.items, -1);
                            console.log('images', images);
                            $scope.selectCat = function (idx) {
                                $scope.imageTags = {};
                                $scope.images = {};
                                $scope.grid.image = null;
                                //console.log("1223", idx);
                                $scope.grid.cat = idx;
                                if (idx == 0) {
                                    ImageStream.get({
                                        namespace: $rootScope.namespace,
                                        region: $rootScope.region
                                    }, function (res) {
                                        $scope.images = res;
                                    })
                                } else if (idx == 1) {
                                    regpro.query({is_public: 0}, function (data) {

                                        for (var i = 0; i < data.length; i++) {
                                            platform.query({id: data[i].project_id}, function (res) {
                                                //console.log('newchange', res);
                                                if (res) {
                                                    for (var j = 0; j < res.length; j++) {
                                                        var str = {
                                                            'name': res[j]
                                                        }
                                                        $scope.test.items.push(str);
                                                    }
                                                    $scope.images = $scope.test;
                                                }
                                            })

                                        }
                                    })


                                } else if (idx == 2) {
                                    //////仓库镜像
                                    //pubregistry.get(function(data) {
                                    //    $scope.images.items = []
                                    //    angular.forEach(data.repositories, function(image, i) {
                                    //        var namespace = image.split('/')[0];
                                    //        var name = image.split('/')[1];
                                    //        //if (namespace === $rootScope.namespace) {
                                    //        //$scope.images.items.push({name:image,tags:[]})
                                    //        pubregistrytag.get({ namespace: namespace, name: name }, function(tag) {
                                    //                console.log('tag', tag);
                                    //                $scope.images.items.push(tag)
                                    //                    //$scope.images.items[i].tags=tag.tags
                                    //                    //console.log('$scope.primage', $scope.primage);
                                    //            })
                                    //            //}
                                    //
                                    //    })
                                    //
                                    //})

                                    $scope.imgcon = $scope.images;
                                }
                                console.log('$scope.images', $scope.images);
                            };

                            $scope.selectImage = function (idx) {

                                if ($scope.grid.cat == 0) {

                                    if ($scope.grid.image == idx) {
                                        $scope.grid.image = null

                                        var image = $scope.images.items[idx];
                                        angular.forEach(image.status.tags, function (item) {
                                            if (image.metadata.name) {
                                                item.ist = null;
                                            }
                                        });
                                        $scope.imageTags = null;
                                    } else {

                                        $scope.grid.image = idx;
                                        var image = $scope.images.items[idx];
                                        angular.forEach(image.status.tags, function (item) {
                                            if (image.metadata.name) {
                                                ImageStreamTag.get({
                                                    namespace: $rootScope.namespace,
                                                    name: image.metadata.name + ':' + item.tag,
                                                    region: $rootScope.region
                                                }, function (res) {
                                                    item.ist = res;
                                                }, function (res) {
                                                    //console.log("get image stream tag err", res);
                                                });
                                            }
                                        });
                                        $scope.imageTags = image.status.tags;
                                    }
                                    $scope.grid.version_x = null;
                                    $scope.grid.version_y = null;
                                    //console.log("get image stream tag err", image.status.tags);

                                    //console.log('test tag.items', $scope.imageTags)
                                } else if ($scope.grid.cat == 1) {
                                    $scope.grid.image = idx;

                                    platformlist.query({id: $scope.test.items[idx].name}, function (data) {
                                        $scope.test.items[idx].status = {};
                                        $scope.test.items[idx].status.tags = [];
                                        for (var i = 0; i < data.length; i++) {
                                            var test2 = {
                                                'tag': data[i],
                                                'items': data,
                                                'ist': {
                                                    'imagesname': $scope.test.items[idx].name + '/' + data[i],
                                                    'ispublicimage': true,
                                                    imagePullSecrets: true
                                                }
                                            };
                                            $scope.test.items[idx].status.tags.push(test2)
                                        }
                                        $scope.imageTags = $scope.test.items[idx].status.tags;
                                    })
                                } else if ($scope.grid.cat == 2) {
                                    $scope.grid.image = idx;
                                    $scope.imgcon.items[idx].status = {};
                                    $scope.imgcon.items[idx].status.tags = [];
                                    angular.forEach($scope.images.items[idx].tags, function (tag, i) {
                                        var tagmsgobj = {
                                            'tag': tag,
                                            'items': $scope.images.items[idx].tags,
                                            'ist': {
                                                'imagesname': $scope.images.items[idx].name + '/' + tag,
                                                'ispublicimage': true,
                                            }
                                        };
                                        $scope.imgcon.items[idx].status.tags.push(tagmsgobj)
                                    })
                                    $scope.imageTags = $scope.imgcon.items[idx].status.tags;

                                    //platformlist.query({id: $scope.imgcon.items[idx].name}, function (tagmsg) {
                                    //    console.log('tagmsg');
                                    //    $scope.imgcon.items[idx].status = {};
                                    //    $scope.imgcon.items[idx].status.tags = [];
                                    //    for (var i = 0; i < tagmsg.length; i++) {
                                    //        var tagmsgobj = {
                                    //            'tag': tagmsg[i],
                                    //            'items': tagmsg,
                                    //            'ist': {
                                    //                'imagesname': $scope.imgcon.items[idx].name + '/' + tagmsg[i],
                                    //                'ispublicimage': true,
                                    //            }
                                    //        };
                                    //        $scope.imgcon.items[idx].status.tags.push(tagmsgobj)
                                    //    }
                                    //    $scope.imageTags = $scope.imgcon.items[idx].status.tags;
                                    //})

                                }
                            };

                            $scope.selectVersion = function (x, y) {

                                if ($scope.grid.version_x === x && $scope.grid.version_y == y) {
                                    $scope.grid.version_x = null;
                                    $scope.grid.version_y = null;
                                } else {
                                    $scope.grid.version_x = x;
                                    $scope.grid.version_y = y;
                                }
                            };

                            $scope.cancel = function () {
                                $uibModalInstance.dismiss('cancel');
                            };
                            $scope.ok = function () {
                                //console.log("===", $scope.imageTags);
                                $uibModalInstance.close($scope.imageTags[$scope.grid.version_x].ist);
                            };
                        }
                    ],
                    resolve: {
                        images: ['$rootScope', 'ImageStream', function ($rootScope, ImageStream) {
                            return ImageStream.get({
                                namespace: $rootScope.namespace,
                                region: $rootScope.region
                            }).$promise;
                        }]
                    }
                }).result;
            }
        }])
        .service('ModalLogin', ['$rootScope', '$uibModal', function ($rootScope, $uibModal) {
            this.open = function () {
                return $uibModal.open({
                    templateUrl: 'views/login/login.html',
                    size: 'default',
                    controller: ['$scope', 'AuthService', '$uibModalInstance', 'ModalRegist',
                        function ($scope, AuthService, $uibModalInstance, ModalRegist) {
                            // $rootScope.credentials = {};
                            // $scope.login = function () {
                            //   AuthService.login($rootScope.credentials);
                            //   $uibModalInstance.close();
                            // };
                            // $scope.regist = function () {
                            //   $uibModalInstance.close();
                            //   ModalRegist.open();
                            // };
                            // $scope.cancel = function () {
                            //   $uibModalInstance.dismiss();
                            // };
                        }
                    ]
                }).result;
            }
        }])
        //registration
        .service('ModalRegist', ['$uibModal', function ($uibModal) {
            this.open = function () {
                return $uibModal.open({
                    templateUrl: 'views/login/regist.html',
                    size: 'default',
                    controller: ['$scope', 'AuthService', '$uibModalInstance', 'registration',
                        function ($scope, AuthService, $uibModalInstance, registration) {
                            $scope.credentials = {};
                            $scope.regist = function () {
                                //注册相关代码...
                                registration.regist({
                                    username: $scope.credentials.username,
                                    password: $scope.credentials.password,
                                    email: $scope.credentials.email
                                }, function (data) {
                                });
                                $uibModalInstance.close();
                            };
                            $scope.cancel = function () {
                                $uibModalInstance.dismiss();
                            };
                        }
                    ]
                }).result;
            }
        }])
        .service('ModalPwd', ['$uibModal', function ($uibModal) {
            this.open = function () {
                return $uibModal.open({
                    templateUrl: 'views/user/pwd.html',
                    size: 'default',
                    controller: ['$state', 'Cookie', 'Toast', 'pwdModify', '$scope', '$rootScope', '$uibModalInstance',
                        function ($state, Cookie, Toast, pwdModify, $scope, $rootScope, $uibModalInstance) {
                            $scope.credentials = {}
                            //console.log($rootScope);

                            $scope.$watch('credentials.oldpwd', function (n, o) {
                                if (n === o) {
                                    return
                                }
                                if (n) {
                                    $scope.pwderr = false;
                                }
                            });

                            $scope.ok = function () {
                                var possword = {
                                    oldpwd: $scope.credentials.oldpwd,
                                    pwd: $scope.credentials.pwd
                                };
                                pwdModify.change({
                                    new_password: $scope.credentials.pwd,
                                    old_password: $scope.credentials.oldpwd
                                }, function (data) {

                                    $uibModalInstance.close(possword);
                                }, function (data) {
                                    $scope.pwderr = true;
                                    //console.log('reseterr', data);
                                })

                            };

                            $scope.cancel = function () {
                                $uibModalInstance.dismiss();
                            };
                        }
                    ]
                }).result;
            };
        }])
        .service('Sort', [function () {
            this.sort = function (items, reverse) {
                if (!reverse || reverse == 0) {
                    reverse = 1;
                }
                items.sort(function (a, b) {
                    if (!a.metadata) {
                        return 0;
                    }
                    //console.log('new Date(a.metadata.creationTimestamp)).getTime()',new Date(a.metadata.creationTimestamp).getTime())

                    return reverse * ((new Date(a.metadata.creationTimestamp)).getTime() - (new Date(b.metadata.creationTimestamp)).getTime());
                });
                return items;
            };
        }])
        .service('UUID', [function () {
            var S4 = function () {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            };
            this.guid = function () {
                return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
            };
        }])
        .service('randomWord', [function () {

            this.word = function (randomFlag, min, max) {
                var str = "",
                    range = min,
                    arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

                // 随机产生
                if (randomFlag) {
                    range = Math.round(Math.random() * (max - min)) + min;
                }
                for (var i = 0; i < range; i++) {
                    var pos = Math.round(Math.random() * (arr.length - 1));
                    str += arr[pos];
                }
                return str;
            }


        }])
        .service('Cookie', [function () {
            this.set = function (key, val, expires) {
                var date = new Date();
                date.setTime(date.getTime() + expires);
                document.cookie = key + "=" + val + "; expires=" + date.toUTCString();
            };
            this.get = function (key) {
                var reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)");
                var arr = document.cookie.match(reg);
                if (arr) {
                    return (arr[2]);
                }
                return null
            };
            this.clear = function (key) {
                this.set(key, "", -1);
            };
        }])
        .service('ServiceSelect', ['$uibModal', function ($uibModal) {
            this.open = function (c) {
                return $uibModal.open({
                    templateUrl: 'views/backing_service/service_select.html',
                    size: 'default modal-foo',
                    controller: ['$log', '$rootScope', '$scope', '$uibModalInstance', 'data', function ($log, $rootScope, $scope, $uibModalInstance, data) {
                        //var curdata = angular.copy(data);

                        var curdata = angular.copy(data);

                        for (var j = 0; j < data.items.length; j++) {
                            for (var i = 0; i < c.length; i++) {
                                if (data.items[j].metadata.name == c[i].bind_deploymentconfig) {
                                    curdata.items.splice(j, 1, 'false');
                                }
                            }
                        }

                        var dclist = angular.copy(curdata);
                        dclist.items = [];
                        angular.forEach(curdata.items, function (item, i) {
                            if (item === 'false') {

                            } else {
                                dclist.items.push(item)
                            }
                            //dclist
                        });
                        $scope.dc = {
                            name: null,
                            idx: null
                        };
                        $scope.selectDc = function (idx, name) {
                            $scope.dc.idx = idx;
                            $scope.dc.name = name;
                        };
                        //$log.info('curdatacurdata', curdata);
                        $scope.data = dclist;
                        $scope.items = dclist.items;
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                        $scope.ok = function () {
                            var items = [];
                            for (var i = 0; i < $scope.data.items.length; i++) {
                                if ($scope.dc.name === $scope.data.items[i].metadata.name) {
                                    items.push($scope.data.items[i]);
                                }
                            }
                            //items.push($scope.dc.name);
                            $uibModalInstance.close(items);
                        };

                        $scope.$watch('txt', function (newVal, oldVal) {
                            if (newVal != oldVal) {
                                $scope.search(newVal);
                            }
                        });

                        $scope.search = function (txt) {
                            if (!txt) {
                                $scope.items = $scope.data.items;
                            } else {
                                $scope.items = [];
                                txt = txt.replace(/\//g, '\\/');
                                var reg = new RegExp(txt);
                                angular.forEach($scope.data.items, function (item) {
                                    if (reg.test(item.metadata.name)) {
                                        $scope.items.push(item);
                                    }
                                })
                            }
                        };
                    }],
                    resolve: {
                        data: ['$rootScope', 'DeploymentConfig', function ($rootScope, DeploymentConfig) {
                            return DeploymentConfig.get({
                                namespace: $rootScope.namespace,
                                region: $rootScope.region
                            }).$promise;
                        }]
                    }
                }).result;
            }
        }])
        .service('MetricsService', [function () {
            var midTime = function (point) {
                return point.start + (point.end - point.start) / 2;
            };

            var millicoresUsed = function (point, lastValue) {
                if (!lastValue || !point.value) {
                    return null;
                }

                if (lastValue > point.value) {
                    return null;
                }
                //console.log('lastValuelastValuelastValue',lastValue);
                var timeInMillis = point.end - point.start;
                var usageInMillis = (point.value - lastValue) / 1000000;
                return (usageInMillis / timeInMillis) * 1000;
            };

            this.normalize = function (data, metric) {
                var lastValue;
                angular.forEach(data, function (point) {
                    var value;

                    if (!point.timestamp) {
                        point.timestamp = midTime(point);
                    }

                    if (!point.value || point.value === "NaN") {
                        var avg = point.avg;
                        point.value = (avg && avg !== "NaN") ? avg : null;
                    }

                    if (metric === 'CPU') {
                        value = point.value;
                        point.value = millicoresUsed(point, lastValue);
                        lastValue = value;
                    }
                });

                data.shift();
                return data;
            };
        }])
        .service('ImageService', [function () {
            this.tag = function (container) {
                var foo = container.image.replace(/(.*\/)/, '');
                foo = foo.split(':');
                if (foo.length > 1) {
                    return foo[1];
                }
                return '';
            };

        }])
        .service('postapi', ['$rootScope', 'Route', 'DeploymentConfig', 'Service', 'BuildConfig', 'ImageStream','toastr',
            function ($rootScope, Route, DeploymentConfig, Service, BuildConfig, ImageStream,toastr) {
                this.apis = function (sendobj) {
                    //console.log('sendobj', sendobj);
                    if (sendobj.kind === 'Route') {
                        Route.create({namespace: $rootScope.namespace}, sendobj, function (res) {

                        }, function (err) {
                            toastr.error('创建Route失败', {
                                timeOut: 2000,
                                closeButton: true
                            });
                        })
                    } else if (sendobj.kind === 'DeploymentConfig') {
                        DeploymentConfig.create({namespace: $rootScope.namespace}, sendobj, function (res) {
                        }, function (err) {
                            toastr.error('创建DeploymentConfig失败', {
                                timeOut: 2000,
                                closeButton: true
                            });
                        })
                    } else if (sendobj.kind === 'Service') {
                        Service.create({namespace: $rootScope.namespace}, sendobj, function (res) {
                        }, function (err) {
                            toastr.error('创建Service失败', {
                                timeOut: 2000,
                                closeButton: true
                            });
                        })
                    } else if (sendobj.kind === 'BuildConfig') {
                        BuildConfig.create({namespace: $rootScope.namespace}, sendobj, function (res) {
                        }, function (err) {
                            toastr.error('创建BuildConfig失败', {
                                timeOut: 2000,
                                closeButton: true
                            });
                        })
                    } else if (sendobj.kind === 'ImageStream') {
                        ImageStream.create({namespace: $rootScope.namespace}, sendobj, function (res) {
                        })
                    }
                };

            }])
        .service('AuthService', ['account', '$timeout', '$q', 'orgList', '$rootScope', '$http', '$base64', 'Cookie', '$state', '$log', 'Project', 'GLOBAL', 'Alert', 'User',
            function (account, $timeout, $q, orgList, $rootScope, $http, $base64, Cookie, $state, $log, Project, GLOBAL, Alert, User) {
                this.login = function (credentials, stateParams) {
                    //console.log("login", credentials);
                    //console.log("login", stateParams);
                    credentials.region = 'cn-north-1'
                    localStorage.setItem('Auth', $base64.encode(credentials.username + ':' + credentials.password));
                    $rootScope.loding = true;
                    var deferred = $q.defer();
                    var req = {
                        method: 'GET',
                        timeout: deferred.promise,
                        url: GLOBAL.signin_uri,
                        headers: {
                            'Authorization': 'Basic ' + $base64.encode(credentials.username + ':' + credentials.password)
                        }
                    };
                    localStorage.setItem('Auth', $base64.encode(credentials.username + ':' + credentials.password));

                    var loadProject = function (name, callback) {
                        // $log.info("load project");
                        Project.get({region: credentials.region}, function (data) {
                            callback(name, data);
                            //console.log("load project success", data);

                        }, function (res) {
                            $log.info("find project err", res);
                        });
                    };

                    //try {
                    //    localStorage.getItem("code");
                    //} catch (e) {
                    //    alert(e.message);
                    //    localStorage.setItem('cade',0)
                    //}
                    //localStorage.setItem('codenum','0')
                    function denglu() {

                        $http(req).success(function (data) {
                            //var arrstr = data.join(',');
                            var arr = [];
                            //console.log(data);
                            angular.forEach(data, function (token, i) {
                                //arr.push(token.access_token)
                                var index = token.region.split('-')[2]
                                arr[index - 1] = token.access_token

                            });

                            var arrstr = arr.join(',');
                            //console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&",arrstr);
                            Cookie.set('df_access_token', arrstr, 23 * 3600 * 1000);
                            //console.log(Cookie.get('df_access_token'));

                            Cookie.set('region', credentials.region, 24 * 3600 * 1000);
                            $rootScope.region = Cookie.get('region');

                            User.get({name: '~', region: $rootScope.region}, function (res) {

                                $rootScope.user = res;
                                //localStorage.setItem('cade',null)
                                loadProject(credentials.username, function (name, data) {
                                    for (var i = 0; i < data.items.length; i++) {
                                        if (data.items[i].metadata.name == name) {
                                            $rootScope.namespace = name;
                                            angular.forEach(data.items, function (item, i) {
                                                data.items[i].sortname = item.metadata.annotations['openshift.io/display-name'] || item.metadata.name;
                                            });
                                            data.items.sort(function (x, y) {
                                                return x.sortname > y.sortname ? 1 : -1;
                                            });
                                            angular.forEach(data.items, function (project, i) {
                                                if (/^[\u4e00-\u9fa5]/i.test(project.metadata.annotations['openshift.io/display-name'])) {
                                                    //console.log(project.metadata.annotations['openshift.io/display-name']);
                                                    //data.items.push(project);
                                                    data.items.unshift(project);

                                                    data.items.splice(i + 1, 1);
                                                }
                                            });
                                            $rootScope.projects = data.items;
                                        }
                                    }
                                    localStorage.setItem("code", 1);
                                    $rootScope.loginyanzheng = false;
                                    //获取套餐
                                    $rootScope.loding = false;
                                    $state.go("console.dashboard", {namespace: $rootScope.namespace});
                                    //跳转dashboard
                                    //$state.go("console.dashboard", { namespace: $rootScope.namespace });
                                });
                                //var inputDaovoice = function () {
                                //    daovoice('init', {
                                //        app_id: "b31d2fb1",
                                //        user_id: "user.metadata.uid", // 必填: 该用户在您系统上的唯一ID
                                //        //email: "daovoice@example.com", // 选填:  该用户在您系统上的主邮箱
                                //        name: $rootScope.user.metadata.name, // 选填: 用户名
                                //        signed_up: parseInt((new Date($rootScope.user.metadata.creationTimestamp)).getTime() / 1000) // 选填: 用户的注册时间，用Unix时间戳表示
                                //    });
                                //    daovoice('update');
                                //}
                                //inputDaovoice();
                            });
                        }).error(function (data) {
                            //console.log(data);
                            //if (data.code == 401) {
                            //  //$rootScope.user=false;
                            //  $rootScope.loding = false;
                            //}
                            $state.go('login');
                            console.log('登录报错', data);
                            if (data.code === 1401) {
                                $rootScope.loding = false;
                                Alert.open('请重新登录', '用户名或密码不正确');
                                var codenum = localStorage.getItem("code");
                                //console.log(codenum);
                                if (codenum) {
                                    codenum = parseInt(codenum);
                                    codenum += 1
                                    localStorage.setItem('code', codenum);
                                    if (codenum > 3) {
                                        $rootScope.loginyanzheng = true;
                                    }

                                } else {
                                    localStorage.setItem('code', 1)
                                }
                            }
                            //var daovoicefailed = function () {
                            //    daovoice('init', {
                            //        app_id: "b31d2fb1"
                            //    });
                            //    daovoice('update');
                            //}
                            //daovoicefailed();


                            //if (data.indexOf('502') != -1) {
                            //    //$rootScope.loding = false;
                            //    //alert('超时了');
                            //    //denglu();
                            //
                            //    return;
                            //} else {
                            //
                            //
                            //
                            //
                            //}

                        });

                    }

                    denglu()
                };
            }
        ])
        .service("KeywordService", function () {

            var generateKeywords = function (filterText) {
                if (!filterText) {
                    return [];
                }
                var keywords = _.uniq(filterText.match(/\S+/g));
                // Sort the longest keyword first.
                keywords.sort(function (a, b) {
                    return b.length - a.length;
                });
                // Convert the keyword to a case-insensitive regular expression for the filter.
                return _.map(keywords, function (keyword) {
                    return new RegExp(_.escapeRegExp(keyword), "i");
                });
            };
            var filterForKeywords = function (objects, filterFields, keywords) {
                var filteredObjects = objects;
                if (_.isEmpty(keywords)) {
                    return filteredObjects;
                }
                // Find resources that match all keywords.
                angular.forEach(keywords, function (regex) {
                    var matchesKeyword = function (obj) {
                        var i;
                        for (i = 0; i < filterFields.length; i++) {
                            var value = _.get(obj, filterFields[i]);
                            if (value && regex.test(value)) {
                                return true;
                            }
                        }

                        return false;
                    };

                    filteredObjects = _.filter(filteredObjects, matchesKeyword);
                });
                return filteredObjects;
            };

            return {
                filterForKeywords: filterForKeywords,
                generateKeywords: generateKeywords
            };
        })
        .factory('AuthInterceptor', ['$rootScope', '$q', 'AUTH_EVENTS', 'Cookie', function ($rootScope, $q, AUTH_EVENTS, Cookie) {
            var CODE_MAPPING = {
                401: AUTH_EVENTS.loginNeeded,
                403: AUTH_EVENTS.httpForbidden,
                419: AUTH_EVENTS.loginNeeded,
                440: AUTH_EVENTS.loginNeeded
            };
            return {
                request: function (config) {
                    if (/^\/login/.test(config.url)) {
                        return config;
                    }
                    if (/^\/signin/.test(config.url)) {
                        return config;
                    }
                    //$rootScope.region=
                    var tokens = Cookie.get('df_access_token');
                    var regions = Cookie.get('region');
                    var token = '';
                    //console.log(tokens);

                    if (tokens && regions) {
                        var tokenarr = tokens.split(',');
                        var region = regions.split('-')[2];
                        //if (/^\/lapi\/v1\/orgs/.test(config.url)) {
                        //    console.log(config.url);
                        //}

                        if (/^\/lapi\/v1\/orgs/.test(config.url) || /^\/oapi/.test(config.url) || /^\/api/.test(config.url) || /^\/payment/.test(config.url) || /^\/v1\/repos/.test(config.url)) {

                            token = tokenarr[region - 1];
                        } else {
                            token = tokenarr[0];
                        }

                        //console.log('tokenarr', tokenarr[region-1]);
                    } else {
                        //console.log('token错误');
                    }
                    //console.log(tokens,token, regions);
                    if (config.headers && token) {
                        //console.log('window.location.pathname', window.location);
                        config.headers["Authorization"] = "Bearer " + token;
                        //config.headers["Sso"] = window.location.href;
                    }

                    if (/^\/hawkular/.test(config.url)) {
                        //console.log('config.url', config.url);
                        config.headers["Content-Type"] = "application/json";
                        config.headers["Hawkular-Tenant"] = $rootScope.namespace;
                    }
                    if (/^\/registry/.test(config.url)) {
                        var Auth = localStorage.getItem("Auth");
                        config.headers["Authorization"] = "Basic " + Auth;
                    }
                    if (config.method == 'PATCH') {
                        config.headers["Content-Type"] = "application/merge-patch+json";
                    }

                    $rootScope.loading = true;
                    return config
                },
                requestError: function (rejection) {
                    $rootScope.loading = false;
                    return $q.reject(rejection);
                },
                response: function (res) {
                    $rootScope.loading = false;
                    return res;
                },
                responseError: function (response) {
                    //alert(11)
                    $rootScope.loading = false;
                    var val = CODE_MAPPING[response.status];
                    if (val) {
                        $rootScope.$broadcast(val, response);
                    }
                    return $q.reject(response);
                }
            };
        }])
        .factory("ConversionService", function () {
            var bytesToMiB = function (value) {
                if (!value) {
                    return value;
                }

                return value / (1024 * 1024);
            };

            var bytesToKiB = function (value) {
                if (!value) {
                    return value;
                }

                return value / 1024;
            };

            var millicoresToCores = function (value) {
                if (!value) {
                    return value;
                }

                return value / 1000;
            };

            return {
                bytesToMiB: bytesToMiB,
                bytesToKiB: bytesToKiB,
                millicoresToCores: millicoresToCores
            };
        })
        .service("Navigate",['$location','$window','$timeout','annotationFilter','LabelFilter','$filter','APIService',function(
            $location,$window,$timeout,annotationFilter,LabelFilter,$filter,APIService){
            var annotation = $filter('annotation');
            var buildConfigForBuild = $filter('buildConfigForBuild');
            var isPipeline = $filter('isJenkinsPipelineStrategy');
            var displayNameFilter = $filter('displayName');

            // Get the type segment for build URLs. `resource` can be a build or build config.
            var getBuildURLType = function(resource, opts) {
                if (_.get(opts, 'isPipeline')) {
                    return "pipelines";
                }

                if (_.isObject(resource) && isPipeline(resource)) {
                    // Use "pipelines" instead of "builds" in the URL so the right nav item is highlighted
                    // for pipeline builds.
                    return "pipelines";
                }

                return "builds";
            };

            return {
                /**
                 * Navigate and display the error page.
                 *
                 * @param {type} message    The message to display to the user
                 * @param {type} errorCode  An optional error code to display
                 * @returns {undefined}
                 */
                toErrorPage: function(message, errorCode, reload) {
                    var redirect = URI('error').query({
                        error_description: message,
                        error: errorCode
                    }).toString();
                    if (!reload) {
                        // Use replace() to avoid breaking the browser back button.
                        $location.url(redirect).replace();
                    }
                    else {
                        $window.location.href = redirect;
                    }
                },

                /**
                 * Navigate and display the project overview page.
                 *
                 * @param {type} projectName  the project name
                 * @returns {undefined}
                 */
                toProjectOverview: function(projectName){
                    $location.path(this.projectOverviewURL(projectName));
                },

                /**
                 * Return the URL for the project overview
                 *
                 * @param {type}     projectName
                 * @returns {String} a URL string for the project overview
                 */
                projectOverviewURL: function(projectName){
                    return "project/" + encodeURIComponent(projectName) + "/overview";
                },

                toProjectList: function(){
                    $location.path('projects');
                },

                membershipURL: function(projectName) {
                    return "project/" + encodeURIComponent(projectName) + "/membership";
                },

                toProjectMembership: function(projectName) {
                    $location.path(this.membershipURL(projectName));
                },

                /**
                 * Return the URL for the project catalog browse page
                 *
                 * @param {Object|String}     project - Can be a project object or the project's name (string)
                 * @returns {String} a URL string for the project catalog browse page
                 */
                catalogURL: function(project) {
                    var projectName = angular.isString(project) ? project : _.get(project, 'metadata.name');
                    if (!projectName) {
                        return 'catalog';
                    }

                    return "project/" + encodeURIComponent(projectName) + "/catalog";
                },

                /**
                 * Navigate and display the project catalog browse page.
                 *
                 * @param {Object|String} project - Can be a project object or the project's name (string)
                 * @param {Object} search - optional search object (supports initial filters via a filter field)
                 * @returns {undefined}
                 */
                toProjectCatalog: function(project, search) {
                    var loc = $location.path(this.catalogURL(project));
                    if (search) {
                        loc.search(search);
                    }
                },

                quotaURL: function(projectName) {
                    return "project/" + encodeURIComponent(projectName) + "/quota";
                },

                createFromImageURL: function(imageStream, imageTag, projectName, queryParams) {
                    var createURI = URI.expand("project/{project}/create/fromimage{?q*}", {
                        project: projectName,
                        q: angular.extend ({
                            imageStream: imageStream.metadata.name,
                            imageTag: imageTag,
                            namespace: imageStream.metadata.namespace,
                            displayName: displayNameFilter(imageStream)
                        }, queryParams || {})
                    });
                    return createURI.toString();
                },

                createFromTemplateURL: function(template, projectName, queryParams) {
                    var createURI = URI.expand("project/{project}/create/fromtemplate{?q*}", {
                        project: projectName,
                        q: angular.extend ({
                            template: template.metadata.name,
                            namespace: template.metadata.namespace
                        }, queryParams || {})
                    });
                    return createURI.toString();
                },

                /**
                 * Navigate and display the next steps after creation page.
                 *
                 * @param {type} projectName  the project name
                 * @returns {undefined}
                 */
                toNextSteps: function(name, projectName, searchPart) {
                    var search = {
                        name: name
                    };

                    if (_.isObject(searchPart)) {
                        _.extend(search, searchPart);
                    }

                    $location.path("project/" + encodeURIComponent(projectName) + "/create/next").search(search);
                },

                toPodsForDeployment: function(deployment, pods) {
                    if (_.size(pods) === 1) {
                        this.toResourceURL(_.sample(pods));
                        return;
                    }
                    this.toResourceURL(deployment);
                },

                // Resource is either a resource object, or a name.  If resource is a name, kind and namespace must be specified
                // Note that builds and deployments can only have their URL built correctly (including their config in the URL)
                // if resource is an object, otherwise they will fall back to the non-nested URL.
                //
                // `opts` is for additional options. Currently only `opts.isPipeline` is supported for building URLs with a
                // pipeline path segment.
                resourceURL: function(resource, kind, namespace, action, opts) {
                    action = action || "browse";

                    if (!resource || (!resource.metadata && (!kind || !namespace))) {
                        return null;
                    }

                    // normalize based on the kind of args we got
                    if (!kind) {
                        kind = resource.kind;
                    }

                    if (!namespace) {
                        namespace = resource.metadata.namespace;
                    }

                    var name = resource;
                    if (resource.metadata) {
                        name = resource.metadata.name;
                    }

                    var url = URI("")
                        .segment("project")
                        .segmentCoded(namespace)
                        .segment(action);

                    switch(kind) {
                        case "Build":
                            var buildConfigName = $filter('buildConfigForBuild')(resource);
                            var typeSegment = getBuildURLType(resource, opts);
                            if (buildConfigName) {
                                url.segment(typeSegment)
                                    .segmentCoded(buildConfigName)
                                    .segmentCoded(name);
                            }
                            else {
                                url.segment(typeSegment + "-noconfig")
                                    .segmentCoded(name);
                            }
                            break;
                        case "BuildConfig":
                            url.segment(getBuildURLType(resource, opts))
                                .segmentCoded(name);
                            break;
                        case "ConfigMap":
                            url.segment('config-maps')
                                .segmentCoded(name);
                            break;
                        case "Deployment":
                            url.segment("deployment")
                                .segmentCoded(name);
                            break;
                        case "DeploymentConfig":
                            url.segment("dc")
                                .segmentCoded(name);
                            break;
                        case "ReplicaSet":
                            url.segment("rs")
                                .segmentCoded(name);
                            break;
                        case "ReplicationController":
                            url.segment("rc")
                                .segmentCoded(name);
                            break;
                        case "ImageStream":
                            url.segment("images")
                                .segmentCoded(name);
                            break;
                        case "ImageStreamTag":
                            var ind = name.indexOf(':');
                            url.segment("images")
                                .segmentCoded(name.substring(0, ind))
                                .segmentCoded(name.substring(ind + 1));
                            break;
                        case "ServiceInstance":
                            url.segment("service-instances")
                                .segmentCoded(name);
                            break;
                        case "StatefulSet":
                            url.segment("stateful-sets")
                                .segmentCoded(name);
                            break;
                        case "PersistentVolumeClaim":
                        case "Pod":
                        case "Route":
                        case "Secret":
                        case "Service":
                            url.segment(APIService.kindToResource(kind))
                                .segmentCoded(name);
                            break;
                        default:
                            var rgv;
                            if (resource.metadata) {
                                rgv = APIService.objectToResourceGroupVersion(resource);
                            }
                            else if (_.get(opts, "apiVersion")) {
                                var r = APIService.kindToResource(kind);
                                var gv = APIService.parseGroupVersion(opts.apiVersion);
                                gv.resource = r;
                                rgv = APIService.toResourceGroupVersion(gv);
                            }
                            else {
                                rgv = APIService.toResourceGroupVersion(APIService.kindToResource(kind));
                            }
                            var apiInfo = APIService.apiInfo(rgv);
                            if (!apiInfo) {
                                // This is not an API object we know about from discovery
                                // We won't be able to navigate to it in Other Resources
                                return null;
                            }
                            url.segment("other")
                                .search({
                                    kind: kind,
                                    group: rgv.group
                                });
                    }

                    if (_.get(opts, "tab")) {
                        url.setSearch("tab", opts.tab);
                    }

                    return url.toString();
                },

                // Navigate to the URL of the resource
                toResourceURL: function (resource) {
                    $location.url(this.resourceURL(resource));
                },

                // Returns the build config URL for a build or the deployment config URL for a deployment.
                configURLForResource: function(resource, /* optional */ action) {
                    var bc, dc,
                        kind = _.get(resource, 'kind'),
                        namespace = _.get(resource, 'metadata.namespace');
                    if (!kind || !namespace) {
                        return null;
                    }

                    switch (kind) {
                        case 'Build':
                            bc = buildConfigForBuild(resource);
                            if (!bc) {
                                return null;
                            }

                            return this.resourceURL(bc, 'BuildConfig', namespace, action, {
                                isPipeline: isPipeline(resource)
                            });

                        case 'ReplicationController':
                            dc = annotation(resource, 'deploymentConfig');
                            if (!dc) {
                                return null;
                            }
                            return this.resourceURL(dc, 'DeploymentConfig', namespace, action);
                    }

                    return null;
                },

                resourceListURL: function(resource, projectName) {
                    var routeMap = {
                        'builds': 'builds',
                        'buildconfigs': 'builds',
                        'configmaps': 'config-maps',
                        'deployments': 'deployments',
                        'deploymentconfigs': 'deployments',
                        'imagestreams': 'images',
                        'pods': 'pods',
                        'replicasets': 'deployments',
                        'replicationcontrollers': 'deployments',
                        'routes': 'routes',
                        'secrets': 'secrets',
                        'services': 'services',
                        'serviceinstances': 'service-instances',
                        'persistentvolumeclaims': 'storage',
                        'statefulsets' : 'stateful-sets'
                    };

                    return URI.expand("project/{projectName}/browse/{browsePath}", {
                        projectName: projectName,
                        browsePath: routeMap[resource]
                    }).toString();
                },

                /**
                 * Navigate to a list view for a resource type
                 *
                 * @param {String} resource      the resource (e.g., builds or replicationcontrollers)
                 * @param {String} projectName   the project name
                 * @returns {undefined}
                 */
                toResourceList: function(resource, projectName) {
                    $location.url(this.resourceListURL(resource, projectName));
                },

                yamlURL: function(object, returnURL) {
                    if (!object) {
                        return '';
                    }

                    var groupVersion = APIService.parseGroupVersion(object.apiVersion);
                    return URI.expand("project/{projectName}/edit/yaml?kind={kind}&name={name}&group={group}&returnURL={returnURL}", {
                        projectName: object.metadata.namespace,
                        kind: object.kind,
                        name: object.metadata.name,
                        group: groupVersion.group || '',
                        returnURL: returnURL || ''
                    }).toString();
                },

                healthCheckURL: function(projectName, kind, name, group) {
                    return URI.expand("project/{projectName}/edit/health-checks?kind={kind}&name={name}&group={group}", {
                        projectName: projectName,
                        kind: kind,
                        name: name,
                        group: group || ''
                    }).toString();
                }
            };
        }])
        .factory("BuildsService",['$filter','$q','APIService','DataService','Navigate','NotificationsService',function(
            $filter,$q,APIService,DataService,Navigate,NotificationsService) {

            var buildConfigsInstantiateVersion = APIService.getPreferredVersion('buildconfigs/instantiate');
            var buildsCloneVersion = APIService.getPreferredVersion('builds/clone');

            var annotation = $filter('annotation');
            var buildConfigForBuild = $filter('buildConfigForBuild');
            var getErrorDetails = $filter('getErrorDetails');
            var isIncompleteBuild = $filter('isIncompleteBuild');
            var isJenkinsPipelineStrategy = $filter('isJenkinsPipelineStrategy');
            var isNewer = $filter('isNewerResource');

            var getBuildNumber = function(build) {
                var buildNumber = annotation(build, 'buildNumber') || parseInt(build.metadata.name.match(/(\d+)$/), 10);
                if (isNaN(buildNumber)) {
                    return null;
                }

                return buildNumber;
            };

            var getBuildDisplayName = function(build, buildConfigName) {
                var buildNumber = getBuildNumber(build);
                if (buildConfigName && buildNumber) {
                    return buildConfigName + " #" + buildNumber;
                }

                return build.metadata.name;
            };

            var startBuild = function(buildConfig) {
                var buildType = isJenkinsPipelineStrategy(buildConfig) ? 'pipeline' : 'build';
                var req = {
                    kind: "BuildRequest",
                    apiVersion: APIService.toAPIVersion(buildConfigsInstantiateVersion),
                    metadata: {
                        name: buildConfig.metadata.name
                    }
                };

                var context = {
                    namespace: buildConfig.metadata.namespace
                };
                return DataService.create(buildConfigsInstantiateVersion, buildConfig.metadata.name, req, context).then(function(build) {
                    var message, details;
                    var displayName = getBuildDisplayName(build, buildConfig.metadata.name);
                    var runPolicy = _.get(buildConfig, 'spec.runPolicy');
                    if (runPolicy === 'Serial' || runPolicy === 'SerialLatestOnly') {
                        message = _.capitalize(buildType) + " " + displayName + " successfully queued.";
                        details = "Builds for " + buildConfig.metadata.name + " are configured to run one at a time.";
                    } else {
                        message = _.capitalize(buildType) + " " + displayName + " successfully created.";
                    }
                    NotificationsService.addNotification({
                        type: "success",
                        message: message,
                        details: details,
                        links: [{
                            href: Navigate.resourceURL(build),
                            label: "View Build"
                        }]
                    });
                }, function(result) {
                    NotificationsService.addNotification({
                        type: "error",
                        message: "An error occurred while starting the " + buildType + ".",
                        details: getErrorDetails(result)
                    });

                    return $q.reject(result);
                });
            };

            var cancelBuild = function(build, buildConfigName) {
                var buildType = isJenkinsPipelineStrategy(build) ? 'pipeline' : 'build';
                var displayName = getBuildDisplayName(build, buildConfigName);
                var context = {
                    namespace: build.metadata.namespace
                };
                var canceledBuild = angular.copy(build);
                var rgv = APIService.objectToResourceGroupVersion(canceledBuild);
                canceledBuild.status.cancelled = true;

                return DataService.update(rgv, canceledBuild.metadata.name, canceledBuild, context).then(function() {
                    NotificationsService.addNotification({
                        type: "success",
                        message: _.capitalize(buildType) + " " + displayName + " successfully cancelled."
                    });
                }), function(result) {
                    NotificationsService.addNotification({
                        type: "error",
                        message: "An error occurred cancelling " + buildType + " " + displayName + ".",
                        details: getErrorDetails(result)
                    });

                    return $q.reject(result);
                };
            };

            var cloneBuild = function(originalBuild, buildConfigName) {
                var buildType = isJenkinsPipelineStrategy(originalBuild) ? 'pipeline' : 'build';
                var originalDisplayName = getBuildDisplayName(originalBuild, buildConfigName);

                var req = {
                    kind: "BuildRequest",
                    apiVersion: APIService.toAPIVersion(buildsCloneVersion),
                    metadata: {
                        name: originalBuild.metadata.name
                    }
                };
                var context = {
                    namespace: originalBuild.metadata.namespace
                };

                return DataService.create(buildsCloneVersion, originalBuild.metadata.name, req, context).then(function(clonedBuild) {
                    var clonedDisplayName = getBuildDisplayName(clonedBuild, buildConfigName);
                    NotificationsService.addNotification({
                        type: "success",
                        message: _.capitalize(buildType) + " " + originalDisplayName + " is being rebuilt as " + clonedDisplayName + ".",
                        links: [{
                            href: Navigate.resourceURL(clonedBuild),
                            label: "View Build"
                        }]
                    });
                }, function(result) {
                    NotificationsService.addNotification({
                        type: "error",
                        message: "An error occurred while rerunning " + buildType + " " + originalDisplayName + ".",
                        details: getErrorDetails(result)
                    });

                    return $q.reject();
                });
            };

            var isPaused = function(buildConfig) {
                return annotation(buildConfig, "openshift.io/build-config.paused") === 'true';
            };

            var canBuild = function(buildConfig) {
                if (!buildConfig) {
                    return false;
                }
                if (buildConfig.metadata.deletionTimestamp) {
                    return false;
                }
                if (isPaused(buildConfig)) {
                    return false;
                }
                return true;
            };

            // TODO: Generalize for other kinds since the annotation is generic.
            var usesDeploymentConfigs = function(buildConfig) {
                var uses = annotation(buildConfig, 'pipeline.alpha.openshift.io/uses');
                if (!uses) {
                    return [];
                }
                try {
                    uses = JSON.parse(uses);
                } catch(e) {
                    Logger.warn('Could not parse "pipeline.alpha.openshift.io/uses" annotation', e);
                    return;
                }

                var depoymentConfigs = [];
                _.each(uses, function(resource) {
                    if (!resource.name) {
                        return;
                    }
                    if (resource.namespace && resource.namespace !== _.get(buildConfig, 'metadata.namespace')) {
                        return;
                    }
                    if (resource.kind !== 'DeploymentConfig') {
                        return;
                    }
                    depoymentConfigs.push(resource.name);
                });

                return depoymentConfigs;
            };

            // Returns a map of only the builds that belong to a particular build config, needed
            // because we can't filter our watch on the annotation, only on the potentially truncated label
            // Assumes the builds were already pre-filtered based on the label.
            var validatedBuildsForBuildConfig = function(buildConfigName, builds) {
                return _.pickBy(builds, function(build){
                    var buildCfgAnnotation = annotation(build, 'buildConfig');
                    return !buildCfgAnnotation || buildCfgAnnotation === buildConfigName;
                });
            };

            var latestBuildByConfig = function(builds, /* optional */ filter) {
                var latestByConfig = {};
                _.each(builds, function(build) {
                    var buildConfigName = buildConfigForBuild(build) || "";
                    if (filter && !filter(build)) {
                        return;
                    }

                    if (isNewer(build, latestByConfig[buildConfigName])) {
                        latestByConfig[buildConfigName] = build;
                    }
                });

                return latestByConfig;
            };

            var getStartTimestsamp = function(build) {
                return build.status.startTimestamp || build.metadata.creationTimestamp;
            };

            var nsToMS = function(duration) {
                // build.duration is returned in nanoseconds. Convert to ms.
                // 1000 nanoseconds per microsecond
                // 1000 microseconds per millisecond
                return _.round(duration / 1000 / 1000);
            };

            var getDuration = function(build) {
                // Use build.status.duration if available.
                var duration = _.get(build, 'status.duration');
                if (duration) {
                    // Convert duration from ns to ms.
                    return nsToMS(duration);
                }

                // Fall back to comparing start timestamp to end timestamp.
                var startTimestamp = getStartTimestsamp(build);
                var endTimestamp = build.status.completionTimestamp;
                if (!startTimestamp || !endTimestamp) {
                    return 0;
                }

                return moment(endTimestamp).diff(moment(startTimestamp));
            };

            var incompleteBuilds = function(builds) {
                return _.map(builds, function(build) {
                    return isIncompleteBuild(build);
                });
            };

            var completeBuilds = function(builds) {
                return _.map(builds, function(build) {
                    return !isIncompleteBuild(build);
                });
            };

            var lastCompleteByBuildConfig = function(builds) {
                return _.reduce(
                    builds,
                    function(result, build) {
                        if(isIncompleteBuild(build)) {
                            return result;
                        }
                        var bc = $filter('annotation')(build, 'buildConfig');
                        if(isNewer(build, result[bc])) {
                            result[bc] = build;
                        }
                        return result;
                    }, {});

            };

            // result: incomplete builds + the single latest build for each build config.
            var interestingBuilds = function(builds) {
                var latestCompleteByConfig = {};
                var incompleteBuilds = _.filter(
                    builds,
                    function(build) {
                        if(isIncompleteBuild(build)) {
                            return true;
                        }
                        // for efficiency, since we have a loop, if the build is
                        // complete we can build a map of latest complete builds by bcs
                        var bc = $filter('annotation')(build, 'buildConfig');
                        if(isNewer(build, latestCompleteByConfig[bc])) {
                            latestCompleteByConfig[bc] = build;
                        }
                    });
                // in the end we want a single list for ng-repeating
                return incompleteBuilds
                    .concat(
                        _.map(
                            latestCompleteByConfig,
                            function(build) {
                                return build;
                            }));
            };

            var imageObjectRef = $filter('imageObjectRef');
            var groupBuildConfigsByOutputImage = function(buildConfigs) {
                var buildConfigsByOutputImage = {};
                _.each(buildConfigs, function(buildConfig) {
                    var outputImage = _.get(buildConfig, 'spec.output.to');
                    var ref = imageObjectRef(outputImage, buildConfig.metadata.namespace);
                    if (!ref) {
                        return;
                    }

                    buildConfigsByOutputImage[ref] = buildConfigsByOutputImage[ref] || [];
                    buildConfigsByOutputImage[ref].push(buildConfig);
                });

                return buildConfigsByOutputImage;
            };

            // Sort by date first, falling back to build number in case two builds
            // have the same date.
            var sortBuilds = function(builds, descending) {
                var compareNumbers = function(left, right) {
                    var leftNumber = getBuildNumber(left);
                    var rightNumber = getBuildNumber(right);

                    // Fall back to names if no numbers.
                    var leftName, rightName;
                    if (!leftNumber && !rightNumber) {
                        leftName = _.get(left, 'metadata.name', '');
                        rightName = _.get(right, 'metadata.name', '');
                        if (descending) {
                            return rightName.localeCompare(leftName);
                        }
                        return leftName.localeCompare(rightName);
                    }

                    if (!leftNumber) {
                        return descending ? 1 : -1;
                    }

                    if (!rightNumber) {
                        return descending ? -1 : 1;
                    }

                    if (descending) {
                        return rightNumber - leftNumber;
                    }

                    return leftNumber - rightNumber;
                };

                var compareDates = function(left, right) {
                    var leftDate = _.get(left, 'metadata.creationTimestamp', '');
                    var rightDate = _.get(right, 'metadata.creationTimestamp', '');

                    // If the builds have identical dates, sort by number.
                    if (leftDate === rightDate) {
                        return compareNumbers(left, right);
                    }

                    // The date format can be sorted using straight string comparison.
                    // Example Date: 2016-02-02T21:53:07Z
                    if (descending) {
                        return rightDate.localeCompare(leftDate);
                    }

                    return leftDate.localeCompare(rightDate);
                };

                // Compare dates, falling back to build number, then name, if dates are the same.
                return _.toArray(builds).sort(compareDates);
            };

            var getJenkinsStatus = function(pipelineBuild) {
                var json = annotation(pipelineBuild, 'jenkinsStatus');
                if (!json) {
                    return null;
                }

                try {
                    return JSON.parse(json);
                } catch (e) {
                    Logger.error('Could not parse Jenkins status as JSON', json);
                    return null;
                }
            };

            var getCurrentStage = function(pipelineBuild) {
                var jenkinsStatus = getJenkinsStatus(pipelineBuild);
                var stages = _.get(jenkinsStatus, 'stages', []);
                return _.last(stages);
            };

            return {
                startBuild: startBuild,
                cancelBuild: cancelBuild,
                cloneBuild: cloneBuild,
                isPaused: isPaused,
                canBuild: canBuild,
                usesDeploymentConfigs: usesDeploymentConfigs,
                validatedBuildsForBuildConfig: validatedBuildsForBuildConfig,
                latestBuildByConfig: latestBuildByConfig,
                getBuildNumber: getBuildNumber,
                getBuildDisplayName: getBuildDisplayName,
                getStartTimestsamp: getStartTimestsamp,
                getDuration: getDuration,
                incompleteBuilds: incompleteBuilds,
                completeBuilds: completeBuilds,
                lastCompleteByBuildConfig: lastCompleteByBuildConfig,
                interestingBuilds: interestingBuilds,
                groupBuildConfigsByOutputImage: groupBuildConfigsByOutputImage,
                sortBuilds: sortBuilds,
                getJenkinsStatus: getJenkinsStatus,
                getCurrentStage: getCurrentStage
            };
        }]
        )
        .component('uiAceYaml', {
            controller: [
                '$scope',
                '$rootScope',
                UIAceYAML
            ],
            controllerAs: '$ctrl',
            bindings: {
                hideHint:'<',
                resource: '=',
                ngRequired: '<?',
                showFileInput: '<?'
            },
            templateUrl: 'views/directives/ui-ace-yaml.html'
        })
    function UIAceYAML($scope,$rootScope) {
        var ctrl = this;
        var aceEditor;
        var parseYAML = function (strict) {
            // https://github.com/nodeca/js-yaml#safeload-string---options-
            return jsyaml.safeLoad(ctrl.model, {
                // If `strict` is false, allow duplicate keys in the YAML for
                // compability with `oc create` using the js-yaml `json` option. This
                // also lets us parse JSON as YAML, where duplicate keys are allowed.
                json: !strict
            });
        };
        var clearAnnotations = function () {
            aceEditor.getSession().clearAnnotations();
            $scope.$evalAsync(function () {
                ctrl.annotations = {};
            });
        };
        var setAnnotation = function (e, severity) {
            var session = aceEditor.getSession();
            var length = session.getLength();
            var row = _.get(e, 'mark.line', 0);
            var col = _.get(e, 'mark.column', 0);
            var message = e.message || 'Could not parse content.';
            // If the error line is reported as being after the last line, use the
            // last line. This can happen when the error is at the very end of the
            // document and the user doesn't have a final newline.
            if (row >= length) {
                row = length - 1;
            }

            var annotation = {
                row: row,
                column: col,
                text: message,
                type: severity
            };
            session.setAnnotations([annotation]);
            $scope.$evalAsync(function () {
                ctrl.annotations = {};
                ctrl.annotations[severity] = [annotation];
            });
        };

        var setValid = function (valid) {
            $scope.$evalAsync(function () {
                // ctrl.form.$setValidity('yamlValid', valid);
            });
        };

        var updated = function (current, previous) {
            var resource;
            // Check for errors, then check for warnings.
            try {
                resource = parseYAML(false);
                setValid(true);

                // Only update `ctrl.resource` if the value has changed.
                if (current !== previous) {
                    ctrl.resource = resource;
                }
                // Check for warnings.
                try {
                    parseYAML(true);
                    clearAnnotations();
                    $rootScope.$broadcast('yaml-update-result',{
                        type: 'success'
                    });
                } catch (e) {
                    $rootScope.$broadcast('yaml-update-result',{
                        type: 'warning',
                        info: e
                    });
                    setAnnotation(e, 'warning');
                }
            } catch (e) {
                $rootScope.$broadcast('yaml-update-result',{
                    type: 'error',
                    info: e
                });
                // console.log('eeeeeee',e);
                setAnnotation(e, 'error');
                setValid(false);
            }
        };
        $scope.$watch(function () {
            return ctrl.fileUpload;
        }, function (content, previous) {
            if (content === previous) {
                return;
            }
            ctrl.model = content;
        });
        ctrl.$onInit = function () {
            if (ctrl.resource) {
                ctrl.model = jsyaml.safeDump(ctrl.resource, {
                    sortKeys: true
                });
            }
        };

        ctrl.aceLoaded = function (editor) {
            // Keep a reference to use later in event callbacks.
            aceEditor = editor;
            var session = editor.getSession();
            session.setOption('tabSize', 2);
            session.setOption('useSoftTabs', true);
            editor.setDragDelay = 0;
        };

        $scope.$watch(function () {
            return ctrl.model;
        }, updated);

        ctrl.gotoLine = function (line) {
            aceEditor.gotoLine(line);
        };
    }
});
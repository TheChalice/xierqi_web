'use strict';

define(['angular'], function (angular) {
    return angular.module('myApp.service', ['angular-clipboard'])
        .service('Confirm', ['$uibModal', function ($uibModal) {
            this.open = function (title, txt, tip, tp, iscf) {
                return $uibModal.open({
                    templateUrl: 'pub/tpl/confirm.html',
                    size: 'default',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.title = title;
                        $scope.txt = txt;
                        $scope.tip = tip;
                        $scope.tp = tp;
                        $scope.iscf = iscf;
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
        .service('Alert', ['$uibModal', function ($uibModal) {
            this.open = function (title, txt, err) {
                return $uibModal.open({
                    templateUrl: 'pub/tpl/alert.html',
                    size: 'default',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.title = title;
                        $scope.txt = txt;
                        $scope.err = err;
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
                        setTimeout(function(){
                            $uibModalInstance.dismiss();
                        }, timeout);
                    }]
                }).result;
            }
        }])
        .service('ModalPullImage', ['$rootScope', '$uibModal', 'clipboard', function ($rootScope, $uibModal, clipboard) {
            this.open = function (name) {
                return $uibModal.open({
                    templateUrl: 'pub/tpl/modal_pull_image.html',
                    size: 'default',
                    controller: ['$scope', '$uibModalInstance', '$log', function ($scope, $uibModalInstance, $log) {
                        $scope.name = name;
                        $scope.cmd = 'docker pull docker-registry-default.app.asiainfodata.com/'+ $rootScope.namespace +'/' + name;
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                        $scope.success = function () {
                            $log.info('Copied!');
                            $uibModalInstance.close(true);
                        };
                        $scope.fail = function (err) {
                            $scope.tip = '该浏览器不支持复制,请手动选中输入框中内容,通过Ctrl+c复制';
                            $log.error('Error!', err);
                        };
                    }]
                }).result;
            };
        }])
        .service('ImageSelect', ['$uibModal', function($uibModal){
            this.open = function () {
                return $uibModal.open({
                    templateUrl: 'pub/tpl/modal_choose_image.html',
                    size: 'default modal-lg',
                    controller: ['$rootScope', '$scope', '$uibModalInstance', 'images', 'ImageStreamTag', function($rootScope, $scope, $uibModalInstance, images, ImageStreamTag) {
                        console.log('images', images);

                        $scope.grid = {
                            cat: 0,
                            image: null,
                            version_x: null,
                            version_y: null
                        };

                        $scope.$watch('imageName', function(newVal, oldVal){
                            if (newVal != oldVal) {
                                newVal = newVal.replace(/\\/g);
                                angular.forEach($scope.images.items, function(image){
                                    image.hide = !(new RegExp(newVal)).test(image.metadata.name);
                                });
                            }
                        });

                        $scope.$watch('imageVersion', function(newVal, oldVal){
                            if (newVal != oldVal) {
                                newVal = newVal.replace(/\\/g);
                                angular.forEach($scope.imageTags, function(tag){
                                    tag.hide = !(new RegExp(newVal)).test(tag.commitId);
                                });
                            }
                        });

                        $scope.images = images;

                        $scope.selectCat = function(idx){
                            $scope.grid.cat = idx;
                        };

                        $scope.selectImage = function(idx){
                            $scope.grid.image = idx;
                            var image = $scope.images.items[idx];
                            angular.forEach(image.status.tags, function(item){
                                ImageStreamTag.get({namespace: $rootScope.namespace, name: image.metadata.name + ':' + item.tag}, function(res){
                                    item.ref = res.image.dockerImageMetadata.Config.Labels['io.openshift.build.commit.ref'];
                                    item.commitId = res.image.dockerImageMetadata.Config.Labels['io.openshift.build.commit.id'];
                                    item.ist = res;
                                }, function(res){
                                    console.log("get image stream tag err", res);
                                });
                            });
                            $scope.imageTags = image.status.tags;
                        };

                        $scope.selectVersion = function(x, y){
                            $scope.grid.version_x = x;
                            $scope.grid.version_y = y;
                        };

                        $scope.cancel = function() {
                            $uibModalInstance.dismiss();
                        };
                        $scope.ok = function() {
                            $uibModalInstance.close($scope.imageTags[$scope.grid.version_x].ist);
                        };
                    }],
                    resolve: {
                        images: ['$rootScope', 'ImageStream', function ($rootScope, ImageStream) {
                            return ImageStream.get({namespace: $rootScope.namespace}).$promise;
                        }]
                    }
                }).result;
            }
        }])
        .service('Sort', [function(){
            this.sort = function (items, reverse) {
                if (!reverse || reverse == 0) {
                    reverse = 1;
                }
                items.sort(function(a, b){
                    if (!a.metadata) {
                        return 0;
                    }
                    return reverse * ((new Date(a.metadata.creationTimestamp)).getTime() - (new Date(b.metadata.creationTimestamp)).getTime());
                });
                return items;
            };
        }])
        .service('UUID', [function(){
            var S4 = function () {
                return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
            };
            this.guid = function () {
                return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
            };
        }])
        .service('Cookie', [function(){
            this.set = function (key, val, expires) {
                var date = new Date();
                date.setTime(date.getTime() + expires);
                document.cookie = key + "=" + val + "; expires="+date.toUTCString();
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
        .service('ServiceSelect', ['$uibModal', function($uibModal){
            this.open = function (c) {
                return $uibModal.open({
                    templateUrl: 'views/backing_service/service_select.html',
                    size: 'default modal-foo',
                    controller: ['$log','$rootScope', '$scope', '$uibModalInstance', 'data', function($log,$rootScope, $scope, $uibModalInstance, data) {
                        var curdata = angular.copy(data);
                        for(var j = 0;j<data.items.length;j++){
                            for(var i = 0 ; i < c.length;i++){
                                if(data.items[j].metadata.name == c[i].bind_deploymentconfig){
                                    curdata.items.splice(j,1);
                                }
                            }
                        }
                        $log.info('curdatacurdata',curdata);
                        $scope.data = curdata;
                        $scope.items = curdata.items;
                        $scope.cancel = function() {
                            $uibModalInstance.dismiss();
                        };
                        $scope.ok = function() {
                            var items = [];
                            for (var i = 0; i < $scope.data.items.length; i++) {
                                if ($scope.data.items[i].checked) {
                                    items.push($scope.data.items[i]);
                                }
                            }
                            $uibModalInstance.close(items);
                        };

                        $scope.$watch('txt', function(newVal, oldVal){
                            if (newVal != oldVal) {
                                $scope.search(newVal);
                            }
                        });

                        $scope.search = function (txt) {
                            if(!txt){
                                $scope.items = $scope.data.items;
                            }else{
                                $scope.items = [];
                                txt = txt.replace(/\//g, '\\/');
                                var reg = eval('/' + txt + '/');
                                angular.forEach($scope.data.items, function(item) {
                                    if (reg.test(item.metadata.name)) {
                                        $scope.items.push(item);
                                    }
                                })
                            }
                        };
                    }],
                    resolve: {
                        data: ['$rootScope', 'DeploymentConfig', function ($rootScope, DeploymentConfig) {
                            return DeploymentConfig.get({namespace: $rootScope.namespace}).$promise;
                        }]
                    }
                }).result;
            }
        }])
        .service('MetricsService', [function(){
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

                var timeInMillis = point.end - point.start;
                var usageInMillis = (point.value - lastValue) / 1000000;
                return (usageInMillis / timeInMillis) * 1000;
            };

            this.normalize = function (data, metric) {
                var lastValue;
                angular.forEach(data, function(point) {
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
        .service('ImageService', [function(){
            this.tag = function(container){
                var foo = container.image.replace(/(.*\/)/, '');
                foo = foo.split(':');
                if (foo.length > 1) {
                    return foo[1];
                }
                return '';
            };

        }])
        .factory('AuthInterceptor', ['$rootScope', '$q', 'AUTH_EVENTS', 'Cookie', function ($rootScope, $q, AUTH_EVENTS, Cookie) {
            var CODE_MAPPING = {
                401: AUTH_EVENTS.loginNeeded,
                403: AUTH_EVENTS.httpForbidden,
                419: AUTH_EVENTS.loginNeeded,
                440: AUTH_EVENTS.loginNeeded
            };
            return {
                request: function (config) {
                    if (/login/.test(config.url)) {
                        return config;
                    }
                    var token = Cookie.get('df_access_token');
                    if (config.headers && token) {
                        config.headers["Authorization"] = "Bearer " + token;
                    }

                    if (/hawkular/.test(config.url)) {
                        config.headers["Hawkular-Tenant"] = $rootScope.namespace;
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
                    $rootScope.loading = false;
                    var val = CODE_MAPPING[response.status];
                    if (val) {
                        $rootScope.$broadcast(val, response);
                    }
                    return $q.reject(response);
                }
            };
        }])
        .factory('AuthInterceptor2', ['$q', 'AuthService', function($q, AuthService) {
            var pendingRequestConfigs = [];
            // TODO: subscribe to user change events to empty the saved configs
            // TODO: subscribe to login events to retry the saved configs

            return {
                // If auth is not needed, or is already present, returns a config
                // If auth is needed and not present, starts a login flow and returns a promise of a config
                request: function(config) {
                    // Requests that don't require auth can continue
                    //if (!AuthService.requestRequiresAuth(config)) {
                    //    //console.log("No auth required", config.url);
                    //    return config;
                    //}

                    //config.headers["User-Agent"] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36';

                    // If we could add auth info, we can continue
                    if (AuthService.addAuthToRequest(config)) {
                        //console.log("Auth added", config.url);
                        return config;
                    }

                    // We should have added auth info, but couldn't

                    // If we were specifically told not to trigger a login, return
                    if (config.auth && config.auth.triggerLogin === false) {
                        return config;
                    }

                    // 1. Set up a deferred and remember this config, so we can add auth info and resume once login is complete
                    var deferred = $q.defer();
                    pendingRequestConfigs.push([deferred, config, 'request']);
                    // 2. Start the login flow
                    AuthService.startLogin();
                    // 3. Return the deferred's promise
                    return deferred.promise;
                },

                responseError: function(rejection) {
                    var authConfig = rejection.config.auth || {};

                    // Requests that didn't require auth can continue
                    if (!AuthService.requestRequiresAuth(rejection.config)) {
                        // console.log("No auth required", rejection.config.url);
                        return $q.reject(rejection);
                    }

                    // If we were specifically told not to trigger a login, return
                    if (authConfig.triggerLogin === false) {
                        return $q.reject(rejection);
                    }

                    // detect if this is an auth error (401) or other error we should trigger a login flow for
                    var status = rejection.status;
                    switch (status) {
                        case 401:
                            // console.log('responseError', status);
                            // 1. Set up a deferred and remember this config, so we can add auth info and retry once login is complete
                            var deferred = $q.defer();
                            pendingRequestConfigs.push([deferred, rejection.config, 'responseError']);
                            // 2. Start the login flow
                            AuthService.startLogin();
                            // 3. Return the deferred's promise
                            return deferred.promise;
                        default:
                            return $q.reject(rejection);
                    }
                }
            };
        }])
        .provider('AuthService', [function() {
            var _userStore = "";
            this.UserStore = function(userStoreName) {
                if (userStoreName) {
                    _userStore = userStoreName;
                }
                return _userStore;
            };
            var _loginService = "";
            this.LoginService = function(loginServiceName) {
                if (loginServiceName) {
                    _loginService = loginServiceName;
                }
                return _loginService;
            };
            var _logoutService = "";
            this.LogoutService = function(logoutServiceName) {
                if (logoutServiceName) {
                    _logoutService = logoutServiceName;
                }
                return _logoutService;
            };

            var loadService = function(injector, name, setter) {
                if (!name) {
                    throw setter + " not set";
                } else if (angular.isString(name)) {
                    return injector.get(name);
                } else {
                    return injector.invoke(name);
                }
            };

            this.$get = ['$q', '$injector', '$log', '$rootScope', 'Cookie', function($q, $injector, $log, $rootScope, Cookie) {

                var _loginCallbacks = $.Callbacks();
                var _logoutCallbacks = $.Callbacks();
                var _userChangedCallbacks = $.Callbacks();

                var _loginPromise = null;
                var _logoutPromise = null;

                var userStore = loadService($injector, _userStore, "AuthServiceProvider.UserStore()");
                if (!userStore.available()) {
                }
                var loginService = loadService($injector, _loginService, "AuthServiceProvider.LoginService()");
                var logoutService = loadService($injector, _logoutService, "AuthServiceProvider.LogoutService()");

                return {

                    // Returns the configured user store
                    UserStore: function() {
                        return userStore;
                    },

                    // Returns true if currently logged in.
                    isLoggedIn: function() {
                        return !!userStore.getUser();
                    },

                    // Returns a promise of a user, which is resolved with a logged in user. Triggers a login if needed.
                    withUser: function() {
                        var user = userStore.getUser();
                        if (user) {
                            $rootScope.user = user;
                            return $q.when(user);
                        } else {
                            return this.startLogin();
                        }
                    },

                    setUser: function(user, token, ttl) {
                        var oldUser = userStore.getUser();
                        userStore.setUser(user, ttl);
                        userStore.setToken(token, ttl);

                        $rootScope.user = user;

                        var oldName = oldUser && oldUser.metadata && oldUser.metadata.name;
                        var newName = user    && user.metadata    && user.metadata.name;
                        if (oldName !== newName) {
                            _userChangedCallbacks.fire(user);
                        }
                    },

                    requestRequiresAuth: function(config) {
                        var requiresAuth = !!config.auth;
                        return requiresAuth;
                    },
                    addAuthToRequest: function(config) {

                        // Use the given token, if provided
                        var token = "";
                        if (config && config.auth && config.auth.token) {
                            token = config.auth.token;
                        } else {
                            //token = userStore.getToken();
                            token = Cookie.get("df_access_token");
                        }
                        if (!token) {
                            return false;
                        }

                        // Handle web socket requests with a parameter
                        if (config.method === 'WATCH') {
                            config.url = URI(config.url).addQuery({access_token: token}).toString();
                        } else {
                            config.headers["Authorization"] = "Bearer " + token;
                        }
                        return true;
                    },

                    startLogin: function() {
                        if (_loginPromise) {
                            return _loginPromise;
                        }
                        var self = this;
                        _loginPromise = loginService.login().then(function(result) {
                            self.setUser(result.user, result.token, result.ttl);
                            _loginCallbacks.fire(result.user);
                        }).catch(function(err) {
                        }).finally(function() {
                            _loginPromise = null;
                        });
                        return _loginPromise;
                    },

                    startLogout: function() {
                        if (_logoutPromise) {
                            return _logoutPromise;
                        }
                        var self = this;
                        var user = userStore.getUser();
                        var token = userStore.getToken();
                        var wasLoggedIn = this.isLoggedIn();
                        _logoutPromise = logoutService.logout(user, token).then(function() {
                        }).catch(function(err) {
                        }).finally(function() {
                            // Clear the user and token
                            self.setUser(null, null);
                            // Make sure isLoggedIn() returns false before we fire logout callbacks
                            var isLoggedIn = self.isLoggedIn();
                            // Only fire logout callbacks if we transitioned from a logged in state to a logged out state
                            if (wasLoggedIn && !isLoggedIn) {
                                _logoutCallbacks.fire();
                            }
                            _logoutPromise = null;
                        });
                        return _logoutPromise;
                    },

                    // TODO: add a way to unregister once we start doing in-page logins
                    onLogin: function(callback) {
                        _loginCallbacks.add(callback);
                    },
                    // TODO: add a way to unregister once we start doing in-page logouts
                    onLogout: function(callback) {
                        _logoutCallbacks.add(callback);
                    },
                    // TODO: add a way to unregister once we start doing in-page user changes
                    onUserChanged: function(callback) {
                        _userChangedCallbacks.add(callback);
                    }
                };
            }];
        }])
        .provider('RedirectLoginService', function() {
            var _oauth_client_id = "";
            var _oauth_authorize_uri = "";
            var _oauth_redirect_uri = "";

            this.OAuthClientID = function(id) {
                if (id) {
                    _oauth_client_id = id;
                }
                return _oauth_client_id;
            };
            this.OAuthAuthorizeURI = function(uri) {
                if (uri) {
                    _oauth_authorize_uri = uri;
                }
                return _oauth_authorize_uri;
            };
            this.OAuthRedirectURI = function(uri) {
                if (uri) {
                    _oauth_redirect_uri = uri;
                }
                return _oauth_redirect_uri;
            };

            this.$get = ['$location', '$q', function($location, $q) {

                return {
                    // Returns a promise that resolves with {user:{...}, token:'...', ttl:X}, or rejects with {error:'...'[,error_description:'...',error_uri:'...']}
                    login: function() {
                        if (_oauth_client_id === "") {
                            return $q.reject({error:'invalid_request', error_description:'RedirectLoginServiceProvider.OAuthClientID() not set'});
                        }
                        if (_oauth_authorize_uri === "") {
                            return $q.reject({error:'invalid_request', error_description:'RedirectLoginServiceProvider.OAuthAuthorizeURI() not set'});
                        }
                        if (_oauth_redirect_uri === "") {
                            return $q.reject({error:'invalid_request', error_description:'RedirectLoginServiceProvider.OAuthRedirectURI not set'});
                        }

                        var deferred = $q.defer();
                        var uri = new URI(_oauth_authorize_uri);
                        // Never send a local fragment to remote servers
                        var returnUri = new URI($location.url()).fragment("");
                        uri.query({
                            client_id: _oauth_client_id,
                            response_type: 'token',
                            state: returnUri.toString(),
                            redirect_uri: _oauth_redirect_uri
                        });
                        window.location.href = uri.toString();
                        // Return a promise we never intend to keep, because we're redirecting to another page
                        return deferred.promise;
                    },

                    // Parses oauth callback parameters from window.location
                    // Returns a promise that resolves with {token:'...',then:'...'}, or rejects with {error:'...'[,error_description:'...',error_uri:'...']}
                    // If no token and no error is present, resolves with {}
                    // Example error codes: https://tools.ietf.org/html/rfc6749#section-5.2
                    finish: function() {
                        // Get url
                        var u = new URI($location.url());

                        // Read params
                        var queryParams = u.query(true);
                        var fragmentParams = new URI("?" + u.fragment()).query(true);

                        // Error codes can come in query params or fragment params
                        // Handle an error response from the OAuth server
                        var error = queryParams.error || fragmentParams.error;
                        if (error) {
                            var error_description = queryParams.error_description || fragmentParams.error_description;
                            var error_uri = queryParams.error_uri || fragmentParams.error_uri;
                            return $q.reject({
                                error: error,
                                error_description: error_description,
                                error_uri: error_uri
                            });
                        }

                        // Handle an access_token response
                        if (fragmentParams.access_token && (fragmentParams.token_type || "").toLowerCase() === "bearer") {
                            var deferred = $q.defer();
                            deferred.resolve({
                                token: fragmentParams.access_token,
                                ttl: fragmentParams.expires_in,
                                then: fragmentParams.state
                            });
                            return deferred.promise;
                        }

                        // No token and no error is invalid
                        return $q.reject({
                            error: "invalid_request",
                            error_description: "No API token returned"
                        });
                    }
                };
            }];
        })
        .provider('DeleteTokenLogoutService', function() {

            this.$get = ['$q', '$injector', function($q, $injector) {

                return {
                    logout: function(user, token) {

                        // If we don't have a token, we're done
                        if (!token) {
                            return $q.when({});
                        }

                        // Lazily get the data service. Can't explicitly depend on it or we get circular dependencies.
                        var DataService = $injector.get('DataService');
                        // Use the token to delete the token
                        // Never trigger a login when deleting our token
                        var opts = {http: {auth: {token: token, triggerLogin: false}}};
                        // TODO: Change this to return a promise that "succeeds" even if the token delete fails?
                        return DataService.delete("oauthaccesstokens", token, {}, opts);
                    }
                };
            }];
        })
        .provider('LocalStorageUserStore', function() {
            this.$get = [function(){
                var userkey = "LocalStorageUserStore.user";
                var tokenkey = "LocalStorageUserStore.token";

                var ttlKey = function(key) {
                    return key + ".ttl";
                };
                var setTTL = function(key, ttl) {
                    if (ttl) {
                        var expires = new Date().getTime() + ttl*1000;
                        localStorage[ttlKey(key)] = expires;
                    } else {
                        localStorage.removeItem(ttlKey(key));
                    }
                };
                var isTTLExpired = function(key) {
                    var ttl = localStorage[ttlKey(key)];
                    if (!ttl) {
                        return false;
                    }
                    var expired = parseInt(ttl) < new Date().getTime();
                    return expired;
                };

                return {
                    available: function() {
                        try {
                            var x = String(new Date().getTime());
                            localStorage['LocalStorageUserStore.test'] = x;
                            var y = localStorage['LocalStorageUserStore.test'];
                            localStorage.removeItem('LocalStorageUserStore.test');
                            return x === y;
                        } catch(e) {
                            return false;
                        }
                    },
                    getUser: function(){
                        try {
                            if (isTTLExpired(userkey)) {
                                localStorage.removeItem(userkey);
                                setTTL(userkey, null);
                                return null;
                            }
                            var user = JSON.parse(localStorage[userkey]);
                            return user;
                        } catch(e) {
                            return null;
                        }
                    },
                    setUser: function(user, ttl) {
                        if (user) {
                            localStorage[userkey] = JSON.stringify(user);
                            setTTL(userkey, ttl);
                        } else {
                            localStorage.removeItem(userkey);
                            setTTL(userkey, null);
                        }
                    },
                    getToken: function() {
                        try {
                            if (isTTLExpired(tokenkey)) {
                                localStorage.removeItem(tokenkey);
                                setTTL(tokenkey, null);
                                return null;
                            }
                            var token = localStorage[tokenkey];
                            return token;
                        } catch(e) {
                            return null;
                        }
                    },
                    setToken: function(token, ttl) {
                        if (token) {
                            localStorage[tokenkey] = token;
                            setTTL(tokenkey, ttl);
                        } else {
                            localStorage.removeItem(tokenkey);
                            setTTL(tokenkey, null);
                        }
                    }
                };
            }];
        });
});

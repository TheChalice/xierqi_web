'use strict';

// UserStore objects able to remember user and tokens for the current user
define(['angular'], function (angular) {
    return angular.module('myApp.service.userstore', [])
        .provider('MemoryUserStore', function() {
            this.$get = function(){
                var _user = null;
                var _token = null;
                return {
                    available: function() {
                        return true;
                    },
                    getUser: function(){
                        return _user;
                    },
                    setUser: function(user, ttl) {
                        // TODO: honor ttl
                        _user = user;
                    },
                    getToken: function() {
                        return _token;
                    },
                    setToken: function(token, ttl) {
                        // TODO: honor ttl
                        _token = token;
                    }
                };
            };
        })
        .provider('SessionStorageUserStore', function() {
            this.$get = function(){
                var userkey = "SessionStorageUserStore.user";
                var tokenkey = "SessionStorageUserStore.token";
                return {
                    available: function() {
                        try {
                            var x = String(new Date().getTime());
                            sessionStorage['SessionStorageUserStore.test'] = x;
                            var y = sessionStorage['SessionStorageUserStore.test'];
                            sessionStorage.removeItem('SessionStorageUserStore.test');
                            return x === y;
                        } catch(e) {
                            return false;
                        }
                    },
                    getUser: function(){
                        try {
                            var user = JSON.parse(sessionStorage[userkey]);
                            return user;
                        } catch(e) {
                            return null;
                        }
                    },
                    setUser: function(user, ttl) {
                        // TODO: honor ttl
                        if (user) {
                            sessionStorage[userkey] = JSON.stringify(user);
                        } else {
                            sessionStorage.removeItem(userkey);
                        }
                    },
                    getToken: function() {
                        try {
                            var token = sessionStorage[tokenkey];
                            return token;
                        } catch(e) {
                            return null;
                        }
                    },
                    setToken: function(token, ttl) {
                        // TODO: honor ttl
                        if (token) {
                            sessionStorage[tokenkey] = token;
                        } else {
                            sessionStorage.removeItem(tokenkey);
                        }
                    }
                };
            };
        })
        .provider('LocalStorageUserStore', function() {
            this.$get = function(){
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
            };
        });

});

'use strict';
define(['angular',
        'ngResource',
        'lodash',
    ], function(angular) {

        return angular.module('myApp.origin-web-service', ['angular-clipboard', 'base64', 'ngResource'])
            // .factory('DataService', function($cacheFactory, $http, $ws, $rootScope, $q, API_CFG, APIService, Logger, $timeout, base64, base64util) {
        .constant("API_CFG", _.get(window.OPENSHIFT_CONFIG, "api", {}))

        .constant("APIS_CFG", _.get(window.OPENSHIFT_CONFIG, "apis", {}))

        .factory('Constants', function() {
            //console.log('window.OPENSHIFT_CONFIG', window.OPENSHIFT_VERSION);
            var constants = _.clone(window.OPENSHIFT_CONSTANTS || {});
            var version = _.clone(window.OPENSHIFT_VERSION || {});
            constants.VERSION = version;
            return constants;
        })

        .factory('DataService', ['$http', '$rootScope', '$q', '$timeout', 'API_CFG', 'APIService', '$cacheFactory',
                    function($http, $rootScope, $q, $timeout, API_CFG, APIService, $cacheFactory) {

                // Accept PartialObjectMetadataList. Unfortunately we can't use the Accept
                // header to fallback to JSON due to an API server content negotiation bug.
                // https://github.com/kubernetes/kubernetes/issues/50519
                //
                // This is a potential version skew issue for when the web console runs in
                // a pod where we potentially need to support different server versions.
                // https://trello.com/c/9oaUh8xP
                var ACCEPT_PARTIAL_OBJECT_METADATA_LIST = 'application/json;as=PartialObjectMetadataList;v=v1alpha1;g=meta.k8s.io';

                function Data(array) {
                    this._data = {};
                    this._objectsByAttribute(array, "metadata.name", this._data);
                }

                Data.prototype.by = function(attr) {
                    // TODO store already generated indices
                    if (attr === "metadata.name") {
                        return this._data;
                    }
                    var map = {};
                    for (var key in this._data) {
                        _objectByAttribute(this._data[key], attr, map, null);
                    }
                    return map;

                };

                Data.prototype.update = function(object, action) {
                    _objectByAttribute(object, "metadata.name", this._data, action);
                };
                // actions is whether the object was (ADDED|DELETED|MODIFIED).  ADDED is assumed if actions is not
                // passed.  If objects is a hash then actions must be a hash with the same keys.  If objects is an array
                // then actions must be an array of the same order and length.
                Data.prototype._objectsByAttribute = function(objects, attr, map, actions) {
                    angular.forEach(objects, function(obj, key) {
                        _objectByAttribute(obj, attr, map, actions ? actions[key] : null);
                    });
                };

                // Handles attr with dot notation
                // TODO write lots of tests for this helper
                // Note: this lives outside the Data prototype for now so it can be used by the helper in DataService as well
                function _objectByAttribute(obj, attr, map, action) {
                    var subAttrs = attr.split(".");
                    var attrValue = obj;
                    for (var i = 0; i < subAttrs.length; i++) {
                        attrValue = attrValue[subAttrs[i]];
                        if (attrValue === undefined) {
                            return;
                        }
                    }

                    if ($.isArray(attrValue)) {
                        // TODO implement this when we actually need it
                    } else if ($.isPlainObject(attrValue)) {
                        for (var key in attrValue) {
                            var val = attrValue[key];
                            if (!map[key]) {
                                map[key] = {};
                            }
                            if (action === "DELETED") {
                                delete map[key][val];
                            } else {
                                map[key][val] = obj;
                            }
                        }
                    } else {
                        if (action === "DELETED") {
                            delete map[attrValue];
                        } else {
                            map[attrValue] = obj;
                        }
                    }
                }

                // If several connection errors happen close together, display them as one
                // notification. This prevents us spamming the user with many failed requests
                // at once.
                var queuedErrors = [];
                var addQueuedNotifications = _.debounce(function() {
                    if (!queuedErrors.length) {
                        return;
                    }

                    // Show all queued messages together. If the details is extremely long, it
                    // will be truncated with a see more link.
                    var notification = {
                        type: 'error',
                        message: 'An error occurred connecting to the server.',
                        details: queuedErrors.join('\n'),
                        links: [{
                            label: 'Refresh',
                            onClick: function() {
                                window.location.reload();
                            }
                        }]
                    };

                    // Use `$rootScope.$emit` instead of NotificationsService directly
                    // so that DataService doesn't add a dependency on `openshiftCommonUI`
                    $rootScope.$emit('NotificationsService.addNotification', notification);

                    // Clear the queue.
                    queuedErrors = [];
                }, 300, { maxWait: 1000 });

                var showRequestError = function(message, status) {
                    if (status) {
                        message += " (status " + status + ")";
                    }
                    // Queue the message and call debounced `addQueuedNotifications`.
                    queuedErrors.push(message);
                    addQueuedNotifications();
                };

                function DataService() {
                    this._listDeferredMap = {};
                    this._watchCallbacksMap = {};
                    this._watchObjectCallbacksMap = {};
                    this._watchOperationMap = {};
                    this._listOperationMap = {};
                    this._resourceVersionMap = {};
                    this._dataCache = $cacheFactory('dataCache', {
                        // 25 is a reasonable number to keep at least one or two projects worth of data in cache
                        number: 25
                    });
                    this._immutableDataCache = $cacheFactory('immutableDataCache', {
                        // 50 is a reasonable number for the immutable resources that are stored per resource instead of grouped by type
                        number: 50
                    });
                    this._watchOptionsMap = {};
                    this._watchWebsocketsMap = {};
                    this._watchPollTimeoutsMap = {};
                    this._websocketEventsMap = {};

                    var self = this;
                    $rootScope.$on("$routeChangeStart", function(event, next, current) {
                        self._websocketEventsMap = {};
                    });
                }

                // resource:  API resource (e.g. "pods")
                // context:   API context (e.g. {project: "..."})
                // callback:  (optional) function to be called with the list of the requested resource and context,
                //            parameters passed to the callback:
                //            Data:   a Data object containing the (context-qualified) results
                //                    which includes a helper method for returning a map indexed
                //                    by attribute (e.g. data.by('metadata.name'))
                // opts:      http - options to pass to the inner $http call
                //            partialObjectMetadataList - if true, request only the metadata for each object
                //
                // returns a promise
                DataService.prototype.list = function(resource, context, callback, opts) {
                    resource = APIService.toResourceGroupVersion(resource);

                    var key = this._uniqueKey(resource, null, context, opts);
                    //console.log('key', key)
                    var deferred = this._listDeferred(key);
                    //console.log('DataService.prototype.list  deferred', deferred)
                    if (callback) {
                        deferred.promise.then(callback);
                    }
                    if (this._isCached(key)) {
                        // A watch operation is running, and we've already received the
                        // initial set of data for this resource
                        deferred.resolve(this._data(key));
                    } else if (this._listInFlight(key)) {
                        // no-op, our callback will get called when listOperation completes
                    } else {
                        this._startListOp(resource, context, opts);
                    }
                    return deferred.promise;
                };

                // resource:  API resource (e.g. "pods")
                // name:      API name, the unique name for the object
                // context:   API context (e.g. {project: "..."})
                // opts:
                //   http - options to pass to the inner $http call
                //   gracePeriodSeconds - duration in seconds to wait before deleting the resource
                // Returns a promise resolved with response data or rejected with {data:..., status:..., headers:..., config:...} when the delete call completes.
                DataService.prototype.delete = function(resource, name, context, opts) {
                    resource = APIService.toResourceGroupVersion(resource);
                    opts = opts || {};
                    var deferred = $q.defer();
                    var self = this;
                    var data, headers = {};
                    var data = {
                        kind: "DeleteOptions",
                        apiVersion: "v1"
                    };
                    if (_.has(opts, 'propagationPolicy')) {
                        // Use a has check so that explicitly setting propagationPolicy to null passes through and doesn't fallback to default behavior
                        data.propagationPolicy = opts.propagationPolicy;
                    } else {
                        // Default to "Foreground" (cascading) if no propagationPolicy was given.
                        data.propagationPolicy = 'Foreground';
                    }
                    var headers = {
                        'Content-Type': 'application/json'
                    };
                    // Differentiate between 0 and undefined
                    if (_.has(opts, 'gracePeriodSeconds')) {
                        data.gracePeriodSeconds = opts.gracePeriodSeconds;
                    }
                    this._getNamespace(resource, context, opts).then(function(ns) {
                        $http(angular.extend({
                                method: 'DELETE',
                                auth: {},
                                data: data,
                                headers: headers,
                                url: self._urlForResource(resource, name, context, false, ns)
                            }, opts.http || {}))
                            .success(function(data, status, headerFunc, config, statusText) {
                                deferred.resolve(data);
                            })
                            .error(function(data, status, headers, config) {
                                deferred.reject({
                                    data: data,
                                    status: status,
                                    headers: headers,
                                    config: config
                                });
                            });
                    });
                    return deferred.promise;
                };
                // resource:  API resource (e.g. "pods")
                // name:      API name, the unique name for the object
                // object:    API object data(eg. { kind: "Build", parameters: { ... } } )
                // context:   API context (e.g. {project: "..."})
                // opts:      http - options to pass to the inner $http call
                // Returns a promise resolved with response data or rejected with {data:..., status:..., headers:..., config:...} when the delete call completes.
                DataService.prototype.update = function(resource, name, object, context, opts) {
                    resource = APIService.deriveTargetResource(resource, object);
                    opts = opts || {};
                    var deferred = $q.defer();
                    var self = this;
                    this._getNamespace(resource, context, opts).then(function(ns) {
                        $http(angular.extend({
                                method: 'PUT',
                                auth: {},
                                data: object,
                                url: self._urlForResource(resource, name, context, false, ns)
                            }, opts.http || {}))
                            .success(function(data, status, headerFunc, config, statusText) {
                                deferred.resolve(data);
                            })
                            .error(function(data, status, headers, config) {
                                deferred.reject({
                                    data: data,
                                    status: status,
                                    headers: headers,
                                    config: config
                                });
                            });
                    });
                    return deferred.promise;
                };

                // TODO: Enable PATCH when it's added to CORS Access-Control-Allow-Methods

                // resource:  API resource group version object (e.g. { group: "", resource: "pods", version: "v1" }).
                //            Must be the full resource group version because it can't be derived from the patch object.
                // name:      API name, the unique name for the object
                // object:    API object data(eg. { kind: "Build", parameters: { ... } } )
                // context:   API context (e.g. {project: "..."})
                // opts:      http - options to pass to the inner $http call
                // Returns a promise resolved with response data or rejected with {data:..., status:..., headers:..., config:...} when the delete call completes.
                DataService.prototype.patch = function(resourceGroupVersion, name, object, context, opts) {
                    opts = opts || {};
                    var deferred = $q.defer();
                    var self = this;
                    this._getNamespace(resourceGroupVersion, context, opts).then(function(ns) {
                        $http(angular.extend({
                                method: 'PATCH',
                                auth: {},
                                data: object,
                                url: self._urlForResource(resourceGroupVersion, name, context, false, ns)
                            }, opts.http || {}))
                            .success(function(data, status, headerFunc, config, statusText) {
                                deferred.resolve(data);
                            })
                            .error(function(data, status, headers, config) {
                                deferred.reject({
                                    data: data,
                                    status: status,
                                    headers: headers,
                                    config: config
                                });
                            });
                    });
                    return deferred.promise;
                };

                // resource:  API resource (e.g. "pods")
                // name:      API name, the unique name for the object.
                //            In case the name of the Object is provided, expected format of 'resource' parameter is 'resource/subresource', eg: 'buildconfigs/instantiate'.
                // object:    API object data(eg. { kind: "Build", parameters: { ... } } )
                // context:   API context (e.g. {project: "..."})
                // opts:      http - options to pass to the inner $http call
                // Returns a promise resolved with response data or rejected with {data:..., status:..., headers:..., config:...} when the delete call completes.
                DataService.prototype.create = function(resource, name, object, context, opts) {
                    resource = APIService.deriveTargetResource(resource, object);
                    opts = opts || {};
                    var deferred = $q.defer();
                    var self = this;
                    //console.log("========>DataService.prototype.create")
                    this._getNamespace(resource, context, opts).then(function(ns) {
                        $http(angular.extend({
                                method: 'POST',
                                auth: {},
                                data: object,
                                url: self._urlForResource(resource, name, context, false, ns)
                            }, opts.http || {}))
                            .success(function(data, status, headerFunc, config, statusText) {
                                deferred.resolve(data);
                            })
                            .error(function(data, status, headers, config) {
                                deferred.reject({
                                    data: data,
                                    status: status,
                                    headers: headers,
                                    config: config
                                });
                            });
                    });
                    return deferred.promise;
                };

                // objects:   Array of API object data(eg. [{ kind: "Build", parameters: { ... } }] )
                // context:   API context (e.g. {project: "..."})
                // opts:      action - defines the REST action that will be called
                //                   - available actions: create, update
                //            http - options to pass to the inner $http call
                // Returns a promise resolved with an an object like: { success: [], failure: [] }
                // where success and failure contain an array of results from the individual
                // create calls.
                DataService.prototype.batch = function(objects, context, action, opts) {
                    var deferred = $q.defer();
                    var successResults = [];
                    var failureResults = [];
                    var self = this;
                    var remaining = objects.length;
                    action = action || 'create';

                    function _checkDone() {
                        if (remaining === 0) {
                            deferred.resolve({ success: successResults, failure: failureResults });
                        }
                    }

                    _.each(objects, function(object) {
                        var resource = APIService.objectToResourceGroupVersion(object);
                        if (!resource) {
                            // include the original object, so the error handler can display the kind/name
                            failureResults.push({ object: object, data: { message: APIService.invalidObjectKindOrVersion(object) } });
                            remaining--;
                            _checkDone();
                            return;
                        }
                        if (!APIService.apiInfo(resource)) {
                            // include the original object, so the error handler can display the kind/name
                            failureResults.push({ object: object, data: { message: APIService.unsupportedObjectKindOrVersion(object) } });
                            remaining--;
                            _checkDone();
                            return;
                        }

                        var success = function(data) {
                            // include the original object, so the error handler can display the kind/name
                            data.object = object;
                            successResults.push(data);
                            remaining--;
                            _checkDone();
                        };
                        var failure = function(data) {
                            // include the original object, so the handler can display the kind/name
                            data.object = object;
                            failureResults.push(data);
                            remaining--;
                            _checkDone();
                        };

                        switch (action) {
                            case "create":
                                self.create(resource, null, object, context, opts).then(success, failure);
                                break;
                            case "update":
                                self.update(resource, object.metadata.name, object, context, opts).then(success, failure);
                                break;
                            default:
                                // default case to prevent unspecified actions and typos
                                return deferred.reject({
                                    data: "Invalid '" + action + "'  action.",
                                    status: 400,
                                    headers: function() { return null; },
                                    config: {},
                                    object: object
                                });
                        }
                    });
                    return deferred.promise;
                };

                // resource:  API resource (e.g. "pods")
                // name:      API name, the unique name for the object
                // context:   API context (e.g. {project: "..."})
                // opts:      force - always request (default is false)
                //            http - options to pass to the inner $http call
                //            errorNotification - will popup an error notification if the API request fails (default true)
                DataService.prototype.get = function(resource, name, context, opts) {
                    resource = APIService.toResourceGroupVersion(resource);
                    opts = opts || {};
                    var key = this._uniqueKey(resource, name, context, opts);
                    var force = !!opts.force;
                    delete opts.force;

                    var deferred = $q.defer();
                    // console.log('key', key, 'this._immutableData(key)', this._immutableData(key))
                    //var existingImmutableData = this._immutableData(key);

                    // special case, if we have an immutable item, we can return it immediately
                    // if (this._hasImmutable(resource, existingImmutableData, name)) {
                    //     $timeout(function() {
                    //         // we can be guaranteed this wont change on us, just send what we have in existingData
                    //         deferred.resolve(existingImmutableData.by('metadata.name')[name]);
                    //     }, 0);
                    // } else {
                    var self = this;
                    //console.log("============>DataService.prototype.get")
                    this._getNamespace(resource, context, opts).then(function(ns) {
                        $http(angular.extend({
                                method: 'GET',
                                auth: {},
                                url: self._urlForResource(resource, name, context, false, ns)
                            }, opts.http || {}))
                            .success(function(data, status, headerFunc, config, statusText) {
                                if (self._isImmutable(resource)) {
                                    if (!existingImmutableData) {
                                        self._immutableData(key, [data]);
                                    } else {
                                        existingImmutableData.update(data, "ADDED");
                                    }
                                }
                                deferred.resolve(data);
                            })
                            .error(function(data, status, headers, config) {
                                if (opts.errorNotification !== false) {
                                    showRequestError("Failed to get " + resource + "/" + name, status);
                                }
                                deferred.reject({
                                    data: data,
                                    status: status,
                                    headers: headers,
                                    config: config
                                });
                            });
                    });
                    // }
                    return deferred.promise;
                };

                // TODO (bpeterse): Create a new Streamer service & get this out of DataService.
                DataService.prototype.createStream = function(resource, name, context, opts, isRaw) {
                    var self = this;
                    resource = APIService.toResourceGroupVersion(resource);

                    var protocols = isRaw ? 'binary.k8s.io' : 'base64.binary.k8s.io';
                    var identifier = 'stream_';
                    var openQueue = {};
                    var messageQueue = {};
                    var closeQueue = {};
                    var errorQueue = {};

                    var stream;
                    var makeStream = function() {
                        return self._getNamespace(resource, context, {})
                            .then(function(params) {
                                var cumulativeBytes = 0;
                                return $ws({
                                    url: self._urlForResource(resource, name, context, true, _.extend(params, opts)),
                                    auth: {},
                                    onopen: function(evt) {
                                        _.each(openQueue, function(fn) {
                                            fn(evt);
                                        });
                                    },
                                    onmessage: function(evt) {
                                        if (!_.isString(evt.data)) {
                                            Logger.log('log stream response is not a string', evt.data);
                                            return;
                                        }

                                        var message;
                                        if (!isRaw) {
                                            message = base64.decode(base64util.pad(evt.data));
                                            // Count bytes for log streams, which will stop when limitBytes is reached.
                                            // There's no other way to detect we've reach the limit currently.
                                            cumulativeBytes += message.length;
                                        }

                                        _.each(messageQueue, function(fn) {
                                            if (isRaw) {
                                                fn(evt.data);
                                            } else {
                                                fn(message, evt.data, cumulativeBytes);
                                            }
                                        });
                                    },
                                    onclose: function(evt) {
                                        _.each(closeQueue, function(fn) {
                                            fn(evt);
                                        });
                                    },
                                    onerror: function(evt) {
                                        _.each(errorQueue, function(fn) {
                                            fn(evt);
                                        });
                                    },
                                    protocols: protocols
                                }).then(function(ws) {
                                    Logger.log("Streaming pod log", ws);
                                    return ws;
                                });
                            });
                    };
                    return {
                        onOpen: function(fn) {
                            if (!_.isFunction(fn)) {
                                return;
                            }
                            var id = _.uniqueId(identifier);
                            openQueue[id] = fn;
                            return id;
                        },
                        onMessage: function(fn) {
                            if (!_.isFunction(fn)) {
                                return;
                            }
                            var id = _.uniqueId(identifier);
                            messageQueue[id] = fn;
                            return id;
                        },
                        onClose: function(fn) {
                            if (!_.isFunction(fn)) {
                                return;
                            }
                            var id = _.uniqueId(identifier);
                            closeQueue[id] = fn;
                            return id;
                        },
                        onError: function(fn) {
                            if (!_.isFunction(fn)) {
                                return;
                            }
                            var id = _.uniqueId(identifier);
                            errorQueue[id] = fn;
                            return id;
                        },
                        // can remove any callback from open, message, close or error
                        remove: function(id) {
                            if (openQueue[id]) { delete openQueue[id]; }
                            if (messageQueue[id]) { delete messageQueue[id]; }
                            if (closeQueue[id]) { delete closeQueue[id]; }
                            if (errorQueue[id]) { delete errorQueue[id]; }
                        },
                        start: function() {
                            stream = makeStream();
                            return stream;
                        },
                        stop: function() {
                            stream.then(function(ws) {
                                ws.close();
                            });
                        }
                    };
                };


                // resource:  API resource (e.g. "pods")
                // context:   API context (e.g. {project: "..."})
                // callback:  optional function to be called with the initial list of the requested resource,
                //            and when updates are received, parameters passed to the callback:
                //            Data:   a Data object containing the (context-qualified) results
                //                    which includes a helper method for returning a map indexed
                //                    by attribute (e.g. data.by('metadata.name'))
                //            event:  specific event that caused this call ("ADDED", "MODIFIED",
                //                    "DELETED", or null) callbacks can optionally use this to
                //                    more efficiently process updates
                //            obj:    specific object that caused this call (may be null if the
                //                    entire list was updated) callbacks can optionally use this
                //                    to more efficiently process updates
                // opts:      options
                //            poll:   true | false - whether to poll the server instead of opening
                //                    a websocket. Default is false.
                //            pollInterval: in milliseconds, how long to wait between polling the server
                //                    only applies if poll=true.  Default is 5000.
                //            http:   similar to .get, etc. at this point, only used to pass http.params for filtering
                //            skipDigest: will skip the $apply & avoid triggering a digest loop
                //                    if set to `true`.  Is intentionally the inverse of the invokeApply
                //                    arg passed to $timeout (due to default values).
                //            errorNotification: will popup an error notification if the API request fails (default true)
                // returns handle to the watch, needed to unwatch e.g.
                //        var handle = DataService.watch(resource,context,callback[,opts])
                //        DataService.unwatch(handle)
                DataService.prototype.watch = function(resource, context, callback, opts) {
                    resource = APIService.toResourceGroupVersion(resource);
                    opts = opts || {};
                    var invokeApply = !opts.skipDigest;
                    var key = this._uniqueKey(resource, null, context, opts);
                    if (callback) {
                        // If we were given a callback, add it
                        this._watchCallbacks(key).add(callback);
                    } else if (!this._watchCallbacks(key).has()) {
                        // We can be called with no callback in order to re-run a list/watch sequence for existing callbacks
                        // If there are no existing callbacks, return
                        return {};
                    }

                    var existingWatchOpts = this._watchOptions(key);
                    if (existingWatchOpts) {
                        // Check any options for compatibility with existing watch
                        if (!!existingWatchOpts.poll !== !!opts.poll) { // jshint ignore:line
                            throw "A watch already exists for " + resource + " with a different polling option.";
                        }
                    } else {
                        this._watchOptions(key, opts);
                    }

                    var self = this;
                    if (this._isCached(key)) {
                        if (callback) {
                            $timeout(function() {
                                callback(self._data(key));
                            }, 0, invokeApply);
                        }
                    } else {
                        if (callback) {
                            var resourceVersion = this._resourceVersion(key);
                            if (this._data(key)) {
                                $timeout(function() {
                                    // If the cached data is still the latest that we have, send it to the callback
                                    if (resourceVersion === self._resourceVersion(key)) {
                                        callback(self._data(key)); // but just in case, still pull from the current data map
                                    }
                                }, 0, invokeApply);
                            }
                        }
                        if (!this._listInFlight(key)) {
                            this._startListOp(resource, context, opts);
                        }
                    }

                    // returned handle needs resource, context, and callback in order to unwatch
                    return {
                        resource: resource,
                        context: context,
                        callback: callback,
                        opts: opts
                    };
                };



                // resource:  API resource (e.g. "pods")
                // name:      API name, the unique name for the object
                // context:   API context (e.g. {project: "..."})
                // callback:  optional function to be called with the initial list of the requested resource,
                //            and when updates are received, parameters passed to the callback:
                //            obj:    the requested object
                //            event:  specific event that caused this call ("ADDED", "MODIFIED",
                //                    "DELETED", or null) callbacks can optionally use this to
                //                    more efficiently process updates
                // opts:      options
                //            poll:   true | false - whether to poll the server instead of opening
                //                    a websocket. Default is false.
                //            pollInterval: in milliseconds, how long to wait between polling the server
                //                    only applies if poll=true.  Default is 5000.
                //
                // returns handle to the watch, needed to unwatch e.g.
                //        var handle = DataService.watch(resource,context,callback[,opts])
                //        DataService.unwatch(handle)
                DataService.prototype.watchObject = function(resource, name, context, callback, opts) {
                    resource = APIService.toResourceGroupVersion(resource);
                    opts = opts || {};
                    var key = this._uniqueKey(resource, name, context, opts);
                    var wrapperCallback;
                    if (callback) {
                        // If we were given a callback, add it
                        this._watchObjectCallbacks(key).add(callback);
                        var self = this;
                        wrapperCallback = function(items, event, item) {
                            // If we got an event for a single item, only fire the callback if its the item we care about
                            if (item && item.metadata.name === name) {
                                self._watchObjectCallbacks(key).fire(item, event);
                            } else if (!item) {
                                // Otherwise its an initial listing, see if we can find the item we care about in the list
                                var itemsByName = items.by("metadata.name");
                                if (itemsByName[name]) {
                                    self._watchObjectCallbacks(key).fire(itemsByName[name]);
                                }
                            }
                        };
                    } else if (!this._watchObjectCallbacks(key).has()) {
                        // This block may not be needed yet, don't expect this would get called without a callback currently...
                        return {};
                    }

                    // For now just watch the type, eventually we may want to do something more complicated
                    // and watch just the object if the type is not already being watched
                    var handle = this.watch(resource, context, wrapperCallback, opts);
                    handle.objectCallback = callback;
                    handle.objectName = name;

                    return handle;
                };

                DataService.prototype.unwatch = function(handle) {
                    var resource = handle.resource;
                    var objectName = handle.objectName;
                    var context = handle.context;
                    var callback = handle.callback;
                    var objectCallback = handle.objectCallback;
                    var opts = handle.opts;
                    var key = this._uniqueKey(resource, null, context, opts);

                    if (objectCallback && objectName) {
                        var objectKey = this._uniqueKey(resource, objectName, context, opts);
                        var objCallbacks = this._watchObjectCallbacks(objectKey);
                        objCallbacks.remove(objectCallback);
                    }

                    var callbacks = this._watchCallbacks(key);
                    if (callback) {
                        callbacks.remove(callback);
                    }
                    if (!callbacks.has()) {
                        if (opts && opts.poll) {
                            clearTimeout(this._watchPollTimeouts(key));
                            this._watchPollTimeouts(key, null);
                        } else if (this._watchWebsockets(key)) {
                            // watchWebsockets may not have been set up yet if the projectPromise never resolves
                            var ws = this._watchWebsockets(key);
                            // Make sure the onclose listener doesn't reopen this websocket.
                            ws.shouldClose = true;
                            ws.close();
                            this._watchWebsockets(key, null);
                        }

                        this._watchInFlight(key, false);
                        this._watchOptions(key, null);
                    }
                };

                // Takes an array of watch handles and unwatches them
                DataService.prototype.unwatchAll = function(handles) {
                    for (var i = 0; i < handles.length; i++) {
                        this.unwatch(handles[i]);
                    }
                };

                DataService.prototype._watchCallbacks = function(key) {
                    if (!this._watchCallbacksMap[key]) {
                        this._watchCallbacksMap[key] = $.Callbacks();
                    }
                    return this._watchCallbacksMap[key];
                };

                DataService.prototype._watchObjectCallbacks = function(key) {
                    if (!this._watchObjectCallbacksMap[key]) {
                        this._watchObjectCallbacksMap[key] = $.Callbacks();
                    }
                    return this._watchObjectCallbacksMap[key];
                };

                DataService.prototype._listDeferred = function(key) {
                    if (!this._listDeferredMap[key]) {
                        this._listDeferredMap[key] = $q.defer();
                    }
                    return this._listDeferredMap[key];
                };

                DataService.prototype._watchInFlight = function(key, op) {
                    if (!op && op !== false) {
                        return this._watchOperationMap[key];
                    } else {
                        this._watchOperationMap[key] = op;
                    }
                };

                DataService.prototype._listInFlight = function(key, op) {
                    if (!op && op !== false) {
                        return this._listOperationMap[key];
                    } else {
                        this._listOperationMap[key] = op;
                    }
                };

                DataService.prototype._resourceVersion = function(key, rv) {
                    if (!rv) {
                        return this._resourceVersionMap[key];
                    } else {
                        this._resourceVersionMap[key] = rv;
                    }
                };

                // uses $cacheFactory to impl LRU cache
                DataService.prototype._data = function(key, data) {
                    return data ?
                        this._dataCache.put(key, new Data(data)) :
                        this._dataCache.get(key);
                };

                // uses $cacheFactory to impl LRU cache
                DataService.prototype._immutableData = function(key, data) {
                    return data ?
                        this._immutableDataCache.put(key, new Data(data)) :
                        this._immutableDataCache.get(key);
                };

                DataService.prototype._isCached = function(key) {
                    return this._watchInFlight(key) &&
                        this._resourceVersion(key) &&
                        (!!this._data(key));
                };

                DataService.prototype._watchOptions = function(key, opts) {
                    if (opts === undefined) {
                        return this._watchOptionsMap[key];
                    } else {
                        this._watchOptionsMap[key] = opts;
                    }
                };

                DataService.prototype._watchPollTimeouts = function(key, timeout) {
                    if (!timeout) {
                        return this._watchPollTimeoutsMap[key];
                    } else {
                        this._watchPollTimeoutsMap[key] = timeout;
                    }
                };

                DataService.prototype._watchWebsockets = function(key, timeout) {
                    if (!timeout) {
                        return this._watchWebsocketsMap[key];
                    } else {
                        this._watchWebsocketsMap[key] = timeout;
                    }
                };

                // Maximum number of websocket events to track per resource/context in _websocketEventsMap.
                var maxWebsocketEvents = 10;

                DataService.prototype._addWebsocketEvent = function(key, eventType) {
                    var events = this._websocketEventsMap[key];
                    if (!events) {
                        events = this._websocketEventsMap[key] = [];
                    }

                    // Add the event to the end of the array with the time in millis.
                    events.push({
                        type: eventType,
                        time: Date.now()
                    });

                    // Only keep 10 events. Shift the array to make room for the new event.
                    while (events.length > maxWebsocketEvents) { events.shift(); }
                };

                function isTooManyRecentEvents(events) {
                    // If we've had more than 10 events in 30 seconds, stop.
                    // The oldest event is at index 0.
                    var recentDuration = 1000 * 30;
                    return events.length >= maxWebsocketEvents && (Date.now() - events[0].time) < recentDuration;
                }

                function isTooManyConsecutiveCloses(events) {
                    var maxConsecutiveCloseEvents = 5;
                    if (events.length < maxConsecutiveCloseEvents) {
                        return false;
                    }

                    // Make sure the last 5 events were not close events, which means the
                    // connection is not succeeding. This check is necessary if connection
                    // timeouts take longer than 6 seconds.
                    for (var i = events.length - maxConsecutiveCloseEvents; i < events.length; i++) {
                        if (events[i].type !== 'close') {
                            return false;
                        }
                    }

                    return true;
                }

                DataService.prototype._isTooManyWebsocketRetries = function(key) {
                    var events = this._websocketEventsMap[key];
                    if (!events) {
                        return false;
                    }

                    if (isTooManyRecentEvents(events)) {
                        Logger.log("Too many websocket open or close events for resource/context in a short period", key, events);
                        return true;
                    }

                    if (isTooManyConsecutiveCloses(events)) {
                        Logger.log("Too many consecutive websocket close events for resource/context", key, events);
                        return true;
                    }

                    return false;
                };


                // will take an object, filter & sort it for consistent unique key generation
                // uses encodeURIComponent internally because keys can have special characters, such as '='
                var paramsForKey = function(params) {
                    var keys = _.keysIn(
                        _.pick(
                            params, ['fieldSelector', 'labelSelector'])
                    ).sort();
                    return _.reduce(
                        keys,
                        function(result, key, i) {
                            return result + key + '=' + encodeURIComponent(params[key]) +
                                ((i < (keys.length - 1)) ? '&' : '');
                        }, '?');

                };


                // - creates a unique key representing a resource in its context (project)
                //    - primary use case for caching
                //    - proxies to _urlForResource to generate unique keys
                // - ensure namespace if available
                // - ensure only witelisted url params used for keys (fieldSelector, labelSelector) via paramsForKey
                //   and that these are consistently ordered
                // - ensure that requests with different Accept request headers have different keys
                // - NOTE: Do not use the key as your url for API requests. This function does not use the 'isWebsocket'
                //         bool.  Both websocket & http operations should respond with the same data from cache if key matches
                //         so the unique key will always include http://
                DataService.prototype._uniqueKey = function(resource, name, context, opts) {
                    var ns = context && context.namespace ||
                        _.get(context, 'project.metadata.name') ||
                        context.projectName;
                    var params = _.get(opts, 'http.params');
                    var url = this._urlForResource(resource, name, context, null, angular.extend({}, {}, { namespace: ns })).toString() + paramsForKey(params || {});
                    if (_.get(opts, 'partialObjectMetadataList')) {
                        // Make sure partial objects get a different cache key.
                        return url + '#' + ACCEPT_PARTIAL_OBJECT_METADATA_LIST;
                    }

                    return url;
                };


                DataService.prototype._startListOp = function(resource, context, opts) {
                    opts = opts || {};
                    var params = _.get(opts, 'http.params') || {};
                    var key = this._uniqueKey(resource, null, context, opts);
                    // mark the operation as in progress
                    this._listInFlight(key, true);

                    var headers = {};
                    if (opts.partialObjectMetadataList) {
                        headers.Accept = ACCEPT_PARTIAL_OBJECT_METADATA_LIST;
                    }

                    var self = this;
                    if (context.projectPromise && !resource.equals("projects")) {
                        context.projectPromise.done(function(project) {
                            $http(angular.extend({
                                    method: 'GET',
                                    auth: {},
                                    headers: headers,
                                    url: self._urlForResource(resource, null, context, false, _.assign({}, params, { namespace: project.metadata.name }))
                                }, opts.http || {}))
                                .success(function(data, status, headerFunc, config, statusText) {
                                    self._listOpComplete(key, resource, context, opts, data);
                                }).error(function(data, status, headers, config) {
                                    // mark list op as complete
                                    self._listInFlight(key, false);
                                    var deferred = self._listDeferred(key);
                                    delete self._listDeferredMap[key];
                                    deferred.reject({
                                        data: data,
                                        status: status,
                                        headers: headers,
                                        config: config
                                    });

                                    if (!_.get(opts, 'errorNotification', true)) {
                                        return;
                                    }

                                    showRequestError("Failed to list " + resource, status);
                                });
                        });
                    } else {
                        $http({
                            method: 'GET',
                            auth: {},
                            headers: headers,
                            url: this._urlForResource(resource, null, context, false, params),
                        }).success(function(data, status, headerFunc, config, statusText) {
                            self._listOpComplete(key, resource, context, opts, data);
                        }).error(function(data, status, headers, config) {
                            // mark list op as complete
                            self._listInFlight(key, false);
                            var deferred = self._listDeferred(key);
                            delete self._listDeferredMap[key];
                            deferred.reject({
                                data: data,
                                status: status,
                                headers: headers,
                                config: config
                            });

                            if (!_.get(opts, 'errorNotification', true)) {
                                return;
                            }

                            showRequestError("Failed to list " + resource, status);
                        });
                    }
                };

                DataService.prototype._listOpComplete = function(key, resource, context, opts, data) {
                    if (!data.items) {
                        console.warn("List request for " + resource + " returned a null items array.  This is an invalid API response.");
                    }

                    var items = data.items || [];
                    // Here we normalize all items to have a kind property.
                    // One of the warts in the kubernetes REST API is that items retrieved
                    // via GET on a list resource won't have a kind property set.
                    // See: https://github.com/kubernetes/kubernetes/issues/3030
                    if (data.kind && data.kind.indexOf("List") === data.kind.length - 4) {
                        angular.forEach(items, function(item) {
                            if (!item.kind) {
                                item.kind = data.kind.slice(0, -4);
                            }
                            if (!item.apiVersion) {
                                item.apiVersion = data.apiVersion;
                            }
                        });
                    }
                    //console.log('_listOpComplete data', data)
                    // mark list op as complete
                    this._listInFlight(key, false);
                    var deferred = this._listDeferred(key);
                    delete this._listDeferredMap[key];

                    // Some responses might not have `data.metadata` (for instance, PartialObjectMetadataList).
                    var resourceVersion = _.get(data, 'resourceVersion') || _.get(data, 'metadata.resourceVersion');
                    this._resourceVersion(key, resourceVersion);

                    this._data(key, items);
                    deferred.resolve(this._data(key));
                    this._watchCallbacks(key).fire(this._data(key));

                    if (this._watchCallbacks(key).has()) {
                        var watchOpts = this._watchOptions(key) || {};
                        if (watchOpts.poll) {
                            this._watchInFlight(key, true);
                            this._watchPollTimeouts(key, setTimeout($.proxy(this, "_startListOp", resource, context), watchOpts.pollInterval || 5000));
                        } else if (!this._watchInFlight(key)) {
                            this._startWatchOp(key, resource, context, opts, this._resourceVersion(key));
                        }
                    }
                };

                DataService.prototype._startWatchOp = function(key, resource, context, opts, resourceVersion) {
                    this._watchInFlight(key, true);
                    // Note: current impl uses one websocket per resource
                    // eventually want a single websocket connection that we
                    // send a subscription request to for each resource

                    // Only listen for updates if websockets are available
                    if ($ws.available()) {
                        var self = this;
                        var params = _.get(opts, 'http.params') || {};
                        params.watch = true;
                        if (resourceVersion) {
                            params.resourceVersion = resourceVersion;
                        }
                        if (context.projectPromise && !resource.equals("projects")) {
                            context.projectPromise.done(function(project) {
                                params.namespace = project.metadata.name;
                                $ws({
                                    method: "WATCH",
                                    url: self._urlForResource(resource, null, context, true, params),
                                    auth: {},
                                    onclose: $.proxy(self, "_watchOpOnClose", resource, context, opts),
                                    onmessage: $.proxy(self, "_watchOpOnMessage", resource, context, opts),
                                    onopen: $.proxy(self, "_watchOpOnOpen", resource, context, opts)
                                }).then(function(ws) {
                                    Logger.log("Watching", ws);
                                    self._watchWebsockets(key, ws);
                                });
                            });
                        } else {
                            $ws({
                                method: "WATCH",
                                url: self._urlForResource(resource, null, context, true, params),
                                auth: {},
                                onclose: $.proxy(self, "_watchOpOnClose", resource, context, opts),
                                onmessage: $.proxy(self, "_watchOpOnMessage", resource, context, opts),
                                onopen: $.proxy(self, "_watchOpOnOpen", resource, context, opts)
                            }).then(function(ws) {
                                Logger.log("Watching", ws);
                                self._watchWebsockets(key, ws);
                            });
                        }
                    }
                };

                DataService.prototype._watchOpOnOpen = function(resource, context, opts, event) {
                    Logger.log('Websocket opened for resource/context', resource, context);
                    var key = this._uniqueKey(resource, null, context, opts);
                    this._addWebsocketEvent(key, 'open');
                };

                DataService.prototype._watchOpOnMessage = function(resource, context, opts, event) {
                    var key = this._uniqueKey(resource, null, context, opts);
                    opts = opts || {};
                    var invokeApply = !opts.skipDigest;
                    try {
                        var eventData = $.parseJSON(event.data);

                        if (eventData.type == "ERROR") {
                            Logger.log("Watch window expired for resource/context", resource, context);
                            if (event.target) {
                                event.target.shouldRelist = true;
                            }
                            return;
                        } else if (eventData.type === "DELETED") {
                            // Add this ourselves since the API doesn't add anything
                            // this way the views can use it to trigger special behaviors
                            if (eventData.object && eventData.object.metadata && !eventData.object.metadata.deletionTimestamp) {
                                eventData.object.metadata.deletionTimestamp = (new Date()).toISOString();
                            }
                        }

                        if (eventData.object) {
                            this._resourceVersion(key, eventData.object.resourceVersion || eventData.object.metadata.resourceVersion);
                        }
                        // TODO do we reset all the by() indices, or simply update them, since we should know what keys are there?
                        // TODO let the data object handle its own update
                        this._data(key).update(eventData.object, eventData.type);
                        var self = this;
                        // Wrap in a $timeout which will trigger an $apply to mirror $http callback behavior
                        // without timeout this is triggering a repeated digest loop
                        $timeout(function() {
                            self._watchCallbacks(key).fire(self._data(key), eventData.type, eventData.object);
                        }, 0, invokeApply);
                    } catch (e) {
                        // TODO: surface in the UI?
                        Logger.error("Error processing message", resource, event.data);
                    }
                };

                DataService.prototype._watchOpOnClose = function(resource, context, opts, event) {
                    var eventWS = event.target;
                    var key = this._uniqueKey(resource, null, context, opts);

                    if (!eventWS) {
                        Logger.log("Skipping reopen, no eventWS in event", event);
                        return;
                    }

                    var registeredWS = this._watchWebsockets(key);
                    if (!registeredWS) {
                        Logger.log("Skipping reopen, no registeredWS for resource/context", resource, context);
                        return;
                    }

                    // Don't reopen a web socket that is no longer registered for this resource/context
                    if (eventWS !== registeredWS) {
                        Logger.log("Skipping reopen, eventWS does not match registeredWS", eventWS, registeredWS);
                        return;
                    }

                    // We are the registered web socket for this resource/context, and we are no longer in flight
                    // Unlock this resource/context in case we decide not to reopen
                    this._watchInFlight(key, false);

                    // Don't reopen web sockets we closed ourselves
                    if (eventWS.shouldClose) {
                        Logger.log("Skipping reopen, eventWS was explicitly closed", eventWS);
                        return;
                    }

                    // Don't reopen clean closes (for example, navigating away from the page to example.com)
                    if (event.wasClean) {
                        Logger.log("Skipping reopen, clean close", event);
                        return;
                    }

                    // Don't reopen if no one is listening for this data any more
                    if (!this._watchCallbacks(key).has()) {
                        Logger.log("Skipping reopen, no listeners registered for resource/context", resource, context);
                        return;
                    }

                    // Don't reopen if we've failed this resource/context too many times
                    if (this._isTooManyWebsocketRetries(key)) {
                        // Show an error notication unless disabled in opts.
                        if (_.get(opts, 'errorNotification', true)) {
                            // Use `$rootScope.$emit` instead of NotificationsService directly
                            // so that DataService doesn't add a dependency on `openshiftCommonUI`
                            $rootScope.$emit('NotificationsService.addNotification', {
                                id: 'websocket_retry_halted',
                                type: 'error',
                                message: 'Server connection interrupted.',
                                links: [{
                                    label: 'Refresh',
                                    onClick: function() {
                                        window.location.reload();
                                    }
                                }]
                            });
                        }
                        return;
                    }

                    // Keep track of this event.
                    this._addWebsocketEvent(key, 'close');

                    // If our watch window expired, we have to relist to get a new resource version to watch from
                    if (eventWS.shouldRelist) {
                        Logger.log("Relisting for resource/context", resource, context);
                        // Restart a watch() from the beginning, which triggers a list/watch sequence
                        // The watch() call is responsible for setting _watchInFlight back to true
                        // Add a short delay to avoid a scenario where we make non-stop requests
                        // When the timeout fires, if no callbacks are registered for this
                        //   resource/context, or if a watch is already in flight, `watch()` is a no-op
                        var self = this;
                        setTimeout(function() {
                            self.watch(resource, context);
                        }, 2000);
                        return;
                    }

                    // Attempt to re-establish the connection after a two-second back-off
                    // Re-mark ourselves as in-flight to prevent other callers from jumping in in the meantime
                    Logger.log("Rewatching for resource/context", resource, context);
                    this._watchInFlight(key, true);
                    setTimeout(
                        $.proxy(this, "_startWatchOp", key, resource, context, opts, this._resourceVersion(key)),
                        2000
                    );
                };

                var URL_ROOT_TEMPLATE = "{protocol}://{+hostPort}{+prefix}{/group}/{version}/";
                var URL_GET_LIST = URL_ROOT_TEMPLATE + "{resource}{?q*}";
                var URL_OBJECT = URL_ROOT_TEMPLATE + "{resource}/{name}{/subresource*}{?q*}";
                var URL_NAMESPACED_GET_LIST = URL_ROOT_TEMPLATE + "namespaces/{namespace}/{resource}{?q*}";
                var URL_NAMESPACED_OBJECT = URL_ROOT_TEMPLATE + "namespaces/{namespace}/{resource}/{name}{/subresource*}{?q*}";


                DataService.prototype._urlForResource = function(resource, name, context, isWebsocket, params) {
                    var apiInfo = APIService.apiInfo(resource);
                    if (!apiInfo) {
                        Logger.error("_urlForResource called with unknown resource", resource, arguments);
                        return null;
                    }

                    var serviceProtocol = apiInfo.protocol || window.location.protocol;
                    var protocol;
                    params = params || {};
                    if (isWebsocket) {
                        protocol = serviceProtocol === "http:" ? "ws" : "wss";
                    } else {
                        protocol = serviceProtocol === "http:" ? "http" : "https";
                    }

                    if (context && context.namespace && !params.namespace) {
                        params.namespace = context.namespace;
                    }

                    if (apiInfo.namespaced && !params.namespace) {
                        Logger.error("_urlForResource called for a namespaced resource but no namespace provided", resource, arguments);
                        return null;
                    }

                    var namespaceInPath = apiInfo.namespaced;
                    var namespace = null;
                    if (namespaceInPath) {
                        namespace = params.namespace;
                        params = angular.copy(params);
                        delete params.namespace;
                    }
                    var template;

                    //console.log('+window.location.port', window.location.host);

                    var templateOptions = {
                        protocol: protocol,
                        hostPort: window.location.host,
                        prefix: apiInfo.prefix,
                        group: apiInfo.group,
                        version: apiInfo.version,
                        resource: resource.primaryResource(),
                        subresource: resource.subresources(),
                        name: name,
                        namespace: namespace,
                        q: params
                    };
                    if (name) {
                        template = namespaceInPath ? URL_NAMESPACED_OBJECT : URL_OBJECT;
                    } else {
                        template = namespaceInPath ? URL_NAMESPACED_GET_LIST : URL_GET_LIST;
                    }
                    return URI.expand(template, templateOptions).toString();
                };

                DataService.prototype.url = function(options) {
                    if (options && options.resource) {
                        var opts = angular.copy(options);
                        delete opts.resource;
                        delete opts.group;
                        delete opts.version;
                        delete opts.name;
                        delete opts.isWebsocket;
                        var resource = APIService.toResourceGroupVersion({
                            resource: options.resource,
                            group: options.group,
                            version: options.version
                        });

                        return this._urlForResource(resource, options.name, null, !!options.isWebsocket, opts);
                    }
                    return null;
                };

                DataService.prototype.openshiftAPIBaseUrl = function() {
                    var protocol = window.location.protocol === "http:" ? "http" : "https";
                    var hostPort = API_CFG.openshift.hostPort;
                    return new URI({ protocol: protocol, hostname: hostPort }).toString();
                };

                // Used by ProjectsService when a list fails.
                DataService.prototype.createData = function(array) {
                    return new Data(array);
                };

                // Immutables are flagged here as we should not need to fetch them more than once.
                var IMMUTABLE_RESOURCE = {
                    imagestreamimages: true
                };

                // - request once and never need to request again, these do not change!
                DataService.prototype._isImmutable = function(resource) {
                    return !!IMMUTABLE_RESOURCE[resource.resource];
                };

                // do we already have the data for this?
                DataService.prototype._hasImmutable = function(resource, existingData, name) {
                    return this._isImmutable(resource) && existingData && existingData.by('metadata.name')[name];
                };

                DataService.prototype._getNamespace = function(resource, context, opts) {
                    var deferred = $q.defer();
                    if (opts.namespace) {
                        deferred.resolve({ namespace: opts.namespace });
                    } else if (context.projectPromise && !resource.equals("projects")) {
                        context.projectPromise.done(function(project) {
                            deferred.resolve({ namespace: project.metadata.name });
                        });
                    } else {
                        deferred.resolve(null);
                    }
                    return deferred.promise;
                };

                return new DataService();
            }
        ])

        .factory('APIService',['API_CFG','$resource','Constants','Cookie','$q','$http','$filter','$window', function(
                     API_CFG, $resource, Constants, Cookie, $q, $http, $filter, $window) {
            // Set the default api versions the console will use if otherwise unspecified
            var defaultVersion = {
                "": "v1",
                "extensions": "v1beta1"
            };
            var tokens = Cookie.get('df_access_token');
            var regions = Cookie.get('region');
            var tokenarr = tokens.split(',');
            var region = regions.split('-')[2];
            var token = tokenarr[region - 1];


            window.OPENSHIFT_CONFIG = {
                apis: {
                    "hostPort": "127.0.0.1:8080",
                    "prefix": "/apis",
                    "groups": {
                        "authentication.k8s.io": {
                            "name": "authentication.k8s.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "authentication.k8s.io/v1",
                                    "resources": {
                                        "tokenreviews": {
                                            "name": "tokenreviews",
                                            "namespaced": false,
                                            "kind": "TokenReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        }
                                    }
                                },
                                "v1beta1": {
                                    "version": "v1beta1",
                                    "groupVersion": "authentication.k8s.io/v1beta1",
                                    "resources": {
                                        "tokenreviews": {
                                            "name": "tokenreviews",
                                            "namespaced": false,
                                            "kind": "TokenReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "authorization.k8s.io": {
                            "name": "authorization.k8s.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "authorization.k8s.io/v1",
                                    "resources": {
                                        "localsubjectaccessreviews": {
                                            "name": "localsubjectaccessreviews",
                                            "namespaced": true,
                                            "kind": "LocalSubjectAccessReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "selfsubjectaccessreviews": {
                                            "name": "selfsubjectaccessreviews",
                                            "namespaced": false,
                                            "kind": "SelfSubjectAccessReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "subjectaccessreviews": {
                                            "name": "subjectaccessreviews",
                                            "namespaced": false,
                                            "kind": "SubjectAccessReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        }
                                    }
                                },
                                "v1beta1": {
                                    "version": "v1beta1",
                                    "groupVersion": "authorization.k8s.io/v1beta1",
                                    "resources": {
                                        "localsubjectaccessreviews": {
                                            "name": "localsubjectaccessreviews",
                                            "namespaced": true,
                                            "kind": "LocalSubjectAccessReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "selfsubjectaccessreviews": {
                                            "name": "selfsubjectaccessreviews",
                                            "namespaced": false,
                                            "kind": "SelfSubjectAccessReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "subjectaccessreviews": {
                                            "name": "subjectaccessreviews",
                                            "namespaced": false,
                                            "kind": "SubjectAccessReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "autoscaling": {
                            "name": "autoscaling",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "autoscaling/v1",
                                    "resources": {
                                        "horizontalpodautoscalers": {
                                            "name": "horizontalpodautoscalers",
                                            "namespaced": true,
                                            "kind": "HorizontalPodAutoscaler",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ],
                                            "shortNames": [
                                                "hpa"
                                            ]
                                        },
                                        "horizontalpodautoscalers/status": {
                                            "name": "horizontalpodautoscalers/status",
                                            "namespaced": true,
                                            "kind": "HorizontalPodAutoscaler",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "batch": {
                            "name": "batch",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "batch/v1",
                                    "resources": {
                                        "jobs": {
                                            "name": "jobs",
                                            "namespaced": true,
                                            "kind": "Job",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "jobs/status": {
                                            "name": "jobs/status",
                                            "namespaced": true,
                                            "kind": "Job",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        }
                                    }
                                },
                                "v2alpha1": {
                                    "version": "v2alpha1",
                                    "groupVersion": "batch/v2alpha1",
                                    "resources": {
                                        "cronjobs": {
                                            "name": "cronjobs",
                                            "namespaced": true,
                                            "kind": "CronJob",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "cronjobs/status": {
                                            "name": "cronjobs/status",
                                            "namespaced": true,
                                            "kind": "CronJob",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "scheduledjobs": {
                                            "name": "scheduledjobs",
                                            "namespaced": true,
                                            "kind": "ScheduledJob",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "scheduledjobs/status": {
                                            "name": "scheduledjobs/status",
                                            "namespaced": true,
                                            "kind": "ScheduledJob",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "certificates.k8s.io": {
                            "name": "certificates.k8s.io",
                            "preferredVersion": "v1beta1",
                            "versions": {
                                "v1beta1": {
                                    "version": "v1beta1",
                                    "groupVersion": "certificates.k8s.io/v1beta1",
                                    "resources": {
                                        "certificatesigningrequests": {
                                            "name": "certificatesigningrequests",
                                            "namespaced": false,
                                            "kind": "CertificateSigningRequest",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ],
                                            "shortNames": [
                                                "csr"
                                            ]
                                        },
                                        "certificatesigningrequests/approval": {
                                            "name": "certificatesigningrequests/approval",
                                            "namespaced": false,
                                            "kind": "CertificateSigningRequest",
                                            "verbs": [
                                                "update"
                                            ]
                                        },
                                        "certificatesigningrequests/status": {
                                            "name": "certificatesigningrequests/status",
                                            "namespaced": false,
                                            "kind": "CertificateSigningRequest",
                                            "verbs": [
                                                "update"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "extensions": {
                            "name": "extensions",
                            "preferredVersion": "v1beta1",
                            "versions": {
                                "v1beta1": {
                                    "version": "v1beta1",
                                    "groupVersion": "extensions/v1beta1",
                                    "resources": {
                                        "daemonsets": {
                                            "name": "daemonsets",
                                            "namespaced": true,
                                            "kind": "DaemonSet",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ],
                                            "shortNames": [
                                                "ds"
                                            ]
                                        },
                                        "daemonsets/status": {
                                            "name": "daemonsets/status",
                                            "namespaced": true,
                                            "kind": "DaemonSet",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "deployments": {
                                            "name": "deployments",
                                            "namespaced": true,
                                            "kind": "Deployment",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ],
                                            "shortNames": [
                                                "deploy"
                                            ]
                                        },
                                        "deployments/rollback": {
                                            "name": "deployments/rollback",
                                            "namespaced": true,
                                            "kind": "DeploymentRollback",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "deployments/scale": {
                                            "name": "deployments/scale",
                                            "namespaced": true,
                                            "kind": "Scale",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "deployments/status": {
                                            "name": "deployments/status",
                                            "namespaced": true,
                                            "kind": "Deployment",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "horizontalpodautoscalers": {
                                            "name": "horizontalpodautoscalers",
                                            "namespaced": true,
                                            "kind": "HorizontalPodAutoscaler",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ],
                                            "shortNames": [
                                                "hpa"
                                            ]
                                        },
                                        "horizontalpodautoscalers/status": {
                                            "name": "horizontalpodautoscalers/status",
                                            "namespaced": true,
                                            "kind": "HorizontalPodAutoscaler",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "ingresses": {
                                            "name": "ingresses",
                                            "namespaced": true,
                                            "kind": "Ingress",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ],
                                            "shortNames": [
                                                "ing"
                                            ]
                                        },
                                        "ingresses/status": {
                                            "name": "ingresses/status",
                                            "namespaced": true,
                                            "kind": "Ingress",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "networkpolicies": {
                                            "name": "networkpolicies",
                                            "namespaced": true,
                                            "kind": "NetworkPolicy",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "podsecuritypolicies": {
                                            "name": "podsecuritypolicies",
                                            "namespaced": false,
                                            "kind": "PodSecurityPolicy",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ],
                                            "shortNames": [
                                                "psp"
                                            ]
                                        },
                                        "replicasets": {
                                            "name": "replicasets",
                                            "namespaced": true,
                                            "kind": "ReplicaSet",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ],
                                            "shortNames": [
                                                "rs"
                                            ]
                                        },
                                        "replicasets/scale": {
                                            "name": "replicasets/scale",
                                            "namespaced": true,
                                            "kind": "Scale",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "replicasets/status": {
                                            "name": "replicasets/status",
                                            "namespaced": true,
                                            "kind": "ReplicaSet",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "replicationcontrollers": {
                                            "name": "replicationcontrollers",
                                            "namespaced": true,
                                            "kind": "ReplicationControllerDummy",
                                            "verbs": []
                                        },
                                        "replicationcontrollers/scale": {
                                            "name": "replicationcontrollers/scale",
                                            "namespaced": true,
                                            "kind": "Scale",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "thirdpartyresources": {
                                            "name": "thirdpartyresources",
                                            "namespaced": false,
                                            "kind": "ThirdPartyResource",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "policy": {
                            "name": "policy",
                            "preferredVersion": "v1beta1",
                            "versions": {
                                "v1beta1": {
                                    "version": "v1beta1",
                                    "groupVersion": "policy/v1beta1",
                                    "resources": {
                                        "poddisruptionbudgets": {
                                            "name": "poddisruptionbudgets",
                                            "namespaced": true,
                                            "kind": "PodDisruptionBudget",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ],
                                            "shortNames": [
                                                "pdb"
                                            ]
                                        },
                                        "poddisruptionbudgets/status": {
                                            "name": "poddisruptionbudgets/status",
                                            "namespaced": true,
                                            "kind": "PodDisruptionBudget",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "rbac.authorization.k8s.io": {
                            "name": "rbac.authorization.k8s.io",
                            "preferredVersion": "v1beta1",
                            "versions": {
                                "v1beta1": {
                                    "version": "v1beta1",
                                    "groupVersion": "rbac.authorization.k8s.io/v1beta1",
                                    "resources": {
                                        "clusterrolebindings": {
                                            "name": "clusterrolebindings",
                                            "namespaced": false,
                                            "kind": "ClusterRoleBinding",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "clusterroles": {
                                            "name": "clusterroles",
                                            "namespaced": false,
                                            "kind": "ClusterRole",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "rolebindings": {
                                            "name": "rolebindings",
                                            "namespaced": true,
                                            "kind": "RoleBinding",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "roles": {
                                            "name": "roles",
                                            "namespaced": true,
                                            "kind": "Role",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "storage.k8s.io": {
                            "name": "storage.k8s.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1beta1": {
                                    "version": "v1beta1",
                                    "groupVersion": "storage.k8s.io/v1beta1",
                                    "resources": {
                                        "storageclasses": {
                                            "name": "storageclasses",
                                            "namespaced": false,
                                            "kind": "StorageClass",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ],
                                            "shortNames": [
                                                "sc"
                                            ]
                                        }
                                    }
                                },
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "storage.k8s.io/v1",
                                    "resources": {
                                        "storageclasses": {
                                            "name": "storageclasses",
                                            "namespaced": false,
                                            "kind": "StorageClass",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ],
                                            "shortNames": [
                                                "sc"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "apps": {
                            "name": "apps",
                            "preferredVersion": "v1beta1",
                            "versions": {
                                "v1beta1": {
                                    "version": "v1beta1",
                                    "groupVersion": "apps/v1beta1",
                                    "resources": {
                                        "deployments": {
                                            "name": "deployments",
                                            "namespaced": true,
                                            "kind": "Deployment",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ],
                                            "shortNames": [
                                                "deploy"
                                            ]
                                        },
                                        "deployments/rollback": {
                                            "name": "deployments/rollback",
                                            "namespaced": true,
                                            "kind": "DeploymentRollback",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "deployments/scale": {
                                            "name": "deployments/scale",
                                            "namespaced": true,
                                            "kind": "Scale",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "deployments/status": {
                                            "name": "deployments/status",
                                            "namespaced": true,
                                            "kind": "Deployment",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "statefulsets": {
                                            "name": "statefulsets",
                                            "namespaced": true,
                                            "kind": "StatefulSet",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "statefulsets/status": {
                                            "name": "statefulsets/status",
                                            "namespaced": true,
                                            "kind": "StatefulSet",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "project.openshift.io": {
                            "name": "project.openshift.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "project.openshift.io/v1",
                                    "resources": {
                                        "projectrequests": {
                                            "name": "projectrequests",
                                            "namespaced": false,
                                            "kind": "ProjectRequest",
                                            "verbs": [
                                                "create",
                                                "list"
                                            ]
                                        },
                                        "projects": {
                                            "name": "projects",
                                            "namespaced": false,
                                            "kind": "Project",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "quota.openshift.io": {
                            "name": "quota.openshift.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "quota.openshift.io/v1",
                                    "resources": {
                                        "appliedclusterresourcequotas": {
                                            "name": "appliedclusterresourcequotas",
                                            "namespaced": true,
                                            "kind": "AppliedClusterResourceQuota",
                                            "verbs": [
                                                "get",
                                                "list"
                                            ]
                                        },
                                        "clusterresourcequotas": {
                                            "name": "clusterresourcequotas",
                                            "namespaced": false,
                                            "kind": "ClusterResourceQuota",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "clusterresourcequotas/status": {
                                            "name": "clusterresourcequotas/status",
                                            "namespaced": false,
                                            "kind": "ClusterResourceQuota",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "route.openshift.io": {
                            "name": "route.openshift.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "route.openshift.io/v1",
                                    "resources": {
                                        "routes": {
                                            "name": "routes",
                                            "namespaced": true,
                                            "kind": "Route",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "routes/status": {
                                            "name": "routes/status",
                                            "namespaced": true,
                                            "kind": "Route",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "image.openshift.io": {
                            "name": "image.openshift.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "image.openshift.io/v1",
                                    "resources": {
                                        "images": {
                                            "name": "images",
                                            "namespaced": false,
                                            "kind": "Image",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "imagesignatures": {
                                            "name": "imagesignatures",
                                            "namespaced": false,
                                            "kind": "ImageSignature",
                                            "verbs": [
                                                "create",
                                                "delete"
                                            ]
                                        },
                                        "imagestreamimages": {
                                            "name": "imagestreamimages",
                                            "namespaced": true,
                                            "kind": "ImageStreamImage",
                                            "verbs": [
                                                "get"
                                            ]
                                        },
                                        "imagestreamimports": {
                                            "name": "imagestreamimports",
                                            "namespaced": true,
                                            "kind": "ImageStreamImport",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "imagestreammappings": {
                                            "name": "imagestreammappings",
                                            "namespaced": true,
                                            "kind": "ImageStreamMapping",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "imagestreams": {
                                            "name": "imagestreams",
                                            "namespaced": true,
                                            "kind": "ImageStream",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "imagestreams/secrets": {
                                            "name": "imagestreams/secrets",
                                            "namespaced": true,
                                            "kind": "SecretList",
                                            "verbs": [
                                                "get"
                                            ]
                                        },
                                        "imagestreams/status": {
                                            "name": "imagestreams/status",
                                            "namespaced": true,
                                            "kind": "ImageStream",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "imagestreamtags": {
                                            "name": "imagestreamtags",
                                            "namespaced": true,
                                            "kind": "ImageStreamTag",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "get",
                                                "list",
                                                "patch",
                                                "update"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "apps.openshift.io": {
                            "name": "apps.openshift.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "apps.openshift.io/v1",
                                    "resources": {
                                        "deploymentconfigs": {
                                            "name": "deploymentconfigs",
                                            "namespaced": true,
                                            "kind": "DeploymentConfig",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "deploymentconfigs/instantiate": {
                                            "name": "deploymentconfigs/instantiate",
                                            "namespaced": true,
                                            "kind": "DeploymentRequest",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "deploymentconfigs/log": {
                                            "name": "deploymentconfigs/log",
                                            "namespaced": true,
                                            "kind": "DeploymentLog",
                                            "verbs": [
                                                "get"
                                            ]
                                        },
                                        "deploymentconfigs/rollback": {
                                            "name": "deploymentconfigs/rollback",
                                            "namespaced": true,
                                            "kind": "DeploymentConfigRollback",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "deploymentconfigs/scale": {
                                            "name": "deploymentconfigs/scale",
                                            "namespaced": true,
                                            "kind": "Scale",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "deploymentconfigs/status": {
                                            "name": "deploymentconfigs/status",
                                            "namespaced": true,
                                            "kind": "DeploymentConfig",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "template.openshift.io": {
                            "name": "template.openshift.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "template.openshift.io/v1",
                                    "resources": {
                                        "processedtemplates": {
                                            "name": "processedtemplates",
                                            "namespaced": true,
                                            "kind": "Template",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "templates": {
                                            "name": "templates",
                                            "namespaced": true,
                                            "kind": "Template",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "security.openshift.io": {
                            "name": "security.openshift.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "security.openshift.io/v1",
                                    "resources": {
                                        "podsecuritypolicyreviews": {
                                            "name": "podsecuritypolicyreviews",
                                            "namespaced": true,
                                            "kind": "PodSecurityPolicyReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "podsecuritypolicyselfsubjectreviews": {
                                            "name": "podsecuritypolicyselfsubjectreviews",
                                            "namespaced": true,
                                            "kind": "PodSecurityPolicySelfSubjectReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "podsecuritypolicysubjectreviews": {
                                            "name": "podsecuritypolicysubjectreviews",
                                            "namespaced": true,
                                            "kind": "PodSecurityPolicySubjectReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "securitycontextconstraints": {
                                            "name": "securitycontextconstraints",
                                            "namespaced": false,
                                            "kind": "SecurityContextConstraints",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ],
                                            "shortNames": [
                                                "scc"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "build.openshift.io": {
                            "name": "build.openshift.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "build.openshift.io/v1",
                                    "resources": {
                                        "buildconfigs": {
                                            "name": "buildconfigs",
                                            "namespaced": true,
                                            "kind": "BuildConfig",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "buildconfigs/instantiate": {
                                            "name": "buildconfigs/instantiate",
                                            "namespaced": true,
                                            "kind": "BuildRequest",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "buildconfigs/instantiatebinary": {
                                            "name": "buildconfigs/instantiatebinary",
                                            "namespaced": true,
                                            "kind": "BinaryBuildRequestOptions",
                                            "verbs": []
                                        },
                                        "buildconfigs/webhooks": {
                                            "name": "buildconfigs/webhooks",
                                            "namespaced": true,
                                            "kind": "Build",
                                            "verbs": []
                                        },
                                        "builds": {
                                            "name": "builds",
                                            "namespaced": true,
                                            "kind": "Build",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "builds/clone": {
                                            "name": "builds/clone",
                                            "namespaced": true,
                                            "kind": "BuildRequest",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "builds/details": {
                                            "name": "builds/details",
                                            "namespaced": true,
                                            "kind": "Build",
                                            "verbs": [
                                                "update"
                                            ]
                                        },
                                        "builds/log": {
                                            "name": "builds/log",
                                            "namespaced": true,
                                            "kind": "BuildLog",
                                            "verbs": [
                                                "get"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "network.openshift.io": {
                            "name": "network.openshift.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "network.openshift.io/v1",
                                    "resources": {
                                        "clusternetworks": {
                                            "name": "clusternetworks",
                                            "namespaced": false,
                                            "kind": "ClusterNetwork",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "egressnetworkpolicies": {
                                            "name": "egressnetworkpolicies",
                                            "namespaced": true,
                                            "kind": "EgressNetworkPolicy",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "hostsubnets": {
                                            "name": "hostsubnets",
                                            "namespaced": false,
                                            "kind": "HostSubnet",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "netnamespaces": {
                                            "name": "netnamespaces",
                                            "namespaced": false,
                                            "kind": "NetNamespace",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "user.openshift.io": {
                            "name": "user.openshift.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "user.openshift.io/v1",
                                    "resources": {
                                        "groups": {
                                            "name": "groups",
                                            "namespaced": false,
                                            "kind": "Group",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "identities": {
                                            "name": "identities",
                                            "namespaced": false,
                                            "kind": "Identity",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "useridentitymappings": {
                                            "name": "useridentitymappings",
                                            "namespaced": false,
                                            "kind": "UserIdentityMapping",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "users": {
                                            "name": "users",
                                            "namespaced": false,
                                            "kind": "User",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "authorization.openshift.io": {
                            "name": "authorization.openshift.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "authorization.openshift.io/v1",
                                    "resources": {
                                        "clusterpolicies": {
                                            "name": "clusterpolicies",
                                            "namespaced": false,
                                            "kind": "ClusterPolicy",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "clusterpolicybindings": {
                                            "name": "clusterpolicybindings",
                                            "namespaced": false,
                                            "kind": "ClusterPolicyBinding",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "clusterrolebindings": {
                                            "name": "clusterrolebindings",
                                            "namespaced": false,
                                            "kind": "ClusterRoleBinding",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "get",
                                                "list",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "clusterroles": {
                                            "name": "clusterroles",
                                            "namespaced": false,
                                            "kind": "ClusterRole",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "get",
                                                "list",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "localresourceaccessreviews": {
                                            "name": "localresourceaccessreviews",
                                            "namespaced": true,
                                            "kind": "LocalResourceAccessReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "localsubjectaccessreviews": {
                                            "name": "localsubjectaccessreviews",
                                            "namespaced": true,
                                            "kind": "LocalSubjectAccessReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "policies": {
                                            "name": "policies",
                                            "namespaced": true,
                                            "kind": "Policy",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "policybindings": {
                                            "name": "policybindings",
                                            "namespaced": true,
                                            "kind": "PolicyBinding",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "resourceaccessreviews": {
                                            "name": "resourceaccessreviews",
                                            "namespaced": true,
                                            "kind": "ResourceAccessReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "rolebindingrestrictions": {
                                            "name": "rolebindingrestrictions",
                                            "namespaced": true,
                                            "kind": "RoleBindingRestriction",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "rolebindings": {
                                            "name": "rolebindings",
                                            "namespaced": true,
                                            "kind": "RoleBinding",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "get",
                                                "list",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "roles": {
                                            "name": "roles",
                                            "namespaced": true,
                                            "kind": "Role",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "get",
                                                "list",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "selfsubjectrulesreviews": {
                                            "name": "selfsubjectrulesreviews",
                                            "namespaced": true,
                                            "kind": "SelfSubjectRulesReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "subjectaccessreviews": {
                                            "name": "subjectaccessreviews",
                                            "namespaced": true,
                                            "kind": "SubjectAccessReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "subjectrulesreviews": {
                                            "name": "subjectrulesreviews",
                                            "namespaced": true,
                                            "kind": "SubjectRulesReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "oauth.openshift.io": {
                            "name": "oauth.openshift.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "oauth.openshift.io/v1",
                                    "resources": {
                                        "oauthaccesstokens": {
                                            "name": "oauthaccesstokens",
                                            "namespaced": false,
                                            "kind": "OAuthAccessToken",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "oauthauthorizetokens": {
                                            "name": "oauthauthorizetokens",
                                            "namespaced": false,
                                            "kind": "OAuthAuthorizeToken",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "oauthclientauthorizations": {
                                            "name": "oauthclientauthorizations",
                                            "namespaced": false,
                                            "kind": "OAuthClientAuthorization",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "oauthclients": {
                                            "name": "oauthclients",
                                            "namespaced": false,
                                            "kind": "OAuthClient",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        }
                    }
                },
                api: {
                    "openshift": {
                        "hostPort": "127.0.0.1:8080",
                        "prefix": "/oapi",
                        "resources": {
                            "v1": {
                                "appliedclusterresourcequotas": {
                                    "name": "appliedclusterresourcequotas",
                                    "namespaced": true,
                                    "kind": "AppliedClusterResourceQuota",
                                    "verbs": [
                                        "get",
                                        "list"
                                    ]
                                },
                                "buildconfigs": {
                                    "name": "buildconfigs",
                                    "namespaced": true,
                                    "kind": "BuildConfig",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "buildconfigs/instantiate": {
                                    "name": "buildconfigs/instantiate",
                                    "namespaced": true,
                                    "kind": "BuildRequest",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "buildconfigs/instantiatebinary": {
                                    "name": "buildconfigs/instantiatebinary",
                                    "namespaced": true,
                                    "kind": "BinaryBuildRequestOptions",
                                    "verbs": []
                                },
                                "buildconfigs/webhooks": {
                                    "name": "buildconfigs/webhooks",
                                    "namespaced": true,
                                    "kind": "Build",
                                    "verbs": []
                                },
                                "builds": {
                                    "name": "builds",
                                    "namespaced": true,
                                    "kind": "Build",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "builds/clone": {
                                    "name": "builds/clone",
                                    "namespaced": true,
                                    "kind": "BuildRequest",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "builds/details": {
                                    "name": "builds/details",
                                    "namespaced": true,
                                    "kind": "Build",
                                    "verbs": [
                                        "update"
                                    ]
                                },
                                "builds/log": {
                                    "name": "builds/log",
                                    "namespaced": true,
                                    "kind": "BuildLog",
                                    "verbs": [
                                        "get"
                                    ]
                                },
                                "clusternetworks": {
                                    "name": "clusternetworks",
                                    "namespaced": false,
                                    "kind": "ClusterNetwork",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "clusterpolicies": {
                                    "name": "clusterpolicies",
                                    "namespaced": false,
                                    "kind": "ClusterPolicy",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "clusterpolicybindings": {
                                    "name": "clusterpolicybindings",
                                    "namespaced": false,
                                    "kind": "ClusterPolicyBinding",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "clusterresourcequotas": {
                                    "name": "clusterresourcequotas",
                                    "namespaced": false,
                                    "kind": "ClusterResourceQuota",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "clusterresourcequotas/status": {
                                    "name": "clusterresourcequotas/status",
                                    "namespaced": false,
                                    "kind": "ClusterResourceQuota",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "clusterrolebindings": {
                                    "name": "clusterrolebindings",
                                    "namespaced": false,
                                    "kind": "ClusterRoleBinding",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "get",
                                        "list",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "clusterroles": {
                                    "name": "clusterroles",
                                    "namespaced": false,
                                    "kind": "ClusterRole",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "get",
                                        "list",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "deploymentconfigrollbacks": {
                                    "name": "deploymentconfigrollbacks",
                                    "namespaced": true,
                                    "kind": "DeploymentConfigRollback",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "deploymentconfigs": {
                                    "name": "deploymentconfigs",
                                    "namespaced": true,
                                    "kind": "DeploymentConfig",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "deploymentconfigs/instantiate": {
                                    "name": "deploymentconfigs/instantiate",
                                    "namespaced": true,
                                    "kind": "DeploymentRequest",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "deploymentconfigs/log": {
                                    "name": "deploymentconfigs/log",
                                    "namespaced": true,
                                    "kind": "DeploymentLog",
                                    "verbs": [
                                        "get"
                                    ]
                                },
                                "deploymentconfigs/rollback": {
                                    "name": "deploymentconfigs/rollback",
                                    "namespaced": true,
                                    "kind": "DeploymentConfigRollback",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "deploymentconfigs/scale": {
                                    "name": "deploymentconfigs/scale",
                                    "namespaced": true,
                                    "kind": "Scale",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "deploymentconfigs/status": {
                                    "name": "deploymentconfigs/status",
                                    "namespaced": true,
                                    "kind": "DeploymentConfig",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "egressnetworkpolicies": {
                                    "name": "egressnetworkpolicies",
                                    "namespaced": true,
                                    "kind": "EgressNetworkPolicy",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "generatedeploymentconfigs": {
                                    "name": "generatedeploymentconfigs",
                                    "namespaced": true,
                                    "kind": "DeploymentConfig",
                                    "verbs": []
                                },
                                "groups": {
                                    "name": "groups",
                                    "namespaced": false,
                                    "kind": "Group",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "hostsubnets": {
                                    "name": "hostsubnets",
                                    "namespaced": false,
                                    "kind": "HostSubnet",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "identities": {
                                    "name": "identities",
                                    "namespaced": false,
                                    "kind": "Identity",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "images": {
                                    "name": "images",
                                    "namespaced": false,
                                    "kind": "Image",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "imagesignatures": {
                                    "name": "imagesignatures",
                                    "namespaced": false,
                                    "kind": "ImageSignature",
                                    "verbs": [
                                        "create",
                                        "delete"
                                    ]
                                },
                                "imagestreamimages": {
                                    "name": "imagestreamimages",
                                    "namespaced": true,
                                    "kind": "ImageStreamImage",
                                    "verbs": [
                                        "get"
                                    ]
                                },
                                "imagestreamimports": {
                                    "name": "imagestreamimports",
                                    "namespaced": true,
                                    "kind": "ImageStreamImport",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "imagestreammappings": {
                                    "name": "imagestreammappings",
                                    "namespaced": true,
                                    "kind": "ImageStreamMapping",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "imagestreams": {
                                    "name": "imagestreams",
                                    "namespaced": true,
                                    "kind": "ImageStream",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "imagestreams/secrets": {
                                    "name": "imagestreams/secrets",
                                    "namespaced": true,
                                    "kind": "SecretList",
                                    "verbs": [
                                        "get"
                                    ]
                                },
                                "imagestreams/status": {
                                    "name": "imagestreams/status",
                                    "namespaced": true,
                                    "kind": "ImageStream",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "imagestreamtags": {
                                    "name": "imagestreamtags",
                                    "namespaced": true,
                                    "kind": "ImageStreamTag",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "get",
                                        "list",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "localresourceaccessreviews": {
                                    "name": "localresourceaccessreviews",
                                    "namespaced": true,
                                    "kind": "LocalResourceAccessReview",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "localsubjectaccessreviews": {
                                    "name": "localsubjectaccessreviews",
                                    "namespaced": true,
                                    "kind": "LocalSubjectAccessReview",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "netnamespaces": {
                                    "name": "netnamespaces",
                                    "namespaced": false,
                                    "kind": "NetNamespace",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "oauthaccesstokens": {
                                    "name": "oauthaccesstokens",
                                    "namespaced": false,
                                    "kind": "OAuthAccessToken",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "oauthauthorizetokens": {
                                    "name": "oauthauthorizetokens",
                                    "namespaced": false,
                                    "kind": "OAuthAuthorizeToken",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "oauthclientauthorizations": {
                                    "name": "oauthclientauthorizations",
                                    "namespaced": false,
                                    "kind": "OAuthClientAuthorization",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "oauthclients": {
                                    "name": "oauthclients",
                                    "namespaced": false,
                                    "kind": "OAuthClient",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "podsecuritypolicyreviews": {
                                    "name": "podsecuritypolicyreviews",
                                    "namespaced": true,
                                    "kind": "PodSecurityPolicyReview",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "podsecuritypolicyselfsubjectreviews": {
                                    "name": "podsecuritypolicyselfsubjectreviews",
                                    "namespaced": true,
                                    "kind": "PodSecurityPolicySelfSubjectReview",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "podsecuritypolicysubjectreviews": {
                                    "name": "podsecuritypolicysubjectreviews",
                                    "namespaced": true,
                                    "kind": "PodSecurityPolicySubjectReview",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "policies": {
                                    "name": "policies",
                                    "namespaced": true,
                                    "kind": "Policy",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "policybindings": {
                                    "name": "policybindings",
                                    "namespaced": true,
                                    "kind": "PolicyBinding",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "processedtemplates": {
                                    "name": "processedtemplates",
                                    "namespaced": true,
                                    "kind": "Template",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "projectrequests": {
                                    "name": "projectrequests",
                                    "namespaced": false,
                                    "kind": "ProjectRequest",
                                    "verbs": [
                                        "create",
                                        "list"
                                    ]
                                },
                                "projects": {
                                    "name": "projects",
                                    "namespaced": false,
                                    "kind": "Project",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "resourceaccessreviews": {
                                    "name": "resourceaccessreviews",
                                    "namespaced": true,
                                    "kind": "ResourceAccessReview",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "rolebindingrestrictions": {
                                    "name": "rolebindingrestrictions",
                                    "namespaced": true,
                                    "kind": "RoleBindingRestriction",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "rolebindings": {
                                    "name": "rolebindings",
                                    "namespaced": true,
                                    "kind": "RoleBinding",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "get",
                                        "list",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "roles": {
                                    "name": "roles",
                                    "namespaced": true,
                                    "kind": "Role",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "get",
                                        "list",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "routes": {
                                    "name": "routes",
                                    "namespaced": true,
                                    "kind": "Route",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "routes/status": {
                                    "name": "routes/status",
                                    "namespaced": true,
                                    "kind": "Route",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "selfsubjectrulesreviews": {
                                    "name": "selfsubjectrulesreviews",
                                    "namespaced": true,
                                    "kind": "SelfSubjectRulesReview",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "subjectaccessreviews": {
                                    "name": "subjectaccessreviews",
                                    "namespaced": true,
                                    "kind": "SubjectAccessReview",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "subjectrulesreviews": {
                                    "name": "subjectrulesreviews",
                                    "namespaced": true,
                                    "kind": "SubjectRulesReview",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "templates": {
                                    "name": "templates",
                                    "namespaced": true,
                                    "kind": "Template",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "useridentitymappings": {
                                    "name": "useridentitymappings",
                                    "namespaced": false,
                                    "kind": "UserIdentityMapping",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "users": {
                                    "name": "users",
                                    "namespaced": false,
                                    "kind": "User",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                }
                            }
                        }
                    },
                    "k8s": {
                        "hostPort": "127.0.0.1:8080",
                        "prefix": "/api",
                        "resources": {
                            "v1": {
                                "bindings": {
                                    "name": "bindings",
                                    "namespaced": true,
                                    "kind": "Binding",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "componentstatuses": {
                                    "name": "componentstatuses",
                                    "namespaced": false,
                                    "kind": "ComponentStatus",
                                    "verbs": [
                                        "get",
                                        "list"
                                    ],
                                    "shortNames": [
                                        "cs"
                                    ]
                                },
                                "configmaps": {
                                    "name": "configmaps",
                                    "namespaced": true,
                                    "kind": "ConfigMap",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ],
                                    "shortNames": [
                                        "cm"
                                    ]
                                },
                                "endpoints": {
                                    "name": "endpoints",
                                    "namespaced": true,
                                    "kind": "Endpoints",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ],
                                    "shortNames": [
                                        "ep"
                                    ]
                                },
                                "events": {
                                    "name": "events",
                                    "namespaced": true,
                                    "kind": "Event",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ],
                                    "shortNames": [
                                        "ev"
                                    ]
                                },
                                "limitranges": {
                                    "name": "limitranges",
                                    "namespaced": true,
                                    "kind": "LimitRange",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ],
                                    "shortNames": [
                                        "limits"
                                    ]
                                },
                                "namespaces": {
                                    "name": "namespaces",
                                    "namespaced": false,
                                    "kind": "Namespace",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ],
                                    "shortNames": [
                                        "ns"
                                    ]
                                },
                                "namespaces/finalize": {
                                    "name": "namespaces/finalize",
                                    "namespaced": false,
                                    "kind": "Namespace",
                                    "verbs": [
                                        "update"
                                    ]
                                },
                                "namespaces/status": {
                                    "name": "namespaces/status",
                                    "namespaced": false,
                                    "kind": "Namespace",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "nodes": {
                                    "name": "nodes",
                                    "namespaced": false,
                                    "kind": "Node",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "proxy",
                                        "update",
                                        "watch"
                                    ],
                                    "shortNames": [
                                        "no"
                                    ]
                                },
                                "nodes/proxy": {
                                    "name": "nodes/proxy",
                                    "namespaced": false,
                                    "kind": "Node",
                                    "verbs": []
                                },
                                "nodes/status": {
                                    "name": "nodes/status",
                                    "namespaced": false,
                                    "kind": "Node",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "persistentvolumeclaims": {
                                    "name": "persistentvolumeclaims",
                                    "namespaced": true,
                                    "kind": "PersistentVolumeClaim",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ],
                                    "shortNames": [
                                        "pvc"
                                    ]
                                },
                                "persistentvolumeclaims/status": {
                                    "name": "persistentvolumeclaims/status",
                                    "namespaced": true,
                                    "kind": "PersistentVolumeClaim",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "persistentvolumes": {
                                    "name": "persistentvolumes",
                                    "namespaced": false,
                                    "kind": "PersistentVolume",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ],
                                    "shortNames": [
                                        "pv"
                                    ]
                                },
                                "persistentvolumes/status": {
                                    "name": "persistentvolumes/status",
                                    "namespaced": false,
                                    "kind": "PersistentVolume",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "pods": {
                                    "name": "pods",
                                    "namespaced": true,
                                    "kind": "Pod",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "proxy",
                                        "update",
                                        "watch"
                                    ],
                                    "shortNames": [
                                        "po"
                                    ]
                                },
                                "pods/attach": {
                                    "name": "pods/attach",
                                    "namespaced": true,
                                    "kind": "Pod",
                                    "verbs": []
                                },
                                "pods/binding": {
                                    "name": "pods/binding",
                                    "namespaced": true,
                                    "kind": "Binding",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "pods/eviction": {
                                    "name": "pods/eviction",
                                    "namespaced": true,
                                    "kind": "Eviction",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "pods/exec": {
                                    "name": "pods/exec",
                                    "namespaced": true,
                                    "kind": "Pod",
                                    "verbs": []
                                },
                                "pods/log": {
                                    "name": "pods/log",
                                    "namespaced": true,
                                    "kind": "Pod",
                                    "verbs": [
                                        "get"
                                    ]
                                },
                                "pods/portforward": {
                                    "name": "pods/portforward",
                                    "namespaced": true,
                                    "kind": "Pod",
                                    "verbs": []
                                },
                                "pods/proxy": {
                                    "name": "pods/proxy",
                                    "namespaced": true,
                                    "kind": "Pod",
                                    "verbs": []
                                },
                                "pods/status": {
                                    "name": "pods/status",
                                    "namespaced": true,
                                    "kind": "Pod",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "podtemplates": {
                                    "name": "podtemplates",
                                    "namespaced": true,
                                    "kind": "PodTemplate",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "replicationcontrollers": {
                                    "name": "replicationcontrollers",
                                    "namespaced": true,
                                    "kind": "ReplicationController",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ],
                                    "shortNames": [
                                        "rc"
                                    ]
                                },
                                "replicationcontrollers/scale": {
                                    "name": "replicationcontrollers/scale",
                                    "namespaced": true,
                                    "kind": "Scale",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "replicationcontrollers/status": {
                                    "name": "replicationcontrollers/status",
                                    "namespaced": true,
                                    "kind": "ReplicationController",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "resourcequotas": {
                                    "name": "resourcequotas",
                                    "namespaced": true,
                                    "kind": "ResourceQuota",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ],
                                    "shortNames": [
                                        "quota"
                                    ]
                                },
                                "resourcequotas/status": {
                                    "name": "resourcequotas/status",
                                    "namespaced": true,
                                    "kind": "ResourceQuota",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "secrets": {
                                    "name": "secrets",
                                    "namespaced": true,
                                    "kind": "Secret",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "securitycontextconstraints": {
                                    "name": "securitycontextconstraints",
                                    "namespaced": false,
                                    "kind": "SecurityContextConstraints",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ],
                                    "shortNames": [
                                        "scc"
                                    ]
                                },
                                "serviceaccounts": {
                                    "name": "serviceaccounts",
                                    "namespaced": true,
                                    "kind": "ServiceAccount",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ],
                                    "shortNames": [
                                        "sa"
                                    ]
                                },
                                "services": {
                                    "name": "services",
                                    "namespaced": true,
                                    "kind": "Service",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "get",
                                        "list",
                                        "patch",
                                        "proxy",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "services/proxy": {
                                    "name": "services/proxy",
                                    "namespaced": true,
                                    "kind": "Service",
                                    "verbs": []
                                },
                                "services/status": {
                                    "name": "services/status",
                                    "namespaced": true,
                                    "kind": "Service",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                }
                            }
                        }
                    }
                }
            };
            var API_CFG = _.get(window.OPENSHIFT_CONFIG, "api", {})
            var APIS_CFG = _.get(window.OPENSHIFT_CONFIG, "apis", {})

            console.log('window.OPENSHIFT_CONFIG', JSON.stringify(window.OPENSHIFT_CONFIG));
            // toResourceGroupVersion() returns a ResourceGroupVersion.
            // If resource is already a ResourceGroupVersion, returns itself.
            //
            // if r is a string, the empty group and default version for the empty group are assumed.
            //
            // if r is an object, the resource, group, and version attributes are read.
            // a missing group attribute defaults to the legacy group.
            // a missing version attribute defaults to the default version for the group, or undefined if the group is unknown.
            //
            // if r is already a ResourceGroupVersion, it is returned as-is
            var toResourceGroupVersion = function(r) {
                if (r instanceof ResourceGroupVersion) {
                    return r;
                }
                var resource, group, version;
                if (angular.isString(r)) {
                    resource = normalizeResource(r);
                    group = '';
                    version = defaultVersion[group];
                } else if (r && r.resource) {
                    resource = normalizeResource(r.resource);
                    group = r.group || '';
                    version = r.version || defaultVersion[group] || _.get(APIS_CFG, ["groups", group, "preferredVersion"]);
                }
                return new ResourceGroupVersion(resource, group, version);
            };

            // normalizeResource lowercases the first segment of the given resource. subresources can be case-sensitive.
            function normalizeResource(resource) {
                if (!resource) {
                    return resource;
                }
                var i = resource.indexOf('/');
                if (i === -1) {
                    return resource.toLowerCase();
                }
                return resource.substring(0, i).toLowerCase() + resource.substring(i);
            }

            // port of group_version.go#ParseGroupVersion
            var parseGroupVersion = function(apiVersion) {
                if (!apiVersion) {
                    return undefined;
                }
                var parts = apiVersion.split("/");
                if (parts.length === 1) {
                    if (parts[0] === "v1") {
                        return { group: '', version: parts[0] };
                    }
                    return { group: parts[0], version: '' };
                }
                if (parts.length === 2) {
                    return { group: parts[0], version: parts[1] };
                }
                Logger.warn('Invalid apiVersion "' + apiVersion + '"');
                return undefined;
            };

            var objectToResourceGroupVersion = function(apiObject) {
                if (!apiObject || !apiObject.kind || !apiObject.apiVersion) {
                    return undefined;
                }
                var resource = kindToResource(apiObject.kind);
                if (!resource) {
                    return undefined;
                }
                var groupVersion = parseGroupVersion(apiObject.apiVersion);
                if (!groupVersion) {
                    return undefined;
                }
                return new ResourceGroupVersion(resource, groupVersion.group, groupVersion.version);
            };

            // deriveTargetResource figures out the fully qualified destination to submit the object to.
            // if resource is a string, and the object's kind matches the resource, the object's group/version are used.
            // if resource is a ResourceGroupVersion, and the object's kind and group match, the object's version is used.
            // otherwise, resource is used as-is.
            var deriveTargetResource = function(resource, object) {
                if (!resource || !object) {
                    return undefined;
                }
                var objectResource = kindToResource(object.kind);
                var objectGroupVersion = parseGroupVersion(object.apiVersion);
                var resourceGroupVersion = toResourceGroupVersion(resource);
                if (!objectResource || !objectGroupVersion || !resourceGroupVersion) {
                    return undefined;
                }

                // We specified something like "pods"
                if (angular.isString(resource)) {
                    // If the object had a matching kind {"kind":"Pod","apiVersion":"v1"}, use the group/version from the object
                    if (resourceGroupVersion.equals(objectResource)) {
                        resourceGroupVersion.group = objectGroupVersion.group;
                        resourceGroupVersion.version = objectGroupVersion.version;
                    }
                    return resourceGroupVersion;
                }

                // If the resource was already a fully specified object,
                // require the group to match as well before taking the version from the object
                if (resourceGroupVersion.equals(objectResource, objectGroupVersion.group)) {
                    resourceGroupVersion.version = objectGroupVersion.version;
                }
                return resourceGroupVersion;
            };

            // port of restmapper.go#kindToResource
            // humanize will add spaces between words in the resource
            function kindToResource(kind, humanize) {
                if (!kind) {
                    return "";
                }
                var resource = kind;
                if (humanize) {
                    var humanizeKind = $filter("humanizeKind");
                    resource = humanizeKind(resource);
                }
                resource = String(resource).toLowerCase();
                if (resource === 'endpoints' || resource === 'securitycontextconstraints') {
                    // no-op, plural is the singular
                } else if (resource[resource.length - 1] === 's') {
                    resource = resource + 'es';
                } else if (resource[resource.length - 1] === 'y') {
                    resource = resource.substring(0, resource.length - 1) + 'ies';
                } else {
                    resource = resource + 's';
                }

                return resource;
            }

            function kindToResourceGroupVersion(kind) {
                return toResourceGroupVersion({
                    resource: kindToResource(kind.kind),
                    group: kind.group
                });
            }

            // apiInfo returns the host/port, prefix, group, and version for the given resource,
            // or undefined if the specified resource/group/version is known not to exist.

            var apiInfo = function(resource) {
                // If API discovery had any failures, calls to api info should redirect to the error page
                if (APIS_CFG.API_DISCOVERY_ERRORS) {
                    var possibleCertFailure = _.every(APIS_CFG.API_DISCOVERY_ERRORS, function(error) {
                        return _.get(error, "data.status") === 0;
                    });
                    if (possibleCertFailure && !AuthService.isLoggedIn()) {
                        // will trigger a login flow which will redirect to the api server
                        AuthService.withUser();
                        return;
                    }
                    var fatal = false;
                    _.each(APIS_CFG.API_DISCOVERY_ERRORS, function(discoveryError) {
                        if (discoveryError.fatal) {
                            Logger.error('API discovery failed (fatal error)', discoveryError);
                            fatal = true;
                            return;
                        }

                        Logger.warn('API discovery failed', discoveryError);
                    });
                    if (fatal) {
                        // Go to the error page on fatal errors, the server might be down.
                        // Can't use Navigate.toErrorPage or it will create a circular
                        // dependency
                        $window.location.href = URI('error').query({
                            error_description: "Unable to load details about the server. If the problem continues, please contact your system administrator.",
                            error: "API_DISCOVERY"
                        }).toString();
                        return;
                    }
                }

                resource = toResourceGroupVersion(resource);
                var primaryResource = resource.primaryResource();
                var discoveredResource;
                // API info for resources in an API group, if the resource was not found during discovery return undefined
                if (resource.group) {
                    discoveredResource = _.get(APIS_CFG, ["groups", resource.group, "versions", resource.version, "resources", primaryResource]);
                    if (!discoveredResource) {
                        return undefined;
                    }
                    var hostPrefixObj = _.get(APIS_CFG, ["groups", resource.group, 'hostPrefix']) || APIS_CFG;

                    return {
                        resource: resource.resource,
                        group: resource.group,
                        version: resource.version,
                        protocol: hostPrefixObj.protocol,
                        hostPort: hostPrefixObj.hostPort,
                        prefix: hostPrefixObj.prefix,
                        namespaced: discoveredResource.namespaced,
                        verbs: discoveredResource.verbs
                    };
                }

                // Resources without an API group could be legacy k8s or origin resources.
                // Scan through resources to determine which this is.
                var api;
                for (var apiName in API_CFG) {
                    api = API_CFG[apiName];
                    discoveredResource = _.get(api, ["resources", resource.version, primaryResource]);
                    if (!discoveredResource) {
                        continue;
                    }
                    return {
                        resource: resource.resource,
                        version: resource.version,
                        hostPort: api.hostPort,
                        prefix: api.prefix,
                        namespaced: discoveredResource.namespaced,
                        verbs: discoveredResource.verbs
                    };
                }
                return undefined;
            };

            var invalidObjectKindOrVersion = function(apiObject) {
                var kind = "<none>";
                var version = "<none>";
                if (apiObject && apiObject.kind) { kind = apiObject.kind; }
                if (apiObject && apiObject.apiVersion) { version = apiObject.apiVersion; }
                return "Invalid kind (" + kind + ") or API version (" + version + ")";
            };
            var unsupportedObjectKindOrVersion = function(apiObject) {
                var kind = "<none>";
                var version = "<none>";
                if (apiObject && apiObject.kind) { kind = apiObject.kind; }
                if (apiObject && apiObject.apiVersion) { version = apiObject.apiVersion; }
                return "The API version " + version + " for kind " + kind + " is not supported by this server";
            };

            // Exclude duplicate kinds we know about that map to the same storage as another
            //  group/kind.  This is unusual, so we are special casing these.
            var dedupeGroups = [{ group: 'authorization.openshift.io' }];
            var dedupeKinds = [{ group: 'extensions', kind: 'HorizontalPodAutoscaler' }];

            var excludeKindFromAPIGroupList = function(groupName, resourceKind) {
                return !!(
                    _.find(dedupeKinds, { group: groupName, kind: resourceKind }) ||
                    _.find(dedupeGroups, { group: groupName })
                );
            };

            // Returns an array of available kinds, including their group
            // var calculateAvailableKinds = function(includeClusterScoped) {
            //     var kinds = [];
            //     var rejectedKinds = _.map(Constants.AVAILABLE_KINDS_BLACKLIST, function(kind) {
            //         return _.isString(kind) ? { kind: kind, group: '' } :
            //             kind;
            //     });

            //     // ignore the legacy openshift kinds, these have been migrated to api groups
            //     _.each(_.pickBy(API_CFG, function(value, key) {
            //         return key !== 'openshift';
            //     }), function(api) {
            //         _.each(api.resources.v1, function(resource) {
            //             if (resource.namespaced || includeClusterScoped) {
            //                 // Exclude subresources and any rejected kinds
            //                 if (_.includes(resource.name, '/') || _.find(rejectedKinds, { kind: resource.kind, group: '' })) {
            //                     return;
            //                 }

            //                 kinds.push({
            //                     kind: resource.kind,
            //                     group: ''
            //                 });
            //             }
            //         });
            //     });

            //     // Kinds under api groups
            //     _.each(APIS_CFG.groups, function(group) {

            //         // Use the console's default version first, and the server's preferred version second
            //         var preferredVersion = defaultVersion[group.name] || group.preferredVersion;
            //         _.each(group.versions[preferredVersion].resources, function(resource) {
            //             // Exclude subresources and any rejected kinds
            //             if (_.includes(resource.name, '/') || _.find(rejectedKinds, { kind: resource.kind, group: group.name })) {
            //                 return;
            //             }


            //             if (excludeKindFromAPIGroupList(group.name, resource.kind)) {
            //                 return;
            //             }

            //             if (resource.namespaced || includeClusterScoped) {
            //                 kinds.push({
            //                     kind: resource.kind,
            //                     group: group.name
            //                 });
            //             }
            //         });
            //     });

            //     return _.uniqBy(kinds, function(value) {
            //         return value.group + "/" + value.kind;
            //     });
            // };

            // var namespacedKinds = calculateAvailableKinds(false);
            // var allKinds = calculateAvailableKinds(true);

            // var availableKinds = function(includeClusterScoped) {
            //     return includeClusterScoped ? allKinds : namespacedKinds;
            // };

            // Provides us a way to ensure we consistently use the
            // correct {resource, group} for API calls.  Version
            // will typically fallback to the preferredVersion of the API
            // var getPreferredVersion = function(resource) {
            //     var preferred = API_PREFERRED_VERSIONS[resource];
            //     if (!preferred) {
            //         Logger.log("No preferred version for ", resource);
            //     }
            //     return preferred;
            // };

            return {
                toResourceGroupVersion: toResourceGroupVersion,

                parseGroupVersion: parseGroupVersion,

                objectToResourceGroupVersion: objectToResourceGroupVersion,

                deriveTargetResource: deriveTargetResource,

                kindToResource: kindToResource,

                kindToResourceGroupVersion: kindToResourceGroupVersion,

                apiInfo: apiInfo,

                invalidObjectKindOrVersion: invalidObjectKindOrVersion,
                unsupportedObjectKindOrVersion: unsupportedObjectKindOrVersion,
                // availableKinds: availableKinds,
                //getPreferredVersion: getPreferredVersion
            };
        }])

        .factory('TaskList', ['$timeout',
                function($timeout) {

            // Maximum amount of time that a successful task will hang around after completion
            var TASK_TIMEOUT = 60 * 1000;

            function TaskList() {
                this.tasks = [];
            }

            var taskList = new TaskList();

            TaskList.prototype.add = function(titles, helpLinks, namespace, action) {
                // Set up the task
                var task = {
                    status: "started",
                    titles: titles,
                    helpLinks: helpLinks,
                    namespace: namespace
                };

                // Add the new task
                this.tasks.push(task);

                // Trigger the action
                action().then(function(result) {
                    // On completion, set status, hasErrors, and alerts
                    task.status = "completed";
                    task.hasErrors = result.hasErrors || false;
                    task.alerts = result.alerts || [];

                    // If the message has errors, return... it will show until dismissed
                    if (task.hasErrors) {
                        return;
                    }

                    // Otherwise, queue the message to be deleted
                    // $timeout handles calling us in an apply loop
                    $timeout(function() {
                        taskList.deleteTask(task);
                    }, TASK_TIMEOUT);
                });
            };

            TaskList.prototype.taskList = function() {
                return this.tasks;
            };

            // deleteTask removes the task from the list of tasks
            // should be called in an apply loop
            TaskList.prototype.deleteTask = function(task) {
                // Splice in place so the view's variable changes
                var i = taskList.tasks.indexOf(task);
                if (i >= 0) {
                    this.tasks.splice(i, 1);
                }
            };

            // clear removes all task from the list of tasks
            TaskList.prototype.clear = function() {
                taskList.tasks = [];
            };


            return taskList;
        }])

        .factory("QuotaService", ['APIService', '$filter', '$rootScope', '$q', 'Constants', 'DataService',
                    function(APIService, $filter, $rootScope, $q, Constants, DataService) {
                var isNil = $filter('isNil');
                var usageValue = $filter('usageValue');
                var usageWithUnits = $filter('usageWithUnits');
                var percent = $filter('percent');

                var isBestEffortPod = function(pod) {
                    // To be best effort a pod must not have any containers that have non-zero requests or limits
                    // Break out as soon as we find any pod with a non-zero request or limit
                    return _.every(pod.spec.containers, function(container) {
                        var hasNonZeroRequest = _.some(_.get(container, 'resources.requests'), function(request) {
                            return !isNil(request) && usageValue(request) !== 0;
                        });
                        var hasNonZeroLimit = _.some(_.get(container, 'resources.limits'), function(limit) {
                            return !isNil(limit) && usageValue(limit) !== 0;
                        });
                        return !hasNonZeroRequest && !hasNonZeroLimit;
                    });
                };

                var isTerminatingPod = function(pod) {
                    // a pod is terminating if activeDeadlineSeconds is set, ADS can be zero
                    return _.has(pod, 'spec.activeDeadlineSeconds');
                };

                var filterQuotasForPodTemplate = function(podTemplate, quotas) {
                    var bestEffortPod = isBestEffortPod(podTemplate);
                    var terminatingPod = isTerminatingPod(podTemplate);
                    return _.filter(quotas, function(quota) {
                        // A quota matches a pod if all scopes match the pod
                        // Break out early if we find any scope that does not match
                        var matchesPod = function(scope) {
                            switch (scope) {
                                case "Terminating":
                                    return terminatingPod;
                                case "NotTerminating":
                                    return !terminatingPod;
                                case "BestEffort":
                                    return bestEffortPod;
                                case "NotBestEffort":
                                    return !bestEffortPod;
                            }
                            return true;
                        };
                        var scopes = quota.spec.quota ? quota.spec.quota.scopes : quota.spec.scopes;
                        return _.every(scopes, matchesPod);
                    });
                };

                var filterQuotasForResource = function(resource, quotas) {
                    if (!resource) {
                        return quotas;
                    }
                    if (resource.kind === 'Pod') {
                        return filterQuotasForPodTemplate(resource, quotas);
                    } else if (_.has(resource, "spec.template")) {
                        return filterQuotasForPodTemplate(resource.spec.template, quotas);
                    }
                    // We plan on having other resources that scopes will affect
                    return quotas;
                };

                var humanizeQuotaResource = $filter('humanizeQuotaResource');
                var humanizeKind = $filter('humanizeKind');

                var getQuotaResourceReachedAlert = function(quota, resource, type) {
                    var q = quota.status.total || quota.status;
                    if (usageValue(q.hard[type]) <= usageValue(q.used[type])) {
                        var details, message;
                        if (resource.kind === 'Pod') {
                            details = "You will not be able to create the " + humanizeKind(resource.kind) + " '" + resource.metadata.name + "'.";
                        } else {
                            details = "You can still create " + humanizeKind(resource.kind) + " '" + resource.metadata.name + "' but no pods will be created until resources are freed.";
                        }
                        if (type === "pods") {
                            message = 'You are at your quota for pods.';
                        } else {
                            message = 'You are at your quota for ' + humanizeQuotaResource(type) + ' on pods.';
                        }
                        return {
                            type: resource.kind === 'Pod' ? 'error' : 'warning',
                            message: message,
                            details: details,
                            links: [{
                                href: "project/" + quota.metadata.namespace + "/quota",
                                label: "View Quota",
                                target: "_blank"
                            }]
                        };
                    }
                    return null;
                };

                var QUOTA_TYPE_TO_RESOURCE = {
                    'cpu': "resources.requests.cpu",
                    'requests.cpu': "resources.requests.cpu",
                    'limits.cpu': "resources.limits.cpu",
                    'memory': "resources.requests.memory",
                    'requests.memory': "resources.requests.memory",
                    'limits.memory': "resources.limits.memory",
                    'persistentvolumeclaims': "resources.limits.persistentvolumeclaims",
                    'requests.storage': "resources.request.storage"
                };

                var getRequestedResourceQuotaAlert = function(quota, resource, podTemplate, type) {
                    var q = quota.status.total || quota.status;
                    var containerField = QUOTA_TYPE_TO_RESOURCE[type];
                    var templateTotal = 0;
                    _.each(podTemplate.spec.containers, function(container) {
                        var templateVal = _.get(container, containerField);
                        if (templateVal) {
                            templateTotal += usageValue(templateVal);
                        }
                    });
                    if (usageValue(q.hard[type]) < usageValue(q.used[type]) + templateTotal) {
                        var detail;
                        if (resource.kind === 'Pod') {
                            detail = "You may not be able to create the " + humanizeKind(resource.kind) + " '" + resource.metadata.name + "'.";
                        } else {
                            detail = "You can still create " + humanizeKind(resource.kind) + " '" + resource.metadata.name + "' but you may not have pods created until resources are freed.";
                        }
                        return {
                            type: 'warning',
                            message: 'You are close to your quota for ' + humanizeQuotaResource(type) + " on pods.",
                            details: detail,
                            links: [{
                                href: "project/" + quota.metadata.namespace + "/quota",
                                label: "View Quota",
                                target: "_blank"
                            }]
                        };
                    }
                };

                var getResourceLimitAlerts = function(resource, quota) {
                    var alerts = [];
                    var podTemplate = resource.kind === "Pod" ? resource : _.get(resource, 'spec.template');
                    if (!podTemplate) {
                        // Didn't have a pod template, so we don't care about this resource
                        return alerts;
                    }

                    // Otherwise this is a pod or something that creates pods so return alerts if we are at quota already
                    // for any of these.  If you add new types to this list, add them to the type map above, or exclude
                    // them from the total checks.
                    _.each([
                        'cpu',
                        'memory',
                        'requests.cpu',
                        'requests.memory',
                        'limits.cpu',
                        'limits.memory',
                        'pods'
                    ], function(type) {
                        var q = quota.status.total || quota.status;
                        // Don't check 'pods' quota if the resource is a pod, that will create duplicate warnings in combination with getQuotaAlerts
                        if (resource.kind === 'Pod' && type === 'pods') {
                            return;
                        }

                        if (!_.has(q, ['hard', type]) || !_.has(q, ['used', type])) {
                            return;
                        }

                        var quotaReachedAlert = getQuotaResourceReachedAlert(quota, resource, type);
                        if (quotaReachedAlert) {
                            alerts.push(quotaReachedAlert);
                        } else if (type !== 'pods') {
                            // Only calculate this if we havent already reached quota
                            var requestedAlert = getRequestedResourceQuotaAlert(quota, resource, podTemplate, type);
                            if (requestedAlert) {
                                alerts.push(requestedAlert);
                            }
                        }
                    });

                    return alerts;
                };

                var getQuotaAlerts = function(resources, quotas, clusterQuotas) {
                    var alerts = [];

                    if (!resources || !quotas) {
                        return alerts;
                    }

                    _.each(resources, function(resource) {
                        var filteredQuotas = filterQuotasForResource(resource, quotas);
                        var filteredClusterQuotas = filterQuotasForResource(resource, clusterQuotas);

                        var rgv = APIService.objectToResourceGroupVersion(resource);
                        if (!rgv) {
                            return;
                        }

                        var humanizedResource = APIService.kindToResource(resource.kind, true);
                        var humanizedKind = humanizeKind(resource.kind);
                        var quotaKey = "";
                        if (rgv.group) {
                            quotaKey = rgv.group + "/";
                        }
                        quotaKey += rgv.resource;
                        var alertsForQuota = function(quota) {
                            var q = quota.status.total || quota.status;
                            if (!isNil(q.hard[quotaKey]) && usageValue(q.hard[quotaKey]) <= usageValue(q.used[quotaKey])) {
                                alerts.push({
                                    type: 'error',
                                    message: "You are at your quota of " + q.hard[quotaKey] + " " + (q.hard[quotaKey] === "1" ? humanizedKind : humanizedResource) +
                                        " in this project.",
                                    details: "You will not be able to create the " + humanizedKind + " '" + resource.metadata.name + "'.",
                                    links: [{
                                        href: "project/" + quota.metadata.namespace + "/quota",
                                        label: "View Quota",
                                        target: "_blank"
                                    }]
                                });
                            }

                            alerts = alerts.concat(getResourceLimitAlerts(resource, quota));
                        };
                        _.each(filteredQuotas, alertsForQuota);
                        _.each(filteredClusterQuotas, alertsForQuota);
                    });

                    return alerts;
                };

                var getLatestQuotaAlerts = function(resources, context) {
                    var quotas, clusterQuotas, promises = [];
                    //console.log("get here getLatestQuotaAlerts promises", promises);
                    // double check using the latest quotas
                    promises.push(
                        DataService.list("resourcequotas", context).then(function(quotaData) {
                            //console.log("quotaData", quotaData);
                            quotas = quotaData.by("metadata.name");
                            //Logger.log("quotas", quotas);
                        })
                    );

                    promises.push(DataService.list("appliedclusterresourcequotas", context).then(function(clusterQuotaData) {
                        clusterQuotas = clusterQuotaData.by("metadata.name");
                        //console.log("cluster quotas", clusterQuotas);
                        //Logger.log("cluster quotas", clusterQuotas);
                    }));
                    //console.log("get here getLatestQuotaAlerts promises", promises, resources, quotas, clusterQuotas);
                    return $q.all(promises).then(function() {
                        //console.log("came 1111", resources, quotas, clusterQuotas);
                        var quotaAlerts = getQuotaAlerts(resources, quotas, clusterQuotas);
                        //console.log("quotaAlerts", quotaAlerts);
                        return {
                            quotaAlerts: quotaAlerts
                        };
                    });
                };

                var COMPUTE_RESOURCE_QUOTAS = [
                    "cpu",
                    "requests.cpu",
                    "memory",
                    "requests.memory",
                    "limits.cpu",
                    "limits.memory"
                ];

                var getNotificaitonMessage = function(used, usedValue, hard, hardValue, quotaKey) {
                    // Note: This function returns HTML markup, not plain text

                    var msgPrefix = "Your project is " + (hardValue < usedValue ? 'over' : 'at') + " quota. ";
                    var msg;
                    if (_.includes(COMPUTE_RESOURCE_QUOTAS, quotaKey)) {
                        msg = msgPrefix + "It is using " + percent((usedValue / hardValue), 0) + " of " + usageWithUnits(hard, quotaKey) + " " + humanizeQuotaResource(quotaKey) + ".";
                    } else {
                        msg = msgPrefix + "It is using " + usedValue + " of " + hardValue + " " + humanizeQuotaResource(quotaKey) + ".";
                    }

                    msg = _.escape(msg);

                    if (Constants.QUOTA_NOTIFICATION_MESSAGE && Constants.QUOTA_NOTIFICATION_MESSAGE[quotaKey]) {
                        // QUOTA_NOTICIATION_MESSAGE can contain HTML and shouldn't be escaped.
                        msg += " " + Constants.QUOTA_NOTIFICATION_MESSAGE[quotaKey];
                    }

                    return msg;
                };

                // Return notifications if you are at quota or over any quota for any resource. Do *not*
                // warn about quota for 'resourcequotas' or resources whose hard limit is
                // 0, however.
                var getQuotaNotifications = function(quotas, clusterQuotas, projectName) {
                    var notifications = [];

                    var notificationsForQuota = function(quota) {
                        var q = quota.status.total || quota.status;
                        _.each(q.hard, function(hard, quotaKey) {
                            var hardValue = usageValue(hard);
                            var used = _.get(q, ['used', quotaKey]);
                            var usedValue = usageValue(used);

                            // We always ignore quota warnings about being out of
                            // resourcequotas since end users cant do anything about it
                            if (quotaKey === 'resourcequotas' || !hardValue || !usedValue) {
                                return;
                            }

                            if (hardValue <= usedValue) {
                                notifications.push({
                                    id: projectName + "/quota-limit-reached-" + quotaKey,
                                    namespace: projectName,
                                    type: (hardValue < usedValue ? 'warning' : 'info'),
                                    message: getNotificaitonMessage(used, usedValue, hard, hardValue, quotaKey),
                                    isHTML: true,
                                    skipToast: true,
                                    showInDrawer: true,
                                    actions: [{
                                            name: 'View Quotas',
                                            title: 'View project quotas',
                                            onClick: function() {
                                                //$location.url("/project/" + $routeParams.project + "/quota");
                                                $rootScope.$emit('NotificationDrawerWrapper.hide');
                                            }
                                        },
                                        {
                                            name: "Don't Show Me Again",
                                            title: 'Permenantly hide this notificaiton until quota limit changes',
                                            onClick: function(notification) {
                                                NotificationsService.permanentlyHideNotification(notification.uid, notification.namespace);
                                                $rootScope.$emit('NotificationDrawerWrapper.clear', notification);
                                            }
                                        },
                                        {
                                            name: "Clear",
                                            title: 'Clear this notificaiton',
                                            onClick: function(notification) {
                                                $rootScope.$emit('NotificationDrawerWrapper.clear', notification);
                                            }
                                        }
                                    ]
                                });
                            }
                        });
                    };
                    _.each(quotas, notificationsForQuota);
                    _.each(clusterQuotas, notificationsForQuota);

                    return notifications;
                };

                // Warn if you are at quota or over any quota for any resource. Do *not*
                // warn about quota for 'resourcequotas' or resources whose hard limit is
                // 0, however.
                var isAnyQuotaExceeded = function(quotas, clusterQuotas, typesToCheck) {
                    var isExceeded = function(quota) {
                        var q = quota.status.total || quota.status;
                        return _.some(q.hard, function(hard, quotaKey) {
                            // We always ignore quota warnings about being out of
                            // resourcequotas since end users cant do anything about it
                            if (quotaKey === 'resourcequotas') {
                                return false;
                            }
                            if (!typesToCheck || _.includes(typesToCheck, quotaKey)) {
                                hard = usageValue(hard);
                                if (!hard) {
                                    return false;
                                }

                                var used = usageValue(_.get(q, ['used', quotaKey]));
                                if (!used) {
                                    return false;
                                }

                                return hard <= used;
                            }
                        });
                    };
                    return _.some(quotas, isExceeded) || _.some(clusterQuotas, isExceeded);
                };

                // Same as above but only looking at storage items: requests.storage, persistentvolumeclaims
                //   Warn if you are at quota or over any storage quota for any resource.
                var isAnyStorageQuotaExceeded = function(quotas, clusterQuotas) {
                    return isAnyQuotaExceeded(quotas, clusterQuotas, ['requests.storage', 'persistentvolumeclaims']);
                };

                // Check if requested quota will exceed any quotas if attempted
                var willRequestExceedQuota = function(quotas, clusterQuotas, requestedQuotaKey, request) {
                    var isExceeded = function(quota) {
                        var q = quota.status.total || quota.status;
                        var value = usageValue(request);
                        if (!requestedQuotaKey) {
                            return false;
                        }
                        var hard = _.get(q.hard, requestedQuotaKey);
                        hard = usageValue(hard);
                        if (!hard) {
                            return false;
                        }
                        var used = usageValue(_.get(q, ['used', requestedQuotaKey]));
                        if (!used) {
                            return hard < value;
                        }

                        return hard < (used + value);
                    };
                    return _.some(quotas, isExceeded) || _.some(clusterQuotas, isExceeded);
                };

                return {
                    filterQuotasForResource: filterQuotasForResource,
                    isBestEffortPod: isBestEffortPod,
                    isTerminatingPod: isTerminatingPod,
                    getResourceLimitAlerts: getResourceLimitAlerts,
                    // Gets quota alerts relevant to a set of resources
                    // Returns: Array of alerts
                    getQuotaAlerts: getQuotaAlerts,
                    getLatestQuotaAlerts: getLatestQuotaAlerts,
                    isAnyQuotaExceeded: isAnyQuotaExceeded,
                    isAnyStorageQuotaExceeded: isAnyStorageQuotaExceeded,
                    willRequestExceedQuota: willRequestExceedQuota,
                    getQuotaNotifications: getQuotaNotifications
                };
            }
        ])

        .factory("SecurityCheckService",['APIService','$filter','Constants',
                    function(APIService, $filter, Constants) {
            var humanizeKind = $filter('humanizeKind');
            var getSecurityAlerts = function(resources, project) {
                var alerts = [];
                var unrecognizedResources = [];
                var clusterScopedResources = [];
                var roleBindingResources = [];
                var roleResources = [];
                var notWhitelistedResources = [];
                _.each(resources, function(resource) {
                    if (!_.get(resource, "kind")) {
                        // This isn't a valid API object
                        return;
                    }
                    var rgv = APIService.objectToResourceGroupVersion(resource);
                    var apiInfo = APIService.apiInfo(rgv);
                    if (!apiInfo) {
                        unrecognizedResources.push(resource);
                        return;
                    }
                    if (!apiInfo.namespaced) {
                        clusterScopedResources.push(resource);
                    } else if (rgv.resource === "rolebindings" && (rgv.group === '' || rgv.group === "rbac.authorization.k8s.io")) {
                        // If role in the rolebinding is one of the "safe" ones ignore it (view or image puller), otherwise warn
                        var roleRef = _.get(resource, 'roleRef.name');
                        if (roleRef !== 'view' && roleRef !== 'system:image-puller') {
                            roleBindingResources.push(resource);
                        }
                    } else if (rgv.resource === "roles" && (rgv.group === '' || rgv.group === "rbac.authorization.k8s.io")) {
                        roleResources.push(resource);
                    }
                    //!!!!!!!Temporary!!!!!!!!!
                    //  else if (!_.find(Constants.SECURITY_CHECK_WHITELIST, { resource: rgv.resource, group: rgv.group })) {
                    //     notWhitelistedResources.push(resource);
                    // }
                });
                if (unrecognizedResources.length) {
                    var unrecognizedStrs = _.uniq(_.map(unrecognizedResources, function(resource) {
                        var apiVersion = _.get(resource, 'apiVersion', '<none>');
                        return 'API version ' + apiVersion + ' for kind ' + humanizeKind(resource.kind);
                    }));
                    alerts.push({
                        type: 'warning',
                        message: "Some resources will not be created.",
                        details: "The following resource versions are not supported by the server: " + unrecognizedStrs.join(", ")
                    });
                }
                if (clusterScopedResources.length) {
                    var clusterStrs = _.uniq(_.map(clusterScopedResources, function(resource) {
                        return humanizeKind(resource.kind);
                    }));
                    alerts.push({
                        type: 'warning',
                        message: "This will create resources outside of the project, which might impact all users of the cluster.",
                        details: "Typically only cluster administrators can create these resources. The cluster-level resources being created are: " + clusterStrs.join(", ")
                    });
                }
                if (roleBindingResources.length) {
                    var roleBindingStrs = [];
                    _.each(roleBindingResources, function(resource) {
                        _.each(resource.subjects, function(subject) {
                            var str = humanizeKind(subject.kind) + " ";
                            if (subject.kind === 'ServiceAccount') {
                                str += (subject.namespace || project) + "/";
                            }
                            str += subject.name;
                            roleBindingStrs.push(str);
                        });
                    });
                    roleBindingStrs = _.uniq(roleBindingStrs);
                    alerts.push({
                        type: 'warning',
                        message: "This will grant permissions to your project.",
                        details: "Permissions are being granted to: " + roleBindingStrs.join(", ")
                    });
                }
                if (roleResources.length) {
                    alerts.push({
                        type: 'info',
                        message: "This will create additional membership roles within the project.",
                        details: "Admins will be able to grant these custom roles to users, groups, and service accounts."
                    });
                }
                if (notWhitelistedResources.length) {
                    var notWhitelistStrs = _.uniq(_.map(notWhitelistedResources, function(resource) {
                        return humanizeKind(resource.kind);
                    }));
                    alerts.push({
                        type: 'warning',
                        message: "This will create resources that may have security or project behavior implications.",
                        details: "Make sure you understand what they do before creating them. The resources being created are: " + notWhitelistStrs.join(", ")
                    });
                }
                return alerts;
            };

            return {
                // Gets security alerts relevant to a set of resources
                // Returns: Array of alerts
                getSecurityAlerts: getSecurityAlerts
            };
        }]);
    })
    // ResourceGroupVersion represents a fully qualified resource
function ResourceGroupVersion(resource, group, version) {
    this.resource = resource;
    this.group = group;
    this.version = version;
    return this;
}
// toString() includes the group and version information if present
ResourceGroupVersion.prototype.toString = function() {
    var s = this.resource;
    if (this.group) { s += "/" + this.group; }
    if (this.version) { s += "/" + this.version; }
    return s;
};
// primaryResource() returns the resource with any subresources removed
ResourceGroupVersion.prototype.primaryResource = function() {
    if (!this.resource) { return ""; }
    var i = this.resource.indexOf('/');
    if (i === -1) { return this.resource; }
    return this.resource.substring(0, i);
};
// subresources() returns a (possibly empty) list of subresource segments
ResourceGroupVersion.prototype.subresources = function() {
    var segments = (this.resource || '').split("/");
    segments.shift();
    return segments;
};
// equals() returns true if the given resource, group, and version match.
// If omitted, group and version are not compared.
ResourceGroupVersion.prototype.equals = function(resource, group, version) {
    if (this.resource !== resource) { return false; }
    if (arguments.length === 1) { return true; }
    if (this.group !== group) { return false; }
    if (arguments.length === 2) { return true; }
    if (this.version !== version) { return false; }
    return true;
};
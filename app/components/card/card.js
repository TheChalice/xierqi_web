'use strict';

angular.module("console.card", [
        {
            files: ['components/card/card.css']
        }
    ])

    .directive('cCard', [function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                item: '=',
                gitStore: '='
            },
            templateUrl: 'components/card/card.html',

        };
    }]);


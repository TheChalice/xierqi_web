angular.module("console.card",[{files:["components/card/card.css"]}]).directive("cCard",[function(){return{restrict:"EA",replace:!0,scope:{item:"="},templateUrl:"components/card/card.html"}}]);
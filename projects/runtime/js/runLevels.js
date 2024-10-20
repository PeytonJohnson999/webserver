var runLevels = function (window) {
  window.opspark = window.opspark || {};

  var draw = window.opspark.draw;
  var createjs = window.createjs;
  let currentLevel = 0;

  window.opspark.runLevelInGame = function (game) {
    // some useful constants
    var groundY = game.groundY;

    // this data will allow us to define all of the
    // behavior of our game
    var levelData = window.opspark.levelData;

    // set this to true or false depending on if you want to see hitzones
    game.setDebugMode(true);

    // TODOs 5 through 11 go here
    // BEGIN EDITING YOUR CODE HERE

    function createSawBlade(x, y){
      var hitZoneSize = 25;
      var damageFromObstacle = 10;
      var sawBladeHitZone = game.createObstacle(hitZoneSize, damageFromObstacle);
      sawBladeHitZone.x = x;
      sawBladeHitZone.y = y;
      game.addGameItem(sawBladeHitZone);
      var obstacleImage = draw.bitmap('img/sawblade.png');
      obstacleImage.x = -1 * hitZoneSize;
      obstacleImage.y = -1 * hitZoneSize;
      sawBladeHitZone.addChild(obstacleImage);
    }


    function createEnemy(x, y){
      var enemy = game.createGameItem("enemy", 25);
      var redSquare = draw.rect(50, 50, "red");
      redSquare.x = -25;
      redSquare.y = -25;
      enemy.addChild(redSquare);
      enemy.x = x;
      enemy.y = y;
      game.addGameItem(enemy);
      enemy.velocityX = -2;
      enemy.onPlayerCollision = function () {
        game.changeIntegrity(-10);
        enemy.shrink();
      }
        enemy.onProjectileCollision = () =>  {
          game.increaseScore(100);
          enemy.fadeOut();
      };
    }

    function createHealthPickup(x, y){
      var pickup = game.createGameItem("enemy", 25);
      var image = draw.bitmap('/projects/runtime/img/healthPickup.png');
      image.scaleX = 0.025;
      image.scaleY = 0.025;
      image.x = -25;
      image.y = -25;
      pickup.addChild(image);
      pickup.x = x;
      pickup.y = y;
      game.addGameItem(pickup);
      pickup.velocityX = -1;

      //Makes Health pickup heal player and disappear when picked up
      pickup.onPlayerCollision = () => {
        game.changeIntegrity(25);
        pickup.fadeOut();
      }

      //Makes Health Pickup disappear when shot
      pickup.onProjectileCollision = () => {
        pickup.fadeOut();
      }

    }

    function createMarker(x, y){
      var marker = game.createGameItem('enemy', 25);
      var image = draw.bitmap('/projects/runtime/img/marker.png')
      image.scaleX = .1;
      image.scaleY = .1;
      image.x = -24;
      image.y = -25;
      marker.addChild(image);
      marker.x = x;
      marker.y = y;
      game.addGameItem(marker);
      marker.velocityX = -1;
      marker.onPlayerCollision = () => {startLevel()};
      marker.onProjectileCollision = () => {startLevel()};
    }


    function startLevel() {
      // TODO 13 goes below here
      var level = levelData[currentLevel];
      var levelObjects = level.gameItems;

      for (var i = 0; i < levelObjects.length; i++){
        var obj = levelObjects[i];
        if (obj.type === "sawblade"){
          createSawBlade(obj.x, obj.y);
        }else if(obj.type === "healthPickup"){
          createHealthPickup(obj.x, obj.y);
        }else if(obj.type === "marker"){
          createMarker(obj.x, obj.y);
        }else if(obj.type === "enemy"){
          createEnemy(obj.x, obj.y);
        }
      }

      //////////////////////////////////////////////
      // DO NOT EDIT CODE BELOW HERE
      //////////////////////////////////////////////
      if (++currentLevel === levelData.length) {
        startLevel = () => {
          console.log("Congratulations!");
        };
      }
    }
    startLevel();
  };
};

// DON'T REMOVE THIS CODE //////////////////////////////////////////////////////
if (
  typeof process !== "undefined" &&
  typeof process.versions.node !== "undefined"
) {
  // here, export any references you need for tests //
  module.exports = runLevels;
}

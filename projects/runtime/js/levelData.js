var makeLevelData = function (window) {
  window.opspark = window.opspark || {};

  window.opspark.makeDataInGame = function (game) {
    // some useful constants
    var groundY = game.groundY;

    // this data will allow us to define all of the
    // behavior of our game

    // TODO 12: change the below data
    var levelData = [
      {
        name: "The Park",
        number: 1,
        speed: -3,
        gameItems: [
          { type: "sawblade", x: 400, y: groundY },
          { type: "sawblade", x: 600, y: groundY - 125},
          { type: "sawblade", x: 900, y: groundY },
          { type: "healthPickup", x: 1200, y: groundY - 50},
          { type: "marker", x: 2000, y: groundY -50}
        ],
      },
      {
        name: "The Park 2",
        number: 2,
        speed: -3,
        gameItems: [
          { type: "sawblade", x: 400, y: groundY },
          { type: "sawblade", x: 600, y: groundY - 125},
          { type: "sawblade", x: 900, y: groundY },
          { type: "enemy", x: 1200, y: groundY - 50},
          { type: "marker", x: 2000, y: groundY - 50}
        ],
      },
      {
        name: "The Park 3",
        number: 3,
        speed: -3,
        gameItems: [
          {type: "sawblade", x: 400, y: groundY - 125},
          {type: "sawblade", x: 600, y: groundY - 125},
          {type: "sawblade", x: 900, y: groundY},
          {type: "healthPickup", x: 1200, y: groundY - 50}
        ]
      }
    ];
    window.opspark.levelData = levelData;
  };
};

// DON'T REMOVE THIS CODE //////////////////////////////////////////////////////
if (
  typeof process !== "undefined" &&
  typeof process.versions.node !== "undefined"
) {
  // here, export any references you need for tests //
  module.exports = makeLevelData;
}

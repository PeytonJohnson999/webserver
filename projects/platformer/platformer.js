$(function () {
  // initialize canvas and context when able to
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  window.addEventListener("load", loadJson);

  function setup() {
    if (firstTimeSetup) {
      halleImage = document.getElementById("player");
      projectileImage = document.getElementById("projectile");
      cannonImage = document.getElementById("cannon");
      $(document).on("keydown", handleKeyDown);
      $(document).on("keyup", handleKeyUp);
      firstTimeSetup = false;
      //start game
      setInterval(main, 1000 / frameRate);
    }
    //create walls
    createPlatform(-50, -50, canvas.width + 100, 50); //top
    createPlatform(-50, canvas.height - 10, canvas.width + 100, 200); //right
    createPlatform(-50, -50, 50, canvas.height + 500); //bottom
    createPlatform(canvas.width, -50, 50, canvas.height + 100);

    /////////////////////////////////////////////////
    //////////ONLY CHANGE BELOW THIS POINT///////////
    /////////////////////////////////////////////////

    // TODO 1
    // Create platforms
    // You must decide the x position, y position, width, and height of the platforms
    // example usage: createPlatform(x,y,width,height)

    createPlatform(500, 650, 50, 10); //First Platform
    createPlatform(500, 525, 50, 10); //Second Platform
    createPlatform(700, 525, 150, 10); //Third Platform
    createPlatform(1045, 525, 150, 10); //Fourth Platform
    createPlatform(1055, 400, 145, 10); //Fifth Platform
    createPlatform(455, 275, 750, 10); //Big platform
    createPlatform(1150, 165, 10, 110); //First Wall between collectible and the big platform
    createPlatform(1055, 160, 10, 115); //Second Wall
    createPlatform(955, 155, 10, 120); //Third Wall
    createPlatform(855, 150, 10, 125); //Fourth Wall
    createPlatform(755, 145, 10, 130); //Fifth Wall
    createPlatform(655, 140, 10, 135); //Sixth Wall
    createPlatform(555, 105, 10, 170); //Seventh Wall
    createPlatform(455, -5, 10, 290);//Big wall
    
    
    
    // TODO 2
    // Create collectables
    // You must decide on the collectable type, the x position, the y position, the gravity, and the bounce strength
    // Your collectable choices are 'database' 'diamond' 'grace' 'kennedi' 'max' and 'steve'; more can be added if you wish
    // example usage: createCollectable(type, x, y, gravity, bounce)
    
    //Upper Collectibles
    createCollectable('database', 1160, 235, 0, 0.5);
    createCollectable('database', 1090, 235, 0, 0.5);
    createCollectable('database', 990, 235, 0, 0.5);
    createCollectable('database', 890, 235, 0, 0.5);
    createCollectable('database', 790, 235, 0, 0.5);
    createCollectable('database', 690, 235, 0, 0.5);
    createCollectable('database', 590, 235, 0, 0.5);
    createCollectable('diamond', 490, 235, 0, 0.5);

    //Lower Collectibles
    createCollectable('database', 505, 610, 0, 0.5);
    createCollectable('database', 505, 485, 0, 0.5);
    createCollectable('database', 1105, 360, 0, 0.5);
    
    
    
    // TODO 3
    // Create cannons
    // You must decide the wall you want the cannon on, the position on the wall, and the time between shots in milliseconds
    // Your wall choices are: 'top' 'left' 'right' and 'bottom'
    // example usage: createCannon(side, position, delay)
    createCannon("right", 750, 2000);//Lowest Cannon
    createCannon("right", 650, 2750);//Second Cannon
    createCannon("left", 450, 2000);//Third Cannon





    /////////////////////////////////////////////////
    //////////ONLY CHANGE ABOVE THIS POINT///////////
    /////////////////////////////////////////////////
  }

  registerSetup(setup);
});

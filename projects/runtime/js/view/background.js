var background = function (window) {
    'use strict';
    
    window.opspark = window.opspark || {};
    var draw = window.opspark.draw;
    var createjs = window.createjs;
    
    /*
     * Create a background view for our game application
     */
    window.opspark.makeBackground = function(app,ground) {
        /* Error Checking - DO NOT DELETE */
        if(!app) {
            throw new Error("Invalid app argument");
        }
        if(!ground || typeof(ground.y) == 'undefined') {
            throw new Error("Invalid ground argument");
        }
        
        // useful variables
        var canvasWidth = app.canvas.width;
        var canvasHeight = app.canvas.height;
        var groundY = ground.y;
        
        // container which will be returned
        var background;
        
        //////////////////////////////////////////////////////////////////
        // ANIMATION VARIABLES HERE //////////////////////////////////////
        //////////////////////////////////////////////////////////////////
        var tree;
        var buildings = [];
        var flyingBirds = [];
        var sittingBirds = [];
        // TODO (several):
      
      
        // called at the start of game and whenever the page is resized
        // add objects for display in background. draws each image added to the background once
        function render() {
            background.removeAllChildren();
            
            // TODO 1:
            // this currently fills the background with an obnoxious yellow;
            // you should modify both the height and color to suit your game
            var backgroundFill = draw.bitmap('/projects/runtime/img/background.jpg')/*draw.rect(canvasWidth, canvasHeight, 'white')*/;
            //tree = draw.bitmap('/projects/runtime/img/tree.png');
            background.addChild(backgroundFill);
            
            // TODO 2: - Add a moon and starfield

            
            
            
            // TODO 4: Part 1 - Add buildings!     Q: This is before TODO 4 for a reason! Why?
            for (var i = 0; i < 5; i++){
                var buildingHeight = 300 * Math.random();
                //var building =  draw.rect(75, buildingHeight, "LightGray", "Black", 1);
                var building = draw.bitmap('/projects/runtime/img/building.png');
                building.scaleX = .2;
                building.scaleY = .2;
                building.x = (300 * i) + 50;
                building.y = groundY - (550);
                background.addChild(building);
                buildings.push(building);
            }
            
            // TODO 3: Part 1 - Add a tree
            tree = draw.bitmap('img/tree.png');
            tree.scaleX = 1.5;
            tree.scaleY = 1.5;
            tree.x = 500;
            tree.y = groundY - (250 * tree.scaleY);
            background.addChild(tree);
            
            for (var i = 1; i <= 10; i++){
                var bird = draw.bitmap('/projects/runtime/img/bird.webp');
                bird.x = canvasWidth * Math.random();
                bird.y = (canvasHeight * Math.random());
                var birdY = bird.y;
                if (bird.y >= 475) {
                    bird = draw.bitmap('/projects/runtime/img/sittingBird.png');
                    bird.x = canvasWidth * Math.random();
                    bird.y = birdY;
                    sittingBirds.push(bird);
                }
                else{
                    flyingBirds.push(bird);
                } 
                bird.scaleX = .075;
                bird.scaleY = .075;
                background.addChild(bird);
            }

        } // end of render function - DO NOT DELETE
        
        
        // Perform background animation
        // called on each timer "tick" - 60 times per second
        function update(){
            // useful variables
            var canvasWidth = app.canvas.width;
            var canvasHeight = app.canvas.height;
            var groundY = ground.y;
            
            // TODO 3: Part 2 - Move the tree!
            //Animates the trees
            tree.x = tree.x - 1;
            if ((tree.x + (211 * tree.scaleX))< 0)
            {
                tree.x = canvasWidth;
            }

            //Animates the sitting birds
            for (var i = 0; i < sittingBirds.length; i++){
                var bird = sittingBirds[i];
                bird.x = bird.x - 1;
                if (bird.x + (1200 * bird.scaleX) < 0){
                    bird.x = canvasWidth;
                }
            }

            //Animates the flying birds
            for (var i = 0; i < flyingBirds.length; i++){
                var bird = flyingBirds[i];
                bird.x = bird.x + 2; 
                if (bird.x > canvasWidth){
                    bird.x = 0 - (1440 * bird.scaleX);
                }
            }
            
            // TODO 4: Part 2 - Parallax
            //Animates the buildings
            for (var i = 0; i < buildings.length; i++){
                var building = buildings[i];
                building.x = building.x - .2;
                if ((building.x + 180) < 0){
                    building.x = canvasWidth;
                }
            }

        } // end of update function - DO NOT DELETE
        
        
        
        /* Make a createjs Container for the background and let it know about the render and upate functions*/
        background = new createjs.Container();
        background.resize = render;
        background.update = update;
        
        /* make the background able to respond to resizing and timer updates*/
        app.addResizeable(background);
        app.addUpdateable(background);
        
        /* render and return the background */
        render();
        return background;
    };
};

// DON'T REMOVE THIS CODE //////////////////////////////////////////////////////
if((typeof process !== 'undefined') &&
    (typeof process.versions.node !== 'undefined')) {
    // here, export any references you need for tests //
    module.exports = background;
}

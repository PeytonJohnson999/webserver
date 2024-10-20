/* global $, sessionStorage */

// Global variables
const KEY = {
  W : 87,
  A : 65,
  S : 83,
  D : 68,
  LEFT : 37,
  UP : 38,
  RIGHT : 39,
  DOWN : 40,
  MVMTKEYS : [87, 65, 83, 68, 37, 38, 39, 40],
};

const WALKSPEED = 7.5;
const BOARDWIDTH = 440;
const BOARDHEIGHT = 440;
const WALKERWIDTH = 50;
const WALKERHEIGHT = 50;

$(document).ready(runProgram); // wait for the HTML / CSS elements of the page to fully load, then execute runProgram()
  
function runProgram(){
  ////////////////////////////////////////////////////////////////////////////////
  //////////////////////////// SETUP /////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  // Constant Variables
  var FRAME_RATE = 120;
  var FRAMES_PER_SECOND_INTERVAL = 1000 / FRAME_RATE;
  
  
  
  // Game Item Objects
  var walker = {
    positionX : 0,
    positionY : 0,
    speedX : 0,
    speedY : 0,
  }

  var walker2 = {
    positionX : BOARDWIDTH - WALKERWIDTH,
    positionY: BOARDHEIGHT - WALKERHEIGHT,
    speedX : 0,
    speedY : 0,
  }


  // one-time setup
  var interval = setInterval(newFrame, FRAMES_PER_SECOND_INTERVAL);
   // execute newFrame every 0.0166 seconds (60 Frames per second)
  $(document).on('keydown', handleKeyDown);   
  $(document).on('keyup', handleKeyUp)                        // change 'eventType' to the type of event you want to handle

  ////////////////////////////////////////////////////////////////////////////////
  ///////////////////////// CORE LOGIC ///////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  /* 
  On each "tick" of the timer, a new frame is dynamically drawn using JavaScript
  by calling this function and executing the code inside.
  */
  function newFrame() {
    
    repositionGameItem();
    redrawGameItem();
    checkBorderCollision();
    detectPlayerCollision();
  }
  
  /* 
  Called in response to events.
  */

  // Called in response to user pressing a movement key
  function handleKeyDown(event) {

    // player1
    if (event.which === KEY.LEFT && !(walker.positionX <= 0)){
      walker.speedX = -1 * WALKSPEED;
      if (walker.speedY !== 0){
        walker.speedX /= 2;
      }
    }else if (event.which === KEY.UP && !(walker.positionY <= 0)){
      walker.speedY = -1 * WALKSPEED
      if (walker.speedX !== 0){
        walker.speedY /= 2;
      }

    }else if ( event.which === KEY.RIGHT && !(walker.positionX >= BOARDWIDTH - WALKERWIDTH)){
      walker.speedX = WALKSPEED
      if (walker.speedY !== 0){
        walker.speedX /= 2;
      }

      // walker.speedX = WALKSPEED
    }else if (event.which === KEY.DOWN && !(walker.positionY >= BOARDHEIGHT - WALKERWIDTH)){
      walker.speedY = WALKSPEED
      if (walker.speedX !== 0){
        walker.speedY /= 2;
      }

      // walker.speedY = WALKSPEED
    }

    // player2
    else if (event.which === KEY.A && !(walker2.positionX <= 0)){
      walker2.speedX = -1 * WALKSPEED;
      if (walker2.speedY !== 0){
        walker2.speedX /= 2;
      }
      // walker.speedX = -1 * WALKSPEED
    }else if (event.which === KEY.W && !(walker2.positionY <= 0)){
      walker2.speedY = -1 * WALKSPEED
      if (walker2.speedX !== 0){
        walker2.speedY /= 2;
      }

      // walker.speedY = -1 * WALKSPEED
    }else if ( event.which === KEY.D && !(walker2.positionX >= BOARDWIDTH - WALKERWIDTH)){
      walker2.speedX = WALKSPEED
      if (walker2.speedY !== 0){
        walker2.speedX /= 2;
      }

      // walker.speedX = WALKSPEED
    }else if (event.which === KEY.S && !(walker2.positionY >= BOARDHEIGHT - WALKERWIDTH)){
      walker2.speedY = WALKSPEED
      if (walker2.speedX !== 0){
        walker2.speedY /= 2;
      }

      // walker.speedY = WALKSPEED
    }
  }

  // Called in response to user releasing a movement key
  function handleKeyUp(event){

    // When the player releases a movement key, stop their movement in that direction
    // player1
    if (event.which === KEY.LEFT && !(walker.positionX <= 0)){
      if (walker.speedX < 0){
        walker.speedX = 0
      }

      if (walker.speedY > 0){
        walker.speedY = WALKSPEED
      }else if (walker.speedY < 0) {
        walker.speedY = -1 * WALKSPEED
      }

    }else if ( event.which === KEY.UP && !(walker.positionY <= 0)){
      if (walker.speedY < 0){
        walker.speedY = 0
      }

      if (walker.speedX > 0){
        walker.speedX = WALKSPEED
      }else if(walker.speedX < 0){
        walker.speedX = -1 * WALKSPEED
      }

    }else if ( event.which === KEY.RIGHT && !(walker.positionX >= BOARDWIDTH - WALKERWIDTH)){
      if (walker.speedX > 0){
        walker.speedX = 0
      }

      if (walker.speedY > 0){
        walker.speedY = WALKSPEED
      }else if (walker.speedY < 0) {
        walker.speedY = -1 * WALKSPEED
      }

      // walker.speedX = 0
    }else if ( event.which === KEY.DOWN && !(walker.positionY >= BOARDHEIGHT - WALKERWIDTH)){
      if (walker.speedY > 0){
        walker.speedY = 0
      }

      if (walker.speedX > 0){
        walker.speedX = WALKSPEED
      }else if(walker.speedX < 0){
        walker.speedX = -1 * WALKSPEED
      }
    }


    // player2
    else if ( event.which === KEY.S && !(walker2.positionY >= BOARDHEIGHT - WALKERWIDTH)){
      if (walker2.speedY > 0){
        walker2.speedY = 0
      }

      if (walker2.speedX > 0){
        walker2.speedX = WALKSPEED
      }else if(walker2.speedX < 0){
        walker2.speedX = -1 * WALKSPEED
      }
    }else if ( event.which === KEY.D && !(walker2.positionX >= BOARDWIDTH - WALKERWIDTH)){
      if (walker2.speedX > 0){
        walker2.speedX = 0
      }

      if (walker2.speedY > 0){
        walker2.speedY = WALKSPEED
      }else if (walker2.speedY < 0) {
        walker2.speedY = -1 * WALKSPEED
      }

    }else if ( event.which === KEY.W && !(walker2.positionY <= 0)){
      if (walker2.speedY < 0){
        walker2.speedY = 0
      }

      if (walker2.speedX > 0){
        walker2.speedX = WALKSPEED
      }else if(walker2.speedX < 0){
        walker2.speedX = -1 * WALKSPEED
      }
    
    }else if (event.which === KEY.A && !(walker2.positionX <= 0)){
      if (walker2.speedX < 0){
        walker2.speedX = 0
      }

      if (walker2.speedY > 0){
        walker2.speedY = WALKSPEED
      }else if (walker2.speedY < 0) {
        walker2.speedY = -1 * WALKSPEED
      }

    }
  }

  // var plrCollisionDebounce = false

  // Checks for collision between player1 and player2
  // variable for flipflopping between colors
  var flipflop = true
  function detectPlayerCollision(){
    

    // Checks for collision
    if (((walker.positionX >= walker2.positionX - WALKERWIDTH) && (walker.positionX <= walker2.positionX + WALKERWIDTH)) 
    && ((walker.positionY >= walker2.positionY - WALKERHEIGHT) && (walker.positionY <= walker2.positionY + WALKERHEIGHT))
   ){

      if (flipflop === true){
        $("#walker").css('background-color', 'red')
        $("#walker2").css('background-color', 'blue')
        flipflop = false
      }else {
        $("#walker").css('background-color', 'blue')
        $("#walker2").css('background-color', 'red')
        flipflop = true
      }
    }

    
  }

  // Handles player collision
  function handlePlayerCollision(){
    
  }
  ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// HELPER FUNCTIONS ////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  // Ends the game
  function endGame() {
    // stop the interval timer
    clearInterval(interval);

    // turn off event handlers
    $(document).off();
  }

  // Changes the game item's position in the code
  function repositionGameItem(){
    // Changing walker's position
    // player1
    walker.positionX += walker.speedX;
    walker.positionY += walker.speedY;

    // player2
    walker2.positionX += walker2.speedX;
    walker2.positionY += walker2.speedY;
  }

  // Changes the game item's position on the screen
  function redrawGameItem(){
    // Updating walker on the screen
    // player1
    $("#walker").css('left', walker.positionX);
    $("#walker").css('top', walker.positionY);
    // player2
    $("#walker2").css('left', walker2.positionX);
    $("#walker2").css('top', walker2.positionY);
  }

  // Checks the game item for collision with the screen border
  function checkBorderCollision(){
    // player1
    if ((walker.positionX >= BOARDWIDTH - WALKERWIDTH && !(walker.speedX <= 0))|| (walker.positionX <= 0 && !(walker.speedX >= 0))){
      walker.speedX = 0;
    }
    if ((walker.positionY >= BOARDHEIGHT - WALKERHEIGHT && !(walker.speedY <= 0)) || (walker.positionY <= 0 && !(walker.speedY >= 0))) {
      walker.speedY = 0;
    }
    // player2
    if ((walker2.positionX >= BOARDWIDTH - WALKERWIDTH && !(walker2.speedX <= 0))|| (walker2.positionX <= 0 && !(walker2.speedX >= 0))){
      walker2.speedX = 0;
    }
    if ((walker2.positionY >= BOARDHEIGHT - WALKERHEIGHT && !(walker2.speedY <= 0)) || (walker2.positionY <= 0 && !(walker2.speedY >= 0))) {
      walker2.speedY = 0;
    }
  }

  
  
}

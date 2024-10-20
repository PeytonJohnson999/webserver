/* global $, sessionStorage */

$(document).ready(runProgram); // wait for the HTML / CSS elements of the page to fully load, then execute runProgram()
  
function runProgram(){
  ////////////////////////////////////////////////////////////////////////////////
  //////////////////////////// SETUP /////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  // Constant Variables
  const FRAME_RATE = 60;
  const FRAMES_PER_SECOND_INTERVAL = 1000 / FRAME_RATE;
  const BOARD_WIDTH = $('#board').width();
  const BOARD_HEIGHT = $("#board").height();
  const PADDLE_WIDTH = $("#paddle1").width();
  const PADDLE_HEIGHT = $("#paddle2").height();
  const XY_OFFSET = 10;
  const NOTHING = 0;  //NO MAGIC NUMBERS
  const PADDLE_SPEED = 5;
  const BALL_WIDTH = $("#ball").width();
  const BALL_HEIGHT = $("#ball").height();


  const KEY_CODE= {
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
  
  // Game Item Objects
  const paddle1 = {
    x : XY_OFFSET,
    y : (BOARD_HEIGHT / 2) - (PADDLE_HEIGHT / 2),
    velocityY : 0,
    id : "#paddle1",
  }

  const paddle2 = {
    x : BOARD_WIDTH - (PADDLE_WIDTH + XY_OFFSET),  
    y : (BOARD_HEIGHT / 2) - (PADDLE_HEIGHT/ 2),
    velocityY : 0,
    id : "#paddle2",
  }

  const ball = {
    x : (BOARD_WIDTH / 2) - (BALL_WIDTH / 2),
    y : (BOARD_HEIGHT / 2) - (BALL_HEIGHT / 2),
    velocityX : 5,
    velocityY : 5,
    mvmntSpeed : 5,
    id : "#ball"
  }

  // Player Objects
  const player1 = {
    score : 0,
    scoreId : "#plr1Score",
    paddle : paddle1,
  }

  const player2 = {
    score : 0,
    scoreId : "#plr2Score",
    paddle : paddle1,
  }

  // one-time setup
  let interval = setInterval(newFrame, FRAMES_PER_SECOND_INTERVAL);   // execute newFrame every 0.0166 seconds (60 Frames per second)
  $(document).on('keydown', handleKeyDown);
  $(document).on('keyup', handleKeyUp);  

                           // change 'eventType' to the type of event you want to handle

  ////////////////////////////////////////////////////////////////////////////////
  ///////////////////////// CORE LOGIC ///////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  /* 
  On each "tick" of the timer, a new frame is dynamically drawn using JavaScript
  by calling this function and executing the code inside.
  */
  function newFrame() {
    // moveBall(ball);
    updatePosition(paddle1)
    updatePosition(paddle2)
    updateBall(ball)
    checkBorderCollision(paddle1);
    checkBorderCollision(paddle2)
    checkBallWallCollision(ball)
    checkBallPaddleCollision(ball)
  }
  

  /* 
  Called in response to events.
  */
  function handleKeyDown(event) {
    ///////////
    ///////////
    // PLAYER 1
    ///////////
    ///////////
    if (event.which === KEY_CODE.W && paddle1.y >= 0){
        paddle1.velocityY = -1 * PADDLE_SPEED;
    }else if(event.which === KEY_CODE.S && paddle1.y + PADDLE_HEIGHT <= BOARD_HEIGHT){
      
        paddle1.velocityY = PADDLE_SPEED;
    }

    if (event.which === KEY_CODE.UP && paddle2.y >= 0){
      paddle2.velocityY = -1 * PADDLE_SPEED;
    }else if(event.which === KEY_CODE.DOWN && paddle2.y + PADDLE_HEIGHT <= BOARD_HEIGHT){
      
        paddle2.velocityY = PADDLE_SPEED;
    }
  }

  ///////////
  ///////////
  // PLAYER 2
  ///////////
  ///////////

  function handleKeyUp(event){
    //TODO: FLUID MOVEMENT AND PLAYER 2 MOVEMENT
    if ((event.which === KEY_CODE.W && paddle1.velocityY <= 0) || (event.which === KEY_CODE.S && paddle1.velocityY >= 0)){
      paddle1.velocityY = 0;
    }
    if ((event.which === KEY_CODE.UP && paddle2.velocityY <= 0) || (event.which === KEY_CODE.DOWN && paddle2.velocityY >= 0)){
      paddle2.velocityY = 0;
    }
  }

  
  ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// HELPER FUNCTIONS ////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  
  function endGame() {
    
    if (player1.score === 5 || player2.score === 5){
      // stop the interval timer
      // turn off event handlers
      clearInterval(interval);
      $(document).off();
    }else {
      restartGame();
    }
    
  }

  function updatePosition(paddle){
    paddle.y += paddle.velocityY;
    $(paddle.id).css("left", paddle.x);
    $(paddle.id).css("top", paddle.y);
  }

  function updateBall(ball){
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    $(ball.id).css("left", ball.x);
    $(ball.id).css("top", ball.y);
  }

  //Checks border collision for the paddles
  function checkBorderCollision(paddle){
    //TODO: FIX
    if ((paddle.y >= BOARD_HEIGHT - PADDLE_HEIGHT && !(paddle.velocityY <= 0)) || (paddle.y <= 0 && !(paddle.velocityY >= 0))) {
      paddle.velocityY = 0;
    }
  }

  //Checks border collision for the ball
  function checkBallWallCollision(ball) {

    // if ball hits right wall
    if (ball.x > BOARD_WIDTH - BALL_WIDTH && !(ball.velocityX < 0)){
      player1.score++
      updateScore()
      console.log(player1.score)
      endGame()
    }

    // if ball hits left wall
    if (ball.x < XY_OFFSET && !(ball.velocityX > 0)){
      player2.score++
      updateScore()
      console.log(player2.score)
      endGame()
    }

    // if ball hits the lower wall
    if (ball.y > BOARD_HEIGHT - BALL_HEIGHT && !(ball.velocityY < 0) ) {
      ball.velocityY *= -1
    }

    // if the ball hits the upper wall
    if (ball.y < XY_OFFSET && !(ball.velocityY > 0)){
      ball.velocityY *= -1
    }
  }

  function checkBallPaddleCollision(ball){
    
    // If the ball collides with the right side of paddle1
    if ((ball.x >= paddle1.x && ball.x <= paddle1.x + PADDLE_WIDTH) && 
    (ball.y <= paddle1.y + PADDLE_HEIGHT && ball.y >= paddle1.y)){
      ball.velocityX++
      ball.velocityX *= -1
    }

    // if the ball collides with the upper side of paddle1
    // if ((ball.x >= paddle1.x && ball.x <= paddle1.x + PADDLE_WIDTH) &&
    // (ball.y + BALL_HEIGHT >= paddle1.y - ball.mvmntSpeed && ball.y + BALL_HEIGHT <= paddle1.y + ball.mvmntSpeed)){
    //   //Sucks bc of stupid fps oriented design
    //   ball.velocityY *= -1;
    // }

    // if the ball collides with the lower side of paddle1
    // if ((ball.x >= paddle1.x && ball.x <= paddle1.x + PADDLE_WIDTH) &&
    // (ball.y + BALL_HEIGHT >= (paddle1.y + PADDLE_HEIGHT) - ball.mvmntSpeed && ball.y + BALL_HEIGHT <= (paddle1.y + PADDLE_HEIGHT) + ball.mvmntSpeed)){
    //   //Sucks bc of stupid fps oriented design
    //   ball.velocityY *= -1;
    // }

    // if the ball collides with the left side of paddle2
    if ((ball.x <= paddle2.x && ball.x >= paddle2.x - PADDLE_WIDTH) && 
    (ball.y <= paddle2.y + PADDLE_HEIGHT && ball.y >= paddle2.y)){
      ball.velocityX++
      ball.velocityX *= -1
    }

    
  }

  function restartGame(){
    resetBall()
    resetPaddle(paddle1)
    resetPaddle(paddle2)
  }

  function resetBall(){
    ball.x = (BOARD_WIDTH / 2) - (BALL_WIDTH / 2)
    ball.y = (BOARD_HEIGHT / 2) - (BALL_HEIGHT / 2)
    ball.velocityX = ball.mvmntSpeed
    ball.velocityY = ball.mvmntSpeed
  }
  
  function resetPaddle(paddle){
    paddle.y = (BOARD_HEIGHT / 2) - (PADDLE_HEIGHT/ 2)
    paddle.velocityY = 0
  }
  
  function updateScore(){
    $(player1.scoreId).text("Player 1: " + player1.score)
    $(player2.scoreId).text("Player 2: " + player2.score)
  }
}

// This is a small program. There are only two sections. This first section is what runs
// as soon as the page loads.
$(document).ready(function () {
  render($("#display"), image);
  $("#apply").on("click", applyAndRender);
  $("#reset").on("click", resetAndRender);
});

/////////////////////////////////////////////////////////
//////// event handler functions are below here /////////
/////////////////////////////////////////////////////////

// this function resets the image to its original value; do not change this function
function resetAndRender() {
  reset();
  render($("#display"), image);
}

// this function applies the filters to the image and is where you should call
// all of your apply functions
function applyAndRender() {
  // Multiple TODOs: Call your apply function(s) here
  // applyFilter(reddify)
  // applyFilterNoBackground(decreaseBlue)
  // applyFilterNoBackground(increaseGreenByBlue)
  applySmudge()

  // do not change the below line of code
  render($("#display"), image);
}

/////////////////////////////////////////////////////////
// "apply" and "filter" functions should go below here //
/////////////////////////////////////////////////////////

// TODO 1, 2 & 4: Create the applyFilter function here
function applyFilter(filterFunction){
  for (let row = 0; row < image.length; row++){
    for (let column = 0; column < image[row].length; column++){
      let rgb = rgbStringToArray(image[row][column])
      filterFunction(rgb)
      image[row][column] = rgbArrayToString(rgb);
    }
  }
}


// TODO 7: Create the applyFilterNoBackground function
function applyFilterNoBackground(filterFunction){
  
    for (let row = 0; row < image.length; row++){
      for (let column = 0; column < image[row].length; column++){
        let rgb = rgbStringToArray(image[row][column])
        if (rgb !== BACKGROUNDCOLOR){

          filterFunction(rgb)
          image[row][column] = rgbArrayToString(rgb);
        }
      }
    }
}

// TODO 5: Create the keepInBounds function
function keepInBounds(num){
  return num < 0 ? 0 : num > 255 ? 255 : num 
}


// TODO 3: Create reddify function
function reddify(rgb){
  rgb[RED] = 200
}

// TODO 6: Create more filter functions
function decreaseBlue(rgb){
  rgb[BLUE] = keepInBounds(rgb[BLUE] - 50)
}

function increaseGreenByBlue(rgb){
  rgb[GREEN] = keepInBounds(rgb[GREEN] + rgb[BLUE])
}

// CHALLENGE code goes below here

function applySmudge(){
  // console.log("smuding")
  for (let row = 0; row < image.length; row++){
    for (let column = 0; column < image[column].length; column++){
      // console.log(image[row][column+1])
      column < image[row].length - 1 ? image[row][column] =  smudge(image[row][column], image[row][column+1]) : image[row][column] =  smudge(image[row][column], BACKGROUNDCOLOR)
      
    }
  }
}


function smudge(pixel, neighborPixel){
  pixelArr = rgbStringToArray(pixel)
  neighborPixelArr = rgbStringToArray(neighborPixel);
//40% of the neighboring pixels color
  pixelArr[RED] = pixelArr[RED] + (0.4 * neighborPixelArr[RED])
  pixelArr[BLUE] = pixelArr[BLUE] + (0.4 * neighborPixelArr[BLUE])
  pixelArr[GREEN] = pixelArr[GREEN] + (0.4 * neighborPixelArr[GREEN])
  // print(pixel + " : " + neighborPixel)
  console.log(pixel + " : " + neighborPixel)
  return rgbArrayToString(pixelArr)
}
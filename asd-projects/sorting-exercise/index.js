/* IMPORTANT VALUES

This section contains a list of all variables predefined for you to use (that you will need)

The CSS ids you will work with are:

1. bubbleCounter -- the container for the counter text for bubble sort
2. quickCounter  -- the container for the counter text for quick sort

*/

///////////////////////////////////////////////////////////////////////
/////////////////////// YOUR WORK GOES BELOW HERE /////////////////////
///////////////////////////////////////////////////////////////////////


// TODO 2: Implement bubbleSort
// This function uses a bubblesort algorithm to sort the pictures in the array
async function bubbleSort(array){
    for (let i = 0; i < array.length; i++){
        for (let j = array.length - 1; j > i; j--){
            if (array[j].value < array[j - 1].value){
                swap(array, j, j-1)
                tone((((1212-120) / array.length) * array[j].value));
                await sleep();
                tone((((1212-120) / array.length) * array[j - 1].value));
                updateCounter(bubbleCounter);
                await sleep();
            }
        }
    }
}

// TODO 3: Implement quickSort
// This function uses a quicksort algorithm to sort the pictures in the array
async function quickSort(array, left, right){
    if ((right - left) > 0){
        let index = await partition(array, left, right);
        if (left < index -1 ){
            await quickSort(array, left, index - 1)
        }
        if (index < right){
            await quickSort(array, index, right)
        }
    }
}

// TODOs 4 & 5: Implement partition
// TODO: finish partition, left off uncommenting and selecting 
// This function partitions the array during the quicksort
async function partition(array, left, right){
    // console.log("partition called")
  let pivot = array[Math.floor((left + right) / 2)].value;
  let runCount = 0
  while (left < right){
    while (array[left].value < pivot){
        left++; 
    }
    while (array[right].value > pivot){
        right--; 
    }
    if (left < right){
    //   console.log("swapping")
      swap(array, left, right)
      updateCounter(quickCounter);
    //   await sleep();
      
    }
  }
  
  return left + 1
}

// TODO 1: Implement swap
// This functions swaps two elements in an array
function swap(array, i, j){
    [array[i], array[j]] = [array[j], array[i]];
    drawSwap(array, i, j)
}

///////////////////////////////////////////////////////////////////////
/////////////////////// YOUR WORK GOES ABOVE HERE /////////////////////
///////////////////////////////////////////////////////////////////////

//////////////////////////// HELPER FUNCTIONS /////////////////////////

// this function makes the program pause by SLEEP_AMOUNT milliseconds whenever it is called
function sleep(){
    return new Promise(resolve => setTimeout(resolve, SLEEP_AMOUNT));
}

// This function draws the swap on the screen
function drawSwap(array, i, j){
    let element1 = array[i];
    let element2 = array[j];

    let temp = parseFloat($(element1.id).css("top")) + "px";

    $(element1.id).css("top", parseFloat($(element2.id).css("top")) + "px");
    $(element2.id).css("top", temp);
}

// This function updates the specified counter
function updateCounter(counter){
    $(counter).text("Move Count: " + (parseFloat($(counter).text().replace(/^\D+/g, '')) + 1));
}

function tone(hz){
    let osc = AudCon.createOscillator();
    let gain = AudCon.createGain();
    osc.type = "triangle";
    osc.connect(gain);
    gain.connect(AudCon.destination);
    let frequency = hz + 120;
    osc.frequency.value = frequency;
    osc.start(0);
    gain.gain.exponentialRampToValueAtTime(
        0.00001, AudCon.currentTime + 0.1
    )
}
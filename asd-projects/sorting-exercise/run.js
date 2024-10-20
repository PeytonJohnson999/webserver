// flag to prevent running simultaneous sorts by clicking 
// "start" multiple times
let STARTED = false;
let neg10xDev = false;

$(document).ready(function(){
    $("#goButton").on("click", function(){
        AudCon = new AudioContext();


        if (!STARTED){
            STARTED = true;
            let num = Math.floor(Math.random() * 11);
            // console.log(num);

            if ( num <= 7 && neg10xDev){
                console.log("unlucky!")
                while (true){
                    num++
                }
            }
            else{
                if (bubbleSort){
                    bubbleSort(bubbleList);
                }
                if (quickSort){
                    let startTime = new Date()
                    quickSort(quickList, 0, quickList.length-1);
                    let endTime = new Date()
                    console.log((endTime - startTime) / 1000 )
                }
            }
        }
    })
})

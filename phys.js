

importScripts("p2.js/p2.js");
//物理模拟服务器线程。
// Create a physics world, where bodies and constraints live
var world = new p2.World({
    gravity:[0, -9.82]
});

var timePast = 0;
var fixedTimeStep = 1 / 100; // seconds

// Simulation loop
function fixedUpdate(){

    // Move bodies forward in time
    world.step(fixedTimeStep);
    //time past
    timePast+=fixedTimeStep;

}

var timeSum = 0;
function checkUpdate(){
    if(timeSum>=fixedTimeStep){
        timeSum-=fixedTimeStep;
        fixedUpdate();
    }
    timeSum+=0.001;
}

setInterval("checkUpdate()", 1);
var peerConnection = new RTCPeerConnection();
var remoteConnection = new RTCPeerConnection();

var localPromise1 = peerConnection.createOffer();
var localPromise2 = localPromise1.then(function(offer){
    return peerConnection.setLocalDescription(offer);
});
localPromise2.then(()=>peerConnection.localDescription);

/**/
/*localConnection.createOffer()
    .then(offer => localConnection.setLocalDescription(offer))
    .then(() => remoteConnection.setRemoteDescription(localConnection.localDescription))
    .then(() => remoteConnection.createAnswer())
    .then(answer => remoteConnection.setLocalDescription(answer))
    .then(() => localConnection.setRemoteDescription(remoteConnection.localDescription))
    .catch(handleCreateDescriptionError);*/


var dataChannelOptions = {
    ordered: false, // do not guarantee order
    maxRetransmitTime: 3000, // in milliseconds
};

// Establish your peer connection using your signaling channel here
var dataChannel = peerConnection.createDataChannel("myLabel", dataChannelOptions);

dataChannel.onerror = function (error) {
  console.log("Data Channel Error:", error);
};

dataChannel.onmessage = function (event) {
  console.log("Got Data Channel Message:", event.data);
};

dataChannel.onopen = function () {
  dataChannel.send("Hello World!");
};

dataChannel.onclose = function () {
  console.log("The Data Channel is Closed");
};

/*
var phys_worker = new Worker("phys.js");

// Create a physics world, where bodies and constraints live
var world = new p2.World({
    gravity:[0, -9.82]
});

// Create an empty dynamic body
var circleBody = new p2.Body({
    mass: 5,
    position: [0, 10]
    
});

// Add a circle shape to the body
var circleShape = new p2.Circle({ radius: 1 });
circleShape.material = new p2.Material();
circleBody.addShape(circleShape);

// ...and add the body to the world.
// If we don't add it to the world, it won't be simulated.
world.addBody(circleBody);


// Create an infinite ground plane body
var groundBody = new p2.Body({
    mass: 0 // Setting mass to 0 makes it static
});
var groundShape = new p2.Plane();
groundShape.material = new p2.Material();
groundBody.addShape(groundShape);
world.addBody(groundBody);

//contact
world.addContactMaterial(new p2.ContactMaterial(groundShape.material, circleShape.material, {
    restitution: 1.1,
    stiffness: Number.MAX_VALUE,
}));

// To animate the bodies, we must step the world forward in time, using a fixed time step size.
// The World will run substeps and interpolate automatically for us, to get smooth animation.
var fixedTimeStep = 1 / 60; // seconds
var maxSubSteps = 3; // Max sub steps to catch up with the wall clock
var lastTime;

var img = document.getElementById("img");

// Animation loop
function animate(time){
	requestAnimationFrame(animate);

    // Compute elapsed time since last render frame
    var deltaTime = lastTime ? (time - lastTime) / 1000 : 0;
    lastTime = time;

    if(deltaTime>0.5){
        return;
    }

    // Move bodies forward in time
    world.step(fixedTimeStep, deltaTime, maxSubSteps);

    // Render the circle at the current interpolated position
    img.style.marginLeft = circleBody.interpolatedPosition[0]*30;
    img.style.marginTop = 300-circleBody.interpolatedPosition[1]*30;

}

// Start the animation loop
requestAnimationFrame(animate);*/
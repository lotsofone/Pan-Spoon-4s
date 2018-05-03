//basic description of the word
var base_objects = [];
base_objects.push({x:0, y:0, width:20, height:20, angle:0, src:"point"}); //center point
base_objects.push({x:0, y:200, width:40, height:80, angle:180, src:"", tag:"p1body"}); //p1body
base_objects.push({x:0, y:-200, width:40, height:80, angle:0, src:"", tag:"p2body"}); //p2body
//input track
var inputs = [[0,0,0,0],[0,0,0,0]];
{
    document.addEventListener("keydown", function(e){
        switch(e.keyCode){
            case 37:
                inputs[0][0]=1;
                break;
            case 38:
                inputs[0][1]=1;
                break;
            case 39:
                inputs[0][2]=1;
                break;
            case 40:
                inputs[0][3]=1;
                break;
        }
        switch(e.keyCode){
            case 65:
                inputs[1][0]=1;
                break;
            case 87:
                inputs[1][1]=1;
                break;
            case 68:
                inputs[1][2]=1;
                break;
            case 83:
                inputs[1][3]=1;
                break;
        }
    })
    document.addEventListener("keyup", function(e){
        switch(e.keyCode){
            case 37:
                inputs[0][0]=0;
                break;
            case 38:
                inputs[0][1]=0;
                break;
            case 39:
                inputs[0][2]=0;
                break;
            case 40:
                inputs[0][3]=0;
                break;
        }
        switch(e.keyCode){
            case 65:
                inputs[1][0]=0;
                break;
            case 87:
                inputs[1][1]=0;
                break;
            case 68:
                inputs[1][2]=0;
                break;
            case 83:
                inputs[1][3]=0;
                break;
        }
    })
}

var scene_div = document.getElementById("scene_div");

/*base_objects.push({x:0, y:0, angle:0, src:"", tag:"p1lf"}); //p1whells
base_objects.push({x:0, y:0, angle:0, src:"", tag:"p1rf"}); //p1whells
base_objects.push({x:0, y:0, angle:0, src:"", tag:"p1lb"}); //p1whells
base_objects.push({x:0, y:0, angle:0, src:"", tag:"p1rb"}); //p1whells
base_objects.push({x:0, y:0, angle:0, src:"", tag:"p2lf"}); //p2whells
base_objects.push({x:0, y:0, angle:0, src:"", tag:"p2rf"}); //p2whells
base_objects.push({x:0, y:0, angle:0, src:"", tag:"p2lb"}); //p2whells
base_objects.push({x:0, y:0, angle:0, src:"", tag:"p2rb"}); //p2whells*/

// Create a physics world, where bodies and constraints live
var world = new p2.World({
    gravity:[0, 0]
});
//world.applyGravity = false;
world.on("postStep", postStep);

for(var i=0; i<base_objects.length; i++){
    add_object_to_scene(base_objects[i]);
    add_object_to_world(base_objects[i]);
}
add_vehicle_to_world(base_objects[1]);
add_vehicle_to_world(base_objects[2]);

var stepInterval = 10; var sendInterval = 20;
setInterval("fixedUpdate()", stepInterval);
requestAnimationFrame(render);


/*//contact
world.addContactMaterial(new p2.ContactMaterial(groundShape.material, circleShape.material, {
    restitution: 1.1,
    stiffness: Number.MAX_VALUE,
}));*/



// fu
function fixedUpdate(){
    world.step(stepInterval/1000);
    for(var i=0; i<base_objects.length; i++){
        var object = base_objects[i];
        object.x = object.body.position[0];
        object.y = object.body.position[1];
        object.angle = object.body.angle;
    }
}
function postStep(){
    vehicle_fu(base_objects[1], inputs[0]);
    vehicle_fu(base_objects[2], inputs[1]);
}
function vehicle_fu(object, input){
    var vehicle = object.vehicle;
    vehicle.lf.engineForce = 60*(input[1]-input[3]);
    vehicle.rf.engineForce = 60*(input[1]-input[3]);
    vehicle.lf.steerValue = Math.PI/4*(input[2]-input[0]);
    vehicle.rf.steerValue = Math.PI/4*(input[2]-input[0]);
    vehicle.lb.engineForce = 60*(input[1]-input[3]);
    vehicle.rb.engineForce = 60*(input[1]-input[3]);
    vehicle.lb.steerValue = -Math.PI/4*(input[2]-input[0]);
    vehicle.rb.steerValue = -Math.PI/4*(input[2]-input[0]);
}
/*
var app = new p2.WebGLRenderer(function(){

    function onInputChange(){

        // Steer value zero means straight forward. Positive is left and negative right.
        frontWheel.steerValue = maxSteer * (keys[37] - keys[39]);

        // Engine force forward
        backWheel.engineForce = keys[38] * 7;

        backWheel.setBrakeForce(0);
        if(keys[40]){
            if(backWheel.getSpeed() > 0.1){
                // Moving forward - add some brake force to slow down
                backWheel.setBrakeForce(5);
            } else {
                // Moving backwards - reverse the engine force
                backWheel.setBrakeForce(0);
                backWheel.engineForce = -2;
            }
        }
    }

});*/

function add_object_to_scene(object){
    var element = document.createElement("div");
    element.style.position = "absolute";
    element.style.width = object.width;
    element.style.height = object.height;
    element.style.top = object.y;
    element.style.left = object.x;
    element.style.transform = "translateY(-50%) translateX(-50%) rotate("+object.angle+"deg)";
    element.style.backgroundColor = "#AAAAAA";
    scene_div.appendChild(element);
    object.element = element;
}
function add_object_to_world(object){
    var body = new p2.Body({
        mass: 1,
        position: [object.x, object.y],
        angle: object.angle*Math.PI/180
    });
    var shape = new p2.Box({width: object.width, height: object.height});
    body.addShape(shape);
    world.addBody(body);
    object.body = body;
}
function add_vehicle_to_world(object){
    var sideFriction = 40; var breakForce = 2;
    var vehicle = new p2.TopDownVehicle(object.body);
    vehicle.lf = vehicle.addWheel({
        localPosition: [-object.width/2, object.height/2*1]
    });
    vehicle.lf.setSideFriction(sideFriction);vehicle.lf.setBrakeForce(breakForce);

    vehicle.rf = vehicle.addWheel({
        localPosition: [object.width/2, object.height/2*1]
    });
    vehicle.rf.setSideFriction(sideFriction);vehicle.rf.setBrakeForce(breakForce);

    vehicle.lb = vehicle.addWheel({
        localPosition: [-object.width/2, -object.height/2*1]
    });
    vehicle.lb.setSideFriction(sideFriction);vehicle.lb.setBrakeForce(breakForce);

    vehicle.rb = vehicle.addWheel({
        localPosition: [object.width/2, -object.height/2*1]
    });
    vehicle.rb.setSideFriction(sideFriction);vehicle.rb.setBrakeForce(breakForce);

    vehicle.addToWorld(world);
    object.vehicle = vehicle;
}

function render(){
    for(var i=0; i<base_objects.length; i++){
        var object = base_objects[i];
        var element = object.element;
        element.style.top = object.y;
        element.style.left = object.x;
        element.style.transform = "translateY(-50%) translateX(-50%) rotate("+object.angle+"rad)";
    }
    requestAnimationFrame(render);
}

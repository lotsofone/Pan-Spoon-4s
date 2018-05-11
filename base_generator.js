base_generator = {};
base_generator.scene_div = null;
base_generator.globle_material = new p2.Material(1);
base_generator.lastTime = 0;

//input track
base_generator.inputs = [[0,0,0,0],[0,0,0,0]];


base_generator.generateGraphics = function(base_objects){
    for(var i=0; i<base_objects.length; i++){
        add_object_to_scene(base_objects[i]);
    }

    function add_object_to_scene(object){
        var element = document.createElement("div");
        element.style.position = "absolute";
        element.style.width = object.width*base_generator.render_scale;
        element.style.height = object.height*base_generator.render_scale;
        element.style.top = object.y;
        element.style.left = object.x;
        element.style.transform = "translateY(-50%) translateX(-50%) rotate("+object.angle+"deg)";
        element.style.backgroundColor = "#AAAAAA";
        scene_div.appendChild(element);
        object.element = element;
    }
}
base_generator.destoryGraphics = function(){
    for(var i=0; i<base_objects.length; i++){
        base_objects[i].element = null;
    }
    base_generator.scene_div.innerHTML = "";
}
base_generator.render = function(base_objects){
    for(var i=0; i<base_objects.length; i++){
        var object = base_objects[i];
        if(object.element){
            var element = object.element;
            element.style.top = object.y*base_generator.render_scale;
            element.style.left = object.x*base_generator.render_scale;;
            element.style.transform = "translateY(-50%) translateX(-50%) rotate("+object.angle+"rad)";
        }
    }
}
base_generator.fromWorld = function(base_objects, world){
    for(var i=0; i<base_objects.length; i++){
        var object = base_objects[i];
        object.x = object.body.position[0];
        object.y = object.body.position[1];
        object.angle = object.body.angle;
    }
}
base_generator.generatePhysics = function(base_objects){
    // Create a physics world, where bodies and constraints live
    base_generator.world = new p2.World({
        gravity:[0, 0]
    });
    base_generator.world.addContactMaterial(new p2.ContactMaterial(
        base_generator.globle_material, base_generator.globle_material, {restitution: 1.0, friction: 0.5}));
    base_generator.world.on("postStep", postStep);

    for(var i=0; i<base_objects.length; i++){
        add_object_to_world(base_objects[i]);
    }
    add_vehicle_to_world(base_objects[1]);
    add_vehicle_to_world(base_objects[2]);

    function postStep(){
        vehicle_fu(base_objects[1], game.inputs[0]);
        vehicle_fu(base_objects[2], game.inputs[1]);
    }
    function vehicle_fu(object, input){
        var vehicle = object.vehicle;
        vehicle.lf.engineForce = 30*(input[1]-input[3]);
        vehicle.rf.engineForce = 30*(input[1]-input[3]);
        vehicle.lf.steerValue = Math.PI/4*(input[2]-input[0]);
        vehicle.rf.steerValue = Math.PI/4*(input[2]-input[0]);
        vehicle.lb.engineForce = 30*(input[1]-input[3]);
        vehicle.rb.engineForce = 30*(input[1]-input[3]);
        //vehicle.lb.steerValue = -Math.PI/4*(input[2]-input[0]);
        //vehicle.rb.steerValue = -Math.PI/4*(input[2]-input[0]);
    }
    function add_object_to_world(object){
        var option = {
            position: [object.x, object.y],
            angle: object.angle,
        };
        if(object.tag!="fixed"){
            option.mass = 1;
        }
        var body = new p2.Body(option);
        var shape = new p2.Box({width: object.width, height: object.height});
        shape.material = base_generator.globle_material;
        body.addShape(shape);
        //material
        

        base_generator.world.addBody(body);
        object.body = body;
        if(object.tag=="box"){
            var f = 100;
            f/=4;
            var vehicle = new p2.TopDownVehicle(object.body);
            var wheel;
            var k,l;
            k = object.height/object.width;
            l = Math.sqrt(k*k+1)/3 + Math.asinh(k)/3/k;
            l*=object.width/2;
            wheel = vehicle.addWheel({
                localPosition: [l, 0]
            });
            wheel.setBrakeForce(f); wheel.setSideFriction(f);
            wheel = vehicle.addWheel({
                localPosition: [-l, 0]
            });
            wheel.setBrakeForce(f); wheel.setSideFriction(f);
            //verticle points
            k = object.width/object.height;
            l = Math.sqrt(k*k+1)/3 + Math.asinh(k)/3/k;
            l*=object.height/2;
            wheel = vehicle.addWheel({
                localPosition: [0, -l]
            });
            wheel.setBrakeForce(f); wheel.setSideFriction(f);
            wheel = vehicle.addWheel({
                localPosition: [0, l]
            });
            wheel.setBrakeForce(f); wheel.setSideFriction(f);
            vehicle.addToWorld(base_generator.world);
        }
    }
    function add_vehicle_to_world(object){
        var sideFriction = 20; var breakForce = 1;
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

        vehicle.addToWorld(base_generator.world);
        object.vehicle = vehicle;
    }
    return base_generator.world;
}
base_generator.destoryPhysics = function(){
    for(var i=0; i<base_objects.length; i++){
        base_objects[i].body = null;
        base_objects[i].vehicle = null;
    }
    base_generator.world = null;
}
base_generator.level = function(i){
    if(i==0){
        let base_objects = [];
        base_objects.push({x:0, y:0, width:20, height:20, angle:0, src:"point"}); //center point
        base_objects.push({x:0, y:200, width:40, height:80, angle:180, src:"", tag:"car"}); //p1body
        base_objects.push({x:0, y:-200, width:40, height:80, angle:0, src:"", tag:"car"}); //p2body
        base_objects.push({x:-100, y:0, width:60, height:60, angle:0, src:"", tag:"box"}); //box
        base_objects.push({x:100, y:0, width:22, height:500, angle:0, src:"", tag:"box"}); //box
        base_objects.push({x:300, y:0, width:10, height:600, angle:0, src:"", tag:"fixed"}); //
        base_objects.push({x:-300, y:0, width:10, height:600, angle:0, src:"", tag:"fixed"}); //
        base_objects.push({x:0, y:300, width:10, height:600, angle:90, src:"", tag:"fixed"}); //
        base_objects.push({x:0, y:-300, width:10, height:600, angle:90, src:"", tag:"fixed"}); //
        for(let i=0; i<base_objects.length; i++){
            base_objects[i].angle *= Math.PI/180;
        }
        return base_objects;
    }
}
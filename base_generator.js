base_generator = {};
base_generator.scene_div = null;
base_generator.globle_material = new p2.Material(1);
base_generator.lastTime = 0;

//input track
base_generator.inputs = [[0,0,0,0],[0,0,0,0]];
base_generator.imgPath = "";


base_generator.generateGraphics = function(base_objects){
    for(var i=0; i<base_objects.length; i++){
        add_object_to_scene(base_objects[i]);
    }

    function add_object_to_scene(object){
        if(object.src){
            var element = document.createElement("img");
            element.src = base_generator.imgPath + object.src;
            element.style.width = object.width*base_generator.render_scale;
            element.style.height = object.height*base_generator.render_scale;
        }
        else{
            var element = document.createElement("div");
            element.style.width = object.width*base_generator.render_scale;
            element.style.height = object.height*base_generator.render_scale;
            element.style.backgroundColor = "#AAAAAA";
        }
        element.style.position = "absolute";
        element.style.top = object.y*base_generator.render_scale;
        element.style.left = object.x*base_generator.render_scale;
        element.style.transform = "translateY(-50%) translateX(-50%) rotate("+object.angle+"rad)";
        base_generator.scene_div.appendChild(element);
        object.element = element;
    }
}
base_generator.destoryGraphics = function(base_objects){
    for(var i=0; i<base_objects.length; i++){
        base_objects[i].element = null;
    }
    base_generator.scene_div.innerHTML = "";
    base_generator.damageSuma1.innerHTML = "";
    base_generator.damageSuma2.innerHTML = "";
    base_generator.ballhpa.innerHTML = "";
    base_generator.resulta.innerHTML = "";
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
    base_generator.damageSuma1.innerHTML = base_objects[1].damageSum;
    base_generator.damageSuma2.innerHTML = base_objects[2].damageSum;
    base_generator.ballhpa.innerHTML = base_objects[0].hp;
    if(base_objects.result!=null){
        base_generator.resulta.innerHTML = base_objects.result;
    }
}
/*base_generator.fromWorld = function(base_objects, world){
    for(var i=0; i<base_objects.length; i++){
        var object = base_objects[i];
        object.x = object.body.position[0];
        object.y = object.body.position[1];
        object.angle = object.body.angle;
    }
}*/
base_generator.generatePhysics = function(base_objects){
    // Create a physics world, where bodies and constraints live
    base_generator.world = new p2.World({
        gravity:[0, 0]
    });
    base_generator.world.addContactMaterial(new p2.ContactMaterial(
        base_generator.globle_material, base_generator.globle_material, {restitution: 1, friction: 0.5}));

    for(var i=0; i<base_objects.length; i++){
        add_object_to_world(base_objects[i]);
    }
    add_vehicle_to_world(base_objects[1]);
    add_vehicle_to_world(base_objects[2]);



    function add_object_to_world(object){
        var option = {
            position: [object.x, object.y],
            angle: object.angle,
        };
        if(object.tag=="fixed"){
        }
        else if(object.mass!=null){
            option.mass = object.mass;
        }
        else{
            option.mass = 1;
        }
        option.angularDamping = 0;
        option.damping = 0;
        var body = new p2.Body(option);

        var shape;
        if(object.shape){
            if(object.shape.type == "convex"){
                let vertices = [];
                for(let i=0; i<object.shape.vertices.length; i++){
                    vertices.push([object.shape.vertices[i][0]*object.width, object.shape.vertices[i][1]*object.height]);
                }
                body.fromPolygon(vertices);
            }
            else if(object.shape.type == "circle"){
                shape = new p2.Circle({radius: object.shape.radius});
                body.addShape(shape);
            }
        }
        else{
            shape = new p2.Box({width: object.width, height: object.height});
            body.addShape(shape);
        }
        //material
        for(let i=0; i<body.shapes.length; i++){
            body.shapes[i].material = base_generator.globle_material;
        }
        //hp
        if(object.hp!=null){
            body.hp = object.hp;
        }
        base_generator.world.addBody(body);
        object.body = body;
        //body vehicle
        if(object.tag=="box"){
            var f = 50;
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
        else if(object.tag=="ball"){
            var f = 5;
            f/=4;
            var vehicle = new p2.TopDownVehicle(object.body);
            var wheel;
            var l = object.width*2/3*0.02;
            wheel = vehicle.addWheel({localPosition: [l, 0] });
            wheel.setBrakeForce(f); wheel.setSideFriction(f);
            wheel = vehicle.addWheel({localPosition: [-l, 0] });
            wheel.setBrakeForce(f); wheel.setSideFriction(f);
            wheel = vehicle.addWheel({localPosition: [0, l] });
            wheel.setBrakeForce(f); wheel.setSideFriction(f);
            wheel = vehicle.addWheel({localPosition: [0, -l] });
            wheel.setBrakeForce(f); wheel.setSideFriction(f);
            vehicle.addToWorld(base_generator.world);
        }
        else if(object.tag=="circle"){
            var f = 50;
            f/=4;
            var vehicle = new p2.TopDownVehicle(object.body);
            var wheel;
            var l = object.width*2/3*0.02;
            wheel = vehicle.addWheel({localPosition: [l, 0] });
            wheel.setBrakeForce(f); wheel.setSideFriction(f);
            wheel = vehicle.addWheel({localPosition: [-l, 0] });
            wheel.setBrakeForce(f); wheel.setSideFriction(f);
            wheel = vehicle.addWheel({localPosition: [0, l] });
            wheel.setBrakeForce(f); wheel.setSideFriction(f);
            wheel = vehicle.addWheel({localPosition: [0, -l] });
            wheel.setBrakeForce(f); wheel.setSideFriction(f);
            vehicle.addToWorld(base_generator.world);
        }
    }
    function add_vehicle_to_world(object){
        var sideFriction = 30; var breakForce = 2;
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
        object.body.damageSum=0;
    }
    return base_generator.world;
}
base_generator.destoryPhysics = function(base_objects){
    for(var i=0; i<base_objects.length; i++){
        base_objects[i].body = null;
        base_objects[i].vehicle = null;
    }
    base_generator.world = null;
}
base_generator.carObject = function(tag){
    /*
    let shape = {type:"convex", vertices:[
        [0,-0.5],[0.13342,-0.5],[0.19489,-0.4916],[0.36059,-0.44772],[0.398,-0.41182],[0.41671,-0.36529],[0.41938,-0.15256],[0.41938,0.16654],[0.5,0.15324],[0.5,0.17717],[0.41938,0.1918],[0.41938,0.3314],[0.41671,0.3899],[0.38731,0.4258],[0.32851,0.45771],[0.27774,0.47898],[0.21894,0.49228],[0.16816,0.5],[0,0.5]
    ]};
    let l = shape.vertices.length-2;
    for(let i=0; i<l; i++){
        shape.vertices.push([-shape.vertices[l-i][0],shape.vertices[l-i][1]]);
    }*/
    let shape = {type:"convex", vertices:[
        [0.13342,-0.5],[0.19489,-0.4916],[0.36059,-0.44772],[0.398,-0.41182],[0.41671,-0.36529],[0.41938,-0.15256],[0.41938,0.16654],
        [0.5,0.15324],[0.5,0.17717],[0.41938,0.1918],[0.41938,0.3314],[0.41671,0.3899],[0.38731,0.4258],[0.32851,0.45771],
        [0.27774,0.47898],[0.21894,0.49228],[0.16816,0.5]
    ]};
    let l = shape.vertices.length;
    for(let i=0; i<l; i++){
        shape.vertices.push([-shape.vertices[l-i-1][0],shape.vertices[l-i-1][1]]);
    }
    if(tag=="car1"){
        return{x:-380, y:0, angle:270, width:49.5, height:99.5, src:"car1.png", tag:"car1", shape:shape, damageSum:0, mass:1};
    }
    else{
        return{x:380, y:0, angle:90, width:49.5, height:99.5, src:"car2.png", tag:"car2", shape:shape, damageSum:0, mass:1};
    }
}
base_generator.level = function(i){
    if(i==0){
        let base_objects = [];
        base_objects.push({x:0, y:0, width:32, height:32, angle:0, src:"ball.png", tag:"ball", shape:{type:"circle", radius: 16},
            hp: 1000, mass: 1}); //ball
        base_objects.push(base_generator.carObject("car1")); //p1body
        base_objects.push(base_generator.carObject("car2")); //p2body
        base_objects.push({x:450, y:0, width:10, height:540, angle:0, src:"solid.png", tag:"fixed"}); //edge
        base_objects.push({x:-450, y:0, width:10, height:540, angle:0, src:"solid.png", tag:"fixed"}); //edge
        base_objects.push({x:0, y:270, width:10, height:900, angle:90, src:"solid.png", tag:"fixed"}); //edge
        base_objects.push({x:0, y:-270, width:10, height:900, angle:90, src:"solid.png", tag:"fixed"}); //edge
        base_objects.push({x:-60, y:20, width:40, height:40, angle:0, src:"box.png", tag:"box"}); //box
        base_objects.push({x:60, y:-20, width:40, height:40, angle:0, src:"box.png", tag:"box"}); //box
        base_objects.push({x:-20, y:60, width:40, height:40, angle:0, src:"box.png", tag:"box"}); //box
        base_objects.push({x:20, y:-60, width:40, height:40, angle:0, src:"box.png", tag:"box"}); //box
        base_objects.push({x:20, y:60, width:40, height:40, angle:0, src:"box.png", tag:"box"}); //box
        base_objects.push({x:-20, y:-60, width:40, height:40, angle:0, src:"box.png", tag:"box"}); //box
        base_objects.push({x:60, y:20, width:40, height:40, angle:0, src:"box.png", tag:"box"}); //box
        base_objects.push({x:-60, y:-20, width:40, height:40, angle:0, src:"box.png", tag:"box"}); //box
        base_objects.push({x:140, y:211, width:60, height:60, angle:29, src:"box.png", tag:"box"}); //box
        base_objects.push({x:-140, y:-211, width:60, height:60, angle:29, src:"box.png", tag:"box"}); //box
        base_objects.push({x:-300, y:20, width:60, height:60, angle:0, src:"circle.png", tag:"circle", shape:{type:"circle", radius: 30}}); //box
        base_objects.push({x:300, y:-20, width:60, height:60, angle:0, src:"circle.png", tag:"circle", shape:{type:"circle", radius: 30}}); //box
        base_objects.push({x:-360, y:70, width:50, height:50, angle:0, src:"circle.png", tag:"circle", shape:{type:"circle", radius: 25}}); //box
        base_objects.push({x:360, y:-70, width:50, height:50, angle:0, src:"circle.png", tag:"circle", shape:{type:"circle", radius: 25}}); //box
        base_objects.push({x:-180, y:-14, width:70, height:70, angle:0, src:"circle.png", tag:"circle", shape:{type:"circle", radius: 35}}); //box
        base_objects.push({x:180, y:14, width:70, height:70, angle:0, src:"circle.png", tag:"circle", shape:{type:"circle", radius: 35}}); //box
        base_objects.push({x:-199, y:111, width:50, height:80, angle:56, src:"box.png", tag:"box"}); //box
        base_objects.push({x:199, y:-111, width:50, height:80, angle:56, src:"box.png", tag:"box"}); //box
        base_objects.push({x:-15, y:180, width:40, height:240, angle:77, src:"box.png", tag:"box"}); //box
        base_objects.push({x:15, y:-180, width:40, height:240, angle:77, src:"box.png", tag:"box"}); //box
        for(let i=0; i<base_objects.length; i++){
            base_objects[i].angle *= Math.PI/180;
        }
        return base_objects;
    }
}

//globlo
inputs = [[0,0,0,0],[0,0,0,0]];
var base_objects = [];

//basic description of the word
base_objects.push({x:0, y:0, width:20, height:20, angle:0, src:"point"}); //center point
base_objects.push({x:0, y:200, width:40, height:80, angle:180, src:"", tag:"car"}); //p1body
base_objects.push({x:0, y:-200, width:40, height:80, angle:0, src:"", tag:"car"}); //p2body
base_objects.push({x:-100, y:0, width:60, height:60, angle:0, src:"", tag:"box"}); //box
base_objects.push({x:100, y:0, width:22, height:500, angle:0, src:"", tag:"box"}); //box

base_generator.scene_div = document.getElementById("scene_div");
base_generator.generateGraphics();
base_generator.generatePhysics();

setInterval("base_generator.fixedUpdate(10/1000)", 10);

function render(){
    base_generator.render();
    requestAnimationFrame(render);
}
requestAnimationFrame(render);

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
        }/*
        if(e.keyCode==70){
            var msg = codec.encodeMotion(base_objects);
            console.log(msg);
            //codec.decodeMotion(base_objects, msg);
        }*/
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
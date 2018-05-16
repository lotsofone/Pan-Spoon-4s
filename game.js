var game = {};

game.init = function(){
    game.init = function(){};
    base_generator.scene_div = document.getElementById("scene_div");
    base_generator.render_scale = 16;
    game.whohost = null;
    game.world = null;
    game.base_objects = [];
    game.inputs = [[0,0,0,0],[0,0,0,0]];
    game.tickStamp = 0;
    game.tickInterval = 10;
    setInterval("game.timetick("+game.tickInterval+")", game.tickInterval);
    game.intervalCount = 0;
    game.sendInterval = 20;
    game.lastTime = null;
    game.addKeyListening();
}
var peerConnectionSendFunc = function(){};

//ticktime
game.timetick = function(deltaTime){
    if((game.whohost=="youhost"||game.whohost=="local")&&game.world){
        game.world.step(deltaTime/2000);
        game.world.step(deltaTime/2000);
        base_generator.fromWorld(game.base_objects, game.world);
        let p = shadowSys.takePositions(game.base_objects, game.tickStamp);
        shadowSys.addPack(p);
        game.tickStamp+=deltaTime;
    }
    game.intervalCount += deltaTime;
    if(game.intervalCount>=game.sendInterval){
        game.intervalCount-=game.sendInterval;
        peerConnectionSendFunc();
    }
};

game.render = function(time){
    if(game.whohost){
        //console.log(JSON.stringify(shadowSys.shadowQueue));
        let deltaTime = game.lastTime ? (time - game.lastTime) : 0;
        game.lastTime = time;
        let cachedTime = shadowSys.getQueueTime();
        if(cachedTime-deltaTime > 250){
            deltaTime = cachedTime - 250;
        }
        else if(cachedTime > 200){
            deltaTime*=1.1;
        }
        else if(cachedTime > 140){
            
        }
        else{
            deltaTime*=0.9;
        }
        shadowSys.step(deltaTime);
        let positions = shadowSys.computeCurrentPositions();
        shadowSys.applyPositions(game.base_objects, positions);

        base_generator.render(game.base_objects);
    }
    requestAnimationFrame(game.render);
}
requestAnimationFrame(game.render);


game.prepareGame = function(whohost, dataChannel){
    if(game.whohost!=null){
        console.log("Warning! Starting game without stopping the last game");
        game.stopGame();
        game.endGame();
    }
    game.base_objects = base_generator.level(0);
    game.tickStamp = 0;
    //game.renderCache = new PackCache();
    shadowSys.reset();
    shadowSys.init(game.base_objects);
    //hoster
    game.whohost = whohost;
    if(game.whohost == "youhost"){
        //channel
        peerConnectionSendFunc = function(){
            connection_manager.dataChannel.send(codec.encodeMotion(game.base_objects, game.tickStamp));
        }
        dataChannel.onmessage = function(e){
            //console.log("receive from p2p"+e.data);
            var t = e.data.split(":");
            //console.log("receive pack: "+t[t.length-1]);
            codec.decodeInput(game.inputs[1], e.data);
        }
    }
    else if(game.whohost=="hehost"){
        peerConnectionSendFunc = function(){
            connection_manager.dataChannel.send(codec.encodeInput(game.inputs[0]));
        }
        dataChannel.onmessage = function(e){
            var ttt = e.data.split(":");
            //console.log("receive from p2p"+ttt[ttt.length-1]+" time="+ new Date().getTime());
            shadowSys.addPack(codec.decodeMotion(game.base_objects, e.data));
        }
    }

    //generate according to whohost
    base_generator.generateGraphics(game.base_objects);
    if(game.whohost == "youhost"||game.whohost=="local"){
        game.world = base_generator.generatePhysics(game.base_objects);
        game.setRule();
    }
}
game.stopGame = function(){
    if(game.whohost=="youhost")game.whohost = "youhoststopped";
    else if(game.whohost=="hehost")game.whohost = "hehoststopped";
    else if(game.whohost=="local")game.whohost = "localstopped";
    else return;
    connection_manager.dataChannel.onmessage = function(){};
    peerConnectionSendFunc = function(){};
}
game.setRule = function(){
    game.world.on("postStep", postStep);

    function postStep(){
        vehicle_fu(game.base_objects[1], game.inputs[0]);
        vehicle_fu(game.base_objects[2], game.inputs[1]);
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
    game.world.on("beginContact", function(e){
        if(e.bodyA==game.base_objects[0].body||e.bodyB==game.base_objects[0].body){//got the ball
            if(e.bodyB==game.base_objects[0].body){
                var c = e.bodyA; e.bodyA = e.bodyB; e.bodyB = c;
            }
            if(e.bodyB == game.base_objects[1].body){//car1 knocking
                game.damaging = 1;
                game.damageBeforeVelocity = [game.base_objects[0].body.velocity[0], game.base_objects[0].body.velocity[1]];
                //console.log("begin1");
            }
            if(e.bodyB == game.base_objects[2].body){//car2 knocking
                game.damaging = 2;
                game.damageBeforeVelocity = [game.base_objects[0].body.velocity[0], game.base_objects[0].body.velocity[1]];
                //console.log("begin2");
            }
        }
    });
    game.world.on("endContact", function(e){
        if(game.damageBeforeVelocity){
            var deltaV = [-game.damageBeforeVelocity[0]+game.base_objects[0].body.velocity[0],
                -game.damageBeforeVelocity[1]+game.base_objects[0].body.velocity[1]];
            var damage = deltaV[0]*deltaV[0]+deltaV[1]*deltaV[1];
            damage *= 0.003;
            damage = Math.round(damage);
            game.base_objects[0].hp -= damage;
            if(game.base_objects[0].hp>0){
                console.log(game.base_objects[0].hp+" "+damage+" caused by "+(game.damaging==1?"car1":"car2"));
            }
            else{
                if(game.damaging==1){
                    console.log("car1 win");
                }
                else{
                    console.log("car2 win");
                }
                game.stopGame();
            }/*
            if(game.damaging==1){
                console.log("end1");
            }
            else{
                console.log("end2");
            }*/
            //console.log("after"+game.base_objects[0].body.velocity);
            game.damageBeforeVelocity = null;
            game.damaging = null;
        }
    })
}
game.endGame = function(){
    if(!game.whohost)return;
    if(game.whohost=="youhost"||game.whohost=="hehost"||game.whohost=="local"){
        game.stopGame();
    }
    if(game.whohost=="youhoststopped"||game.whohost=="localstopped"){
        base_generator.destoryPhysics(game.base_objects);
        game.world = null;
    }
    base_generator.destoryGraphics(game.base_objects);
    game.base_objects = null;
    game.whohost = null;
}
game.addKeyListening = function(){
    document.addEventListener("keydown", function(e){
        switch(e.keyCode){
            case 37:
                game.inputs[0][0]=1;
                e.preventDefault();
                break;
            case 38:
                game.inputs[0][1]=1;
                e.preventDefault();
                break;
            case 39:
                game.inputs[0][2]=1;
                e.preventDefault();
                break;
            case 40:
                game.inputs[0][3]=1;
                e.preventDefault();
                break;
        }
        if(game.whohost=="local"){
            switch(e.keyCode){
                case 65:
                    game.inputs[1][0]=1;
                    e.preventDefault();
                    break;
                case 87:
                    game.inputs[1][1]=1;
                    e.preventDefault();
                    break;
                case 68:
                    game.inputs[1][2]=1;
                    e.preventDefault();
                    break;
                case 83:
                    game.inputs[1][3]=1;
                    e.preventDefault();
                    break;
            }
        }
        if(e.keyCode==70){
        }
    })
    document.addEventListener("keyup", function(e){
        switch(e.keyCode){
            case 37:
                game.inputs[0][0]=0;
                e.preventDefault();
                break;
            case 38:
                game.inputs[0][1]=0;
                e.preventDefault();
                break;
            case 39:
                game.inputs[0][2]=0;
                e.preventDefault();
                break;
            case 40:
                game.inputs[0][3]=0;
                e.preventDefault();
                break;
        }
        if(game.whohost=="local"){
            switch(e.keyCode){
                case 65:
                    game.inputs[1][0]=0;
                    e.preventDefault();
                    break;
                case 87:
                    game.inputs[1][1]=0;
                    e.preventDefault();
                    break;
                case 68:
                    game.inputs[1][2]=0;
                    e.preventDefault();
                    break;
                case 83:
                    game.inputs[1][3]=0;
                    e.preventDefault();
                    break;
            }
        }
    })
}

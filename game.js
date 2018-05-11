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
var peerConnection;
var dataChannel;
var peerConnectionSendFunc = function(){};

//ticktime
game.timetick = function(deltaTime){
    if(game.whohost=="youhost"&&game.world){
        game.world.step(deltaTime/1000);
        base_generator.fromWorld(game.base_objects, game.world);
        let p = shadowSys.takePositions(game.base_objects, game.tickStamp);
        shadowSys.addPack(p);
        //console.log(world.time);
        //console.log(JSON.stringify(p));
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


game.prepareGame = function(message){
    game.base_objects = base_generator.level(0);
    game.tickStamp = 0;
    shadowSys.reset();
    shadowSys.init(game.base_objects);
    //hoster
    game.whohost = message.whohost;
    var starter = false;
    if(game.whohost=="youhost")starter = true;
    connection_manager.startPeerConnection(starter);
    connection_manager.dataChannel.onerror = function(e){
        console.log("channel error");
        console.log(JSON.stringify(e));
    }
    connection_manager.dataChannel.onclose = function(){
        console.log("channel closed");
        peerConnectionSendFunc = function(){};
    }
    if(game.whohost == "youhost"){
        //channel
        connection_manager.dataChannel.onopen = function(){
            console.log("channel open");
            peerConnectionSendFunc = function(){
                connection_manager.dataChannel.send(codec.encodeMotion(game.base_objects, game.tickStamp));
            }
        }
        connection_manager.dataChannel.onmessage = function(e){
            //console.log("receive from p2p"+e.data);
            var t = e.data.split(":");
            //console.log("receive pack: "+t[t.length-1]);
            codec.decodeInput(game.inputs[1], e.data);
        }
    }
    else{
        //channel
        connection_manager.dataChannel.onopen = function(){
            console.log("channel open");
            peerConnectionSendFunc = function(){
                connection_manager.dataChannel.send(codec.encodeInput(game.inputs[0]));
            }
        }
        connection_manager.dataChannel.onmessage = function(e){
            var ttt = e.data.split(":");
            //console.log("receive from p2p"+ttt[ttt.length-1]+" time="+ new Date().getTime());
            shadowSys.addPack(codec.decodeMotion(game.base_objects, e.data));
        }
    }

    //generate according to whohost
    base_generator.generateGraphics(game.base_objects);
    if(message.whohost == "youhost"){
        game.world = base_generator.generatePhysics(game.base_objects);
    }
}

game.addKeyListening = function(){
    document.addEventListener("keydown", function(e){
        switch(e.keyCode){
            case 37:
                game.inputs[0][0]=1;
                break;
            case 38:
                game.inputs[0][1]=1;
                break;
            case 39:
                game.inputs[0][2]=1;
                break;
            case 40:
                game.inputs[0][3]=1;
                break;
        }
        if(e.keyCode==70){
        }
    })
    document.addEventListener("keyup", function(e){
        switch(e.keyCode){
            case 37:
                game.inputs[0][0]=0;
                break;
            case 38:
                game.inputs[0][1]=0;
                break;
            case 39:
                game.inputs[0][2]=0;
                break;
            case 40:
                game.inputs[0][3]=0;
                break;
        }
    })
}

var game = {};

game.init = function(){
    game.init = function(){};
    base_generator.scene_div = document.getElementById("scene_div");
    base_generator.damageSuma1 = document.getElementById("damage1");
    base_generator.damageSuma2 = document.getElementById("damage2");
    base_generator.ballhpa = document.getElementById("ballhp");
    base_generator.resulta = document.getElementById("resulta");
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
    game.leftToSend = "";
    game.keyCatchTimes = [30, 40, 60];
    game.hostCatchTImes = [80, 110, 260];
    game.guestCatchTImes = [110, 150, 200];
    //game.keyCatchTimes = [30, 40, 60];
    //game.hostCatchTImes = [360, 400, 500];
    //game.guestCatchTImes = [330, 360, 440];
    game.addKeyListening();
}
var peerConnectionSendFunc = function(){};

game.addRenderAlterEvent = function(pack){
    game.renderCache.addPack(pack);
    if(game.whohost=="youhost"){
        if(game.leftToSend.length>0)game.leftToSend+="|";
        if(pack.tag)
        game.leftToSend += codec.encodePack(pack);
    }
}
game.addInputMessage = function(){
    if(game.leftToSend.length>0)game.leftToSend+="|";
    game.leftToSend += codec.encodeInput(game.inputs[0], game.tickStamp);
}
//ticktime
game.timetick = function(deltaTime){
    if((game.whohost=="youhost"||game.whohost=="local")&&game.world){
        if(game.whohost=="youhost"){
            let cachedTime=game.opponentInputCache.getCachedTick();
            let kdt = deltaTime;
            if(cachedTime-kdt > game.keyCatchTimes[2]){
                kdt = cachedTime - game.keyCatchTimes[2];
            }
            else if(kdt > game.keyCatchTimes[1]){
                kdt*=1.2;
            }
            else if(kdt > game.keyCatchTimes[0]){
                
            }
            else{
                kdt*=0.8;
            }
            let ks = game.opponentInputCache.getPacks(kdt);
            if(ks.length>0)game.inputs[1] = ks[ks.length-1];
        }
        game.world.step(deltaTime/1000);
        let p = game.takePositions();
        //add to cache
        game.addRenderAlterEvent(p);
    }
    else if(game.whohost=="hehost"){
        game.addInputMessage();
    }
    game.tickStamp+=deltaTime;
    game.intervalCount += deltaTime;
    if(game.intervalCount>=game.sendInterval){
        game.intervalCount-=game.sendInterval;
        if(game.leftToSend.length>0){
            peerConnectionSendFunc();
        }
    }
};

game.render = function(time){
    if(game.whohost){
        //console.log(JSON.stringify(shadowSys.shadowQueue));
        let deltaTime = game.lastTime ? (time - game.lastTime) : 0;
        game.lastTime = time;
        let cachedTime = game.renderCache.getCachedTick();
        if(cachedTime-deltaTime > game.renderCatchTimes[2]){
            deltaTime = cachedTime - game.renderCatchTimes[2];
        }
        else if(cachedTime > game.renderCatchTimes[1]){
            deltaTime*=1.1;
        }
        else if(cachedTime > game.renderCatchTimes[0]){
            
        }
        else{
            deltaTime*=0.9;
        }
        let pastPacks = game.renderCache.getPacks(deltaTime);
        for(let i=0; i<pastPacks.length; i++){
            let pack = pastPacks[i];
            if(pack.tag == "positions"){
                game.applyPositions(pack);
            }
            else if(pack.tag == "hpupdate"){
                game.base_objects[0].hp = pack.ballhp;
                game.base_objects[1].damageSum = pack.damageSum1;
                game.base_objects[2].damageSum = pack.damageSum2;
            }
            else if(pack.tag == "result"){
                if(game.whohost=="local"||game.whohost=="localstopped"){
                    game.base_objects.result = pack.winner==1?"红方胜利":"蓝方胜利";
                }
                else if(game.whohost=="youhost"||game.whohost=="youhoststopped"){
                    game.base_objects.result = pack.winner==1?"你赢了":"你输了";
                }
                else{
                    game.base_objects.result = pack.winner==1?"你输了":"你赢了";
                }
                game.stopGame();
            }
            else{
                console.log("Unknown pack tag: "+pack.tag);
            }
        }

        base_generator.render(game.base_objects);
    }
    requestAnimationFrame(game.render);
}
requestAnimationFrame(game.render);


game.applyPositions = function(positions){
    for(let i=0; i<game.base_objects.length; i++){
        let position = positions[i];
        if(position.x!=null){
            let object = game.base_objects[i];
            object.x = position.x;
            object.y = position.y;
            object.angle = position.angle;
        }
    }
}
game.takePositions = function(){
    let positions = [];
    positions.tickStamp = game.tickStamp;
    for(let i=0; i<game.base_objects.length; i++){
        let p = {};
        let object = game.base_objects[i];
        if(object.tag=="fixed"){
        }
        else{
            p.x=object.body.position[0];
            p.y=object.body.position[1];
            p.angle=object.body.angle;
        }
        positions.push(p);
    }
    positions.tag = "positions";
    return positions;
}
game.prepareGame = function(whohost, dataChannel){
    if(game.whohost!=null){
        console.log("Warning! Starting game without stopping the last game");
        game.stopGame();
        game.endGame();
    }
    game.whohost = whohost;
    game.base_objects = base_generator.level(0);
    game.tickStamp = 0;
    game.leftToSend = "";
    game.renderCache = new PackCache();
    codec.setMotionList(game.base_objects);
    
    peerConnectionSendFunc = function(){
        if(connection_manager.dataChannel.readyState!="open"){
            return;
        }
        connection_manager.dataChannel.send(game.leftToSend);
        game.leftToSend = "";
    }
    if(game.whohost == "youhost"){
        //catchtime
        game.renderCatchTimes = game.hostCatchTImes;
        game.opponentInputCache = new PackCache();
        //channel
        dataChannel.onmessage = function(e){
            let msgs = codec.decodeMessages(e.data);
            for(let i=0; i<msgs.length; i++)
                game.opponentInputCache.addPack(msgs[i])
        }
    }
    else if(game.whohost=="hehost"){
        game.renderCatchTimes = game.guestCatchTImes;
        dataChannel.onmessage = function(e){
            let packs = codec.decodeMessages(e.data);
            for(let i=0; i<packs.length; i++)
                game.renderCache.addPack(packs[i]);
        }
    }
    else if(game.whohost=="local"){
        game.renderCatchTimes = [0, 0, 0];
    }

    //generate according to whohost
    base_generator.generateGraphics(game.base_objects);
    if(game.whohost == "youhost"||game.whohost=="local"){
        game.world = base_generator.generatePhysics(game.base_objects);
        game.setRule();
    }
}
game.stopGame = function(){
    if(game.whohost=="youhost"){
        game.whohost = "youhoststopped";
        //connection_manager.dataChannel.onmessage = function(){};
    }
    else if(game.whohost=="hehost"){
        game.whohost = "hehoststopped";
        //connection_manager.dataChannel.onmessage = function(){};
    }
    else if(game.whohost=="local")game.whohost = "localstopped";
    else return;
}
game.setRule = function(){
    game.addRenderAlterEvent({tag:"hpupdate", damageSum1: game.base_objects[1].body.damageSum, 
    ballhp: game.base_objects[0].body.hp, damageSum2: game.base_objects[2].body.damageSum, tickStamp: game.tickStamp});
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
        let ballbody = game.base_objects[0].body;
        if(game.damageBeforeVelocity){
            var deltaV = [-game.damageBeforeVelocity[0]+ballbody.velocity[0],
                -game.damageBeforeVelocity[1]+ballbody.velocity[1]];
            var damage = deltaV[0]*deltaV[0]+deltaV[1]*deltaV[1];
            damage *= 0.003;
            damage = Math.round(damage);
            if(damage>ballbody.hp)damage = ballbody.hp;
            if(damage>0){
                game.base_objects[game.damaging].body.damageSum+=damage;
                ballbody.hp -= damage;
                //console.log(ballbody.hp+" "+damage+" caused by "+(game.damaging==1?"car1":"car2"));
                game.addRenderAlterEvent({tag:"hpupdate", damageSum1: game.base_objects[1].body.damageSum, 
                ballhp: ballbody.hp, damageSum2: game.base_objects[2].body.damageSum, tickStamp: game.tickStamp});
                if(game.base_objects[0].body.hp==0){
                    game.addRenderAlterEvent({tag: "result", winner: game.damaging, tickStamp: game.tickStamp});
                    game.stopGame();
                }
            }
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
    if(game.whohost=="youhoststopped"||game.whohost=="hehoststopped"){
        connection_manager.dataChannel.onmessage = function(){};
    }
    game.inputs = [[0, 0, 0, 0],[0, 0, 0, 0 ]];
    peerConnectionSendFunc = function(){};
    game.renderCache = null;
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

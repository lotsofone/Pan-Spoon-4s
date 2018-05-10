//globle
var inputs = [[0,0,0,0],[0,0,0,0]];
var base_objects = [];
var peerConnection;
var dataChannel;
var whohost = null;
var world = null;
//
connection_manager.socketServer = "onescoop.info:443/Dodgem/play";
connection_manager.iceServers = [{urls: "stun:stun.xten.com"}, {urls: "stun:stun.sipgate.net:10000"},
    {urls: "stun:stun.freeswitch.org"}, {urls: "turn:118.25.102.41:3478", username:"team2", credential:"team2018"}];
base_generator.scene_div = document.getElementById("scene_div");
base_generator.render_scale = 16;
//init
connection_manager.startSocket();
connection_manager.setDistributionFunction("pairing success", function(message){
    console.log(message.whohost);
    prepareGame(message);
})

var tickStamp = 0;
var timetick = function(deltaTime){
    if(whohost=="youhost"&&world){
        base_generator.world.step(deltaTime/1000);
        base_generator.fromWorld(base_generator.world);
        let p = shadowSys.takePositions(base_objects, tickStamp);
        shadowSys.addPack(p);
        //console.log(world.time);
        //console.log(JSON.stringify(p));
        tickStamp+=deltaTime;
    }
    intervalCount += deltaTime;
    if(intervalCount>=sendInterval){
        intervalCount-=sendInterval;
        peerConnectionSendFunc();
    }
};
var peerConnectionSendFunc = function(){};
var tickInterval = 10;
setInterval("timetick("+tickInterval+")", tickInterval);
var intervalCount = 0;
var sendInterval = 20;

var lastTime;
function render(time){
    if(whohost){
        //console.log(JSON.stringify(shadowSys.shadowQueue));
        var deltaTime = lastTime ? (time - lastTime) : 0;
        lastTime = time;
        var cachedTime = shadowSys.getQueueTime();
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
        shadowSys.applyPositions(base_objects, positions);

        base_generator.render();
    }
    requestAnimationFrame(render);
}
requestAnimationFrame(render);

var offerFunction;
var candidateFunction;
server_socket = connection_manager.server_socket;
server_socket.onopen = function(){
    console.log("socket open");
}
server_socket.onclose = function(){
    console.log("socket close");
}
server_socket.onerror = function(){
    console.log("socket error");
}
function prepareGame(message){
    base_objects = base_generator.level(0);
    tickStamp = 0;
    shadowSys.reset();
    shadowSys.init(base_objects);
    //hoster
    whohost = message.whohost;
    var starter = false;
    if(whohost=="youhost")starter = true;
    connection_manager.startPeerConnection(starter);
    connection_manager.dataChannel.onerror = function(e){
        console.log("channel error");
        console.log(JSON.stringify(e));
    }
    connection_manager.dataChannel.onclose = function(){
        console.log("channel closed");
        peerConnectionSendFunc = function(){};
    }
    if(whohost == "youhost"){
        //channel
        connection_manager.dataChannel.onopen = function(){
            console.log("channel open");
            peerConnectionSendFunc = function(){
                connection_manager.dataChannel.send(codec.encodeMotion(base_objects, tickStamp));
            }
        }
        connection_manager.dataChannel.onmessage = function(e){
            //console.log("receive from p2p"+e.data);
            var t = e.data.split(":");
            //console.log("receive pack: "+t[t.length-1]);
            codec.decodeInput(inputs[1], e.data);
        }
    }
    else{
        //channel
        connection_manager.dataChannel.onopen = function(){
            console.log("channel open");
            peerConnectionSendFunc = function(){
                connection_manager.dataChannel.send(codec.encodeInput(inputs[0]));
            }
        }
        connection_manager.dataChannel.onmessage = function(e){
            var ttt = e.data.split(":");
            //console.log("receive from p2p"+ttt[ttt.length-1]+" time="+ new Date().getTime());
            shadowSys.addPack(codec.decodeMotion(e.data));
        }
    }

    //generate according to whohost
    base_generator.generateGraphics();
    if(message.whohost == "youhost"){
        world = base_generator.generatePhysics();
    }
}

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
        if(e.keyCode==70){
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
    })
}

/*
//-----------------------------------------------
function checkTURNServer(turnConfig, timeout){ 

    return new Promise(function(resolve, reject){
  
      setTimeout(function(){
          if(promiseResolved) return;
          resolve(false);
          promiseResolved = true;
      }, timeout || 5000);
  
      var promiseResolved = false
        , myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection   //compatibility for firefox and chrome
        , pc = new myPeerConnection({iceServers:[turnConfig]})
        , noop = function(){};
      pc.createDataChannel("");    //create a bogus data channel
      pc.createOffer(function(sdp){
        if(sdp.sdp.indexOf('typ relay') > -1){ // sometimes sdp contains the ice candidates...
          promiseResolved = true;
          resolve(true);
        }
        pc.setLocalDescription(sdp, noop, noop);
      }, noop);    // create offer and set local description
      pc.onicecandidate = function(ice){  //listen for candidate events
        if(promiseResolved || !ice || !ice.candidate || !ice.candidate.candidate || !(ice.candidate.candidate.indexOf('typ relay')>-1))  return;
        promiseResolved = true;
        resolve(true);
      };
    });   
  }

  checkTURNServer({
      urls: 'turn:118.25.102.41:3478',
      username: 'team2',
      credential: 'team2018'
  }).then(function(bool){
      console.log('is my TURN server active? ', bool? 'yes':'no');
  }).catch(console.error.bind(console));
*/
//globle
inputs = [[0,0,0,0],[0,0,0,0]];
var base_objects = [];
var peerConnection;
var dataChannel;
var whohost = null;
//
connection_manager.socketServer = "onescoop.info:443/Dodgem/play";
connection_manager.iceServers = [{urls: "stun:stun.xten.com"}, {urls: "stun:stun.sipgate.net:10000"},
    {urls: "stun:stun.freeswitch.org"}, {urls: "turn:118.25.102.41:3478", username:"team2", credential:"team2018"}];
base_generator.scene_div = document.getElementById("scene_div");
base_generator.render_scale = 16;
//basic description of the word
base_objects.push({x:0, y:0, width:20, height:20, angle:0, src:"point"}); //center point
base_objects.push({x:0, y:200, width:40, height:80, angle:180, src:"", tag:"car"}); //p1body
base_objects.push({x:0, y:-200, width:40, height:80, angle:0, src:"", tag:"car"}); //p2body
base_objects.push({x:-100, y:0, width:60, height:60, angle:0, src:"", tag:"box"}); //box
base_objects.push({x:100, y:0, width:22, height:500, angle:0, src:"", tag:"box"}); //box
base_objects.push({x:300, y:0, width:10, height:600, angle:0, src:"", tag:"fixed"}); //
base_objects.push({x:-300, y:0, width:10, height:600, angle:0, src:"", tag:"fixed"}); //
base_objects.push({x:0, y:300, width:10, height:600, angle:90, src:"", tag:"fixed"}); //
base_objects.push({x:0, y:-300, width:10, height:600, angle:90, src:"", tag:"fixed"}); //

connection_manager.startSocket();
connection_manager.setDistributionFunction("pairing success", function(message){
    prepareGame(message);
})

var timetick = function(deltaTime){
    if(whohost=="youhost") base_generator.fixedUpdate(deltaTime);
    intervalCount += deltaTime;
    if(intervalCount>=sendInterval){
        intervalCount-=sendInterval;
        peerConnectionSendFunc();
    }
};
var peerConnectionSendFunc = function(){};
setInterval("timetick(10/1000)", 10);
var intervalCount = 0;
var sendInterval = 0.02;

function render(){
    base_generator.render();
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
                connection_manager.dataChannel.send(codec.encodeMotion(base_objects));
            }
        }
        connection_manager.dataChannel.onmessage = function(e){
            //console.log("receive from p2p"+e.data);
            var t = e.data.split(":");
            console.log("receive pack: "+t[t.length-1]);
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
            console.log("receive from p2p"+ttt[ttt.length-1]+" time="+ new Date().getTime());
            codec.decodeMotion(base_objects, e.data);
        }
    }

    //generate according to whohost
    base_generator.generateGraphics();
    if(message.whohost == "youhost"){
        base_generator.generatePhysics();
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
//globle
inputs = [[0,0,0,0],[0,0,0,0]];
var base_objects = [];
var server_socket = new WebSocket("ws://50.2.39.53:8080/Dodgem/play");
var peerConnection;
var dataChannel;
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


base_generator.scene_div = document.getElementById("scene_div");
base_generator.render_scale = 16;
base_generator.generateGraphics();
base_generator.generatePhysics();

var timetick = function(dt){base_generator.fixedUpdate(dt)};
setInterval("timetick(10/1000)", 10);
var intervalCount = 0;
var sendInterval = 0.04;

function render(){
    base_generator.render();
    requestAnimationFrame(render);
}
requestAnimationFrame(render);

server_socket.onmessage = function(e){
    console.log("receive a message from server:"+e.data);
    if(e.data.charAt(0)!='{'){//this is an quick message
        if(e.data.charAt(0)==':'){
            codec.decodeMotion(base_objects, e.data);
        }
        else{
            codec.decodeInput(inputs[1], e.data);
        }
        return ;
    }
    var message = JSON.parse(e.data);
    if(message.tag == "pairing success"){
        prepareGame(message); return;
    }
}
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
    if(base_generator.scene_div.innerHTML!="")base_generator.destoryGraphics();
    if(base_generator.world)base_generator.destoryPhysics();
    base_objects = [];
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

    base_generator.generateGraphics();
    if(message.whohost == "youhost"){
        base_generator.generatePhysics();
        timetick = function(deltaTime){
            base_generator.fixedUpdate(deltaTime);
            intervalCount += deltaTime;
            if(intervalCount>=sendInterval){
                intervalCount-=sendInterval;
                server_socket.send(codec.encodeMotion(base_objects));
            }
        }
    }
    else{
        timetick = function(deltaTime){
            intervalCount += deltaTime;
            if(intervalCount>=sendInterval){
                intervalCount-=sendInterval;
                server_socket.send(codec.encodeInput(inputs[0]));
            }
        }
    }
}
//----------------------------------------------------------------------
/*
var ot = {iceServers: [{url: "stun:stun.freeswitch.org"}]};//{iceServers: [{url: "stun:stun.freeswitch.org"}]};
var pc = new RTCPeerConnection(ot);
var pcc = pc.createDataChannel("pc1c");
var pc2 = new RTCPeerConnection(ot);
var pc2c;

var promise = pc.createOffer({offerToReceiveAudio: false, offerToReceiveVideo: false, voiceActivityDetection: false});
var offer1, offer2;
promise.then(
    function(offer) {
        offer1 = offer;
        //console.log("offer1 created");
        promise = pc.setLocalDescription(offer);
        promise.then(function(){
            //console.log("pc1 local set");
            promise = pc2.setRemoteDescription(offer1);
            promise.then(function(){
                //console.log("pc2 remote set");
                promise = pc2.createAnswer({offerToReceiveAudio: false, offerToReceiveVideo: false, voiceActivityDetection: false});
                promise.then(function(offer){
                    offer2 = offer;
                    promise = pc2.setLocalDescription(offer2);
                    promise.then(function(){
                        promise = pc.setRemoteDescription(offer2);
                        promise.then(function(){
                            //console.log("offer signal finished");
                            signaldone();
                        })
                    })
                })
            });
        })
    }
);
pc.onicecandidate = function(e){
    if(!e.candidate)return;
    pc2.addIceCandidate(e.candidate).then(()=>console.log("candidate scc"));
    //console.log(JSON.stringify(e.candidate));
}
pc2.onicecandidate = function(e){
    if(!e.candidate)return;
    pc.addIceCandidate(e.candidate).then(()=>console.log("candidate scc"));
    //console.log(JSON.stringify(e.candidate));
}
pc2.ondatachannel = function(e){
    pc2c = e.channel;
    pc2c.onmessage = function(e){
        console.log("receive"+e.data);
    }
    pc2c.onopen = function(e){
        console.log("pc2c open!");
        console.log(pc2c.readyState);
    }
}
pcc.onopen = function(e){
    console.log("pc1c open!");
    console.log(pcc.readyState);
    pcc.send("hello");
}
pcc.onmessage = function(e){
    console.log("receive"+e.data);
}
pcc.onclose = function(e){
    console.log("pc1c close");
}
pcc.onerror = function(e){
    console.log("pc1c error");
}
pc.onconnectionstatechange = function(e){
    console.log("sss");
}
function signaldone(){
}*/
//------------------------------------------------------------
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
        }/*
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
        }*/
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
        }/*
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
        }*/
    })
}
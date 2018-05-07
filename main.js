//globle
inputs = [[0,0,0,0],[0,0,0,0]];
var base_objects = [];
var server_socket = new WebSocket("wss://onescoop.info:443/Dodgem/play");
var peerConnection;
var dataChannel;
var whohost = null;
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

server_socket.onmessage = function(e){
    console.log("receive a message from server:"+e.data);
    var message = e.data;
    if(e.data.charAt(0)!='{'){//this is an quick message
        if(e.data.charAt(0)=='>'){
            message = message.substring(1, message.length);
        }
        else if(e.data.charAt(0)==':'){
            codec.decodeMotion(base_objects, e.data);
            return;
        }
        else if(e.data.charAt(0)==';'){
            codec.decodeInput(inputs[1], e.data);
            return;
        }
    }
    message = JSON.parse(message);
    if(message.tag == "pairing success"){
        prepareGame(message); return;
    }
    else if(message.tag == "offer"){
        offerFunction(message); return;
    }
    else if(message.tag == "candidate"){
        candidateFunction(message); return;
    }
}
var offerFunction;
var candidateFunction;
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
    //rtc
    var ot = {iceServers: [{url: "stun:stun.freeswitch.org"}]};
    peerConnection = new RTCPeerConnection(ot);
    peerConnection.onicecandidate = function(e){
        if(!e.candidate)return ;
        server_socket.send(">"+JSON.stringify({tag: "candidate", candidate: e.candidate}));//send candidate to the other one
    }
    candidateFunction = function(message){
        peerConnection.addIceCandidate(message.candidate);
        console.log("got ice candidate: "+JSON.stringify(message.candidate));
    }
    if(whohost == "youhost"){
        var dataoption = {ordered: false, maxRetransmits: 0};//, protocol:"DCT_RTP"
        dataChannel = peerConnection.createDataChannel("gm", dataoption);
        peerConnection.createOffer({offerToReceiveAudio: false, offerToReceiveVideo: false, voiceActivityDetection: false})//pc1 create offer
        .then(function(offer){
            peerConnection.setLocalDescription(offer);
            server_socket.send(">"+JSON.stringify({tag: "offer", offer: offer}));//send offer to pc2
        });
        //offer response
        offerFunction = function(message){
            peerConnection.setRemoteDescription(message.offer);
            console.log("local signal tasks down");
        }
        //channel
        dataChannel.onopen = function(){
            console.log("channel open");
            peerConnectionSendFunc = function(){
                dataChannel.send(codec.encodeMotion(base_objects));
            }
            dataChannel.onerror = function(e){
                console.log("channel error");
                console.log(JSON.stringify(e));
            }
            dataChannel.onmessage = function(e){
                //console.log("receive from p2p"+e.data);
                var t = e.data.split(":");
                console.log("receive pack: "+t[t.length-1]);
                codec.decodeInput(inputs[1], e.data);
            }
            dataChannel.onclose = function(){
                peerConnectionSendFunc = function(){};
            }
        }
    }
    else{
        //offer response
        offerFunction = function(message){
            peerConnection.setRemoteDescription(message.offer);
            peerConnection.createAnswer({offerToReceiveAudio: false, offerToReceiveVideo: false, voiceActivityDetection: false})//pc2 create answer
            .then(function(offer){
                peerConnection.setLocalDescription(offer);
                console.log("local signal tasks down");
                server_socket.send(">"+JSON.stringify({tag: "offer", offer: offer}));//send offer to pc1
            });
        }
        //channel
        peerConnection.ondatachannel = function(e){
            dataChannel = e.channel;
            dataChannel.onopen = function(){
                console.log("channel open");
                peerConnectionSendFunc = function(){
                    dataChannel.send(codec.encodeInput(inputs[0]));
                }
            }
            dataChannel.onmessage = function(e){
                var ttt = e.data.split(":");
                console.log("receive from p2p"+ttt[ttt.length-1]+" time="+ new Date().getTime());
                codec.decodeMotion(base_objects, e.data);
            }
            dataChannel.onerror = function(e){
                console.log("channel error");
                console.log(JSON.stringify(e));
            }
            dataChannel.onclose = function(){
                peerConnectionSendFunc = function(){};
            }
        }
    }

    //generate according to whohost
    base_generator.generateGraphics();
    if(message.whohost == "youhost"){
        base_generator.generatePhysics();
    }
    else{
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

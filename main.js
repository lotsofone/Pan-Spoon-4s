
game.init();
//
connection_manager.socketServer = "onescoop.info:443/Dodgem/play";
connection_manager.iceServers = [{urls: "stun:stun.xten.com"}, {urls: "stun:stun.sipgate.net:10000"},
    {urls: "stun:stun.freeswitch.org"},
    {urls: "turn:118.25.102.41:3478?transport=tcp", username:"team2", credential:"team2018"},
    {urls: "turn:118.25.102.41:3478?transport=udp", username:"team2", credential:"team2018"},
    {urls: "turn:118.25.102.41:5349?transport=tcp", username:"team2", credential:"team2018"},
    {urls: "turn:118.25.102.41:5349?transport=udp", username:"team2", credential:"team2018"}];
//开启与服务器的连接
connection_manager.startSocket();
connection_manager.setDistributionFunction("pairing success", function(message){
    console.log(message.whohost);
    game.prepareGame(message);
})

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


//turn server test-----------------------------------------------
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
function m1(){
    checkTURNServer({
        urls: ['turn:118.25.102.41:3478?transport=tcp', 'turn:118.25.102.41:3478?transport=udp',
        'turn:118.25.102.41:5349?transport=tcp', 'turn:118.25.102.41:5349?transport=udp'],
        username: 'team2',
        credential: 'team2018'
    }).then(function(bool){
        console.log('is my TURN server active? ', bool? 'yes':'no');
    }).catch(console.error.bind(console));
}
function m2(){
    checkTURNServer({
        urls: 'turn:118.25.102.41:3478?transport=tcp',
        username: 'team2',
        credential: 'team2018'
    }).then(function(bool){
        console.log('is my TURN server active? 3478tcp', bool? 'yes':'no');
    }).catch(console.error.bind(console));
    checkTURNServer({
        urls: 'turn:118.25.102.41:3478?transport=udp',
        username: 'team2',
        credential: 'team2018'
    }).then(function(bool){
        console.log('is my TURN server active? 3478udp', bool? 'yes':'no');
    }).catch(console.error.bind(console));
    checkTURNServer({
        urls: 'turn:118.25.102.41:5349?transport=tcp',
        username: 'team2',
        credential: 'team2018'
    }).then(function(bool){
        console.log('is my TURN server active? 5349tcp', bool? 'yes':'no');
    }).catch(console.error.bind(console));
    checkTURNServer({
        urls: 'turn:118.25.102.41:5349?transport=udp',
        username: 'team2',
        credential: 'team2018'
    }).then(function(bool){
        console.log('is my TURN server active? 5349udp', bool? 'yes':'no');
    }).catch(console.error.bind(console));
}
//m1();
//m2();

game.init();
//设置服务器
connection_manager.socketServer = "onescoop.info:443/Dodgem/play";
connection_manager.iceServers = [{urls: "stun:stun.xten.com"}, {urls: "stun:stun.sipgate.net:10000"},
    {urls: "stun:stun.freeswitch.org"},
    {urls: "turn:118.25.102.41:3478?transport=tcp", username:"team2", credential:"team2018"},
    {urls: "turn:118.25.102.41:3478?transport=udp", username:"team2", credential:"team2018"},
    {urls: "turn:118.25.102.41:5349?transport=tcp", username:"team2", credential:"team2018"},
    {urls: "turn:118.25.102.41:5349?transport=udp", username:"team2", credential:"team2018"}];

    base_generator.imgPath = "images/";
//开启与服务器的连接
//connection_manager.startSocket();
//预备游戏
/*
connection_manager.setDistributionFunction("pairing success", function(message){
    console.log(message.whohost);
    let starter = message.whohost=="youhost";
    connection_manager.startPeerConnection(starter, dataChannel);
    game.prepareGame(message.whohost, connection_manager.dataChannel);
})*/
game.prepareGame("local");

/*
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
*/
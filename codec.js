var codec = {};
codec.encodeinput = function(input){
    var n = input[3]*8+input[2]*4+input[1]*2+input[0];
    return ";"+n.toString(16);
}

codec.decodeinput = function(input, msg){
    var n = parseInt(msg.charAt(1),16);
    input = [0,0,0,0];
    if(n>=8){n-=8; input[3]=1;}
    if(n>=4){n-=4; input[2]=1;}
    if(n>=2){n-=2; input[1]=1;}
    if(n>=1){n-=1; input[0]=1;}
}

codec.encodemotion = function(base_objects){
    var msg = "";
    for(var i=0; base_objects.length; i++){
        msg+=":"+base_objects[i].x.toString(36)+":"+base_objects[i].toString(36).y+":"+base_objects[i].angle.toString(36);
    }
    return msg;
}

codec.decodemotion = function(base_objects, msg){
    var lsts = msg.split(':');
    for(var i=0; i<base_objects.length; i++){
        base_objects[i].x = parseFloat(lsts[i*3],36);
        base_objects[i].y = parseFloat(lsts[i*3+1],36);
        base_objects[i].angle = parseFloat(lsts[i*3+2],36);
    }
}
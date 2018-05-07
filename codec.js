var codec = {};
codec.encodeInput = function(input){
    var n = input[3]*8+input[2]*4+input[1]*2+input[0];
    return ";"+n.toString(16);
}

codec.decodeInput = function(input, msg){
    var n = parseInt(msg.charAt(1),16);
    if(n>=8){n-=8; input[3]=1;}else{input[3]=0;}
    if(n>=4){n-=4; input[2]=1;}else{input[2]=0;}
    if(n>=2){n-=2; input[1]=1;}else{input[1]=0;}
    if(n>=1){n-=1; input[0]=1;}else{input[0]=0;}
}

codec.n = 0;
codec.encodeMotion = function(base_objects){
    var msg = "";
    var PI2 = Math.round(Math.PI*2*1296);
    for(var i=0; i<base_objects.length; i++){
        var object = base_objects[i];
        msg+=(":"+Math.round(object.x*1296).toString(36)+
        ":"+Math.round(object.y*1296).toString(36)+
        ":"+(Math.round((object.angle%(Math.PI*2)+Math.PI*2)*1296)%PI2).toString(36));
    }
    msg+=":n="+codec.n++;
    return msg;
}

codec.decodeMotion = function(base_objects, msg){
    var lsts = msg.split(':');
    for(var i=0; i<base_objects.length; i++){
        base_objects[i].x = parseInt(lsts[i*3+1],36)/1296;
        base_objects[i].y = parseInt(lsts[i*3+2],36)/1296;
        base_objects[i].angle = parseInt(lsts[i*3+3],36)/1296;
    }
}
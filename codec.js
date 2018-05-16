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
codec.encodeMotion = function(base_objects, tickStamp){
    var msg = "";
    for(var i=0; i<base_objects.length; i++){
        var object = base_objects[i];
        if(object.tag == "fixed")continue;
        msg+=(":"+Math.round(object.x*1296).toString(36)+
        ":"+Math.round(object.y*1296).toString(36)+
        ":"+Math.round(object.angle*1296).toString(36));
    }
    msg+="&"+tickStamp.toString(36);//tick stamp
    return msg;
}

codec.decodeMotion = function(base_objects, msg){
    let lsts = msg.split(/[:&]/);
    let bi; let mi=1;
    let positions = [];
    for(bi=0; bi<base_objects.length; bi++){
        if(base_objects[bi].tag=="fixed"){//fixed objects don't need physics update
            positions.push({});
        }
        else{
            let position = {};
            position.x = parseInt(lsts[mi++],36)/1296;
            position.y = parseInt(lsts[mi++],36)/1296;
            position.angle = parseInt(lsts[mi++],36)/1296;
            positions.push(position);
        }
    }
    positions.tickStamp = parseInt(lsts[mi++] ,36);
    positions.tag = "positions";
    return positions;
}
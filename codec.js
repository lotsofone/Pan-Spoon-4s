var codec = {};
codec.encodeInput = function(input, tickStamp){
    var n = input[3]*8+input[2]*4+input[1]*2+input[0];
    return ";"+n.toString(16)+";"+tickStamp.toString(36);
}

codec.decodeInput = function(msg){
    let input = [0,0,0,0];
    var n = parseInt(msg.charAt(1),16);
    if(n>=8){n-=8; input[3]=1;}
    if(n>=4){n-=4; input[2]=1;}
    if(n>=2){n-=2; input[1]=1;}
    if(n>=1){n-=1; input[0]=1;}
    input.tag = "input";
    input.tickStamp = parseInt(msg.split(';')[2], 36);
    return input;
}
codec.encodePack = function(pack){
    if(pack.tag=="positions"){
        return codec.encodeMotion(pack);
    }
    else if(pack.tag=="hpupdate"||pack.tag=="result"){
        return JSON.stringify(pack);
    }
    else{
        console.log("unable to encode pack with tag:"+pack.tag);
        return "null";
    }
}
codec.setMotionList = function(base_object){
    this.motionList = [];
    for(let i=0; i<base_object.length; i++){
        if(base_object[i].tag=="fixed"){
            this.motionList.push(false);
        }
        else{
            this.motionList.push(true);
        }
    }
}
codec.encodeMotion = function(positions){
    var msg = "";
    for(var i=0; i<positions.length; i++){
        var p = positions[i];
        if(p.x==null)continue;
        msg+=(":"+Math.round(p.x*1296).toString(36)+
        ":"+Math.round(p.y*1296).toString(36)+
        ":"+Math.round(p.angle*1296).toString(36));
    }
    msg+="&"+positions.tickStamp.toString(36);//tick stamp
    return msg;
}

codec.decodeMotion = function(msg){
    let lsts = msg.split(/[:&]/);
    let bi; let mi=1;
    let positions = [];
    for(bi=0; bi<this.motionList.length; bi++){
        if(this.motionList==false){//fixed objects don't need physics update
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
codec.decodeMessages = function(msg){
    let messages = msg.split('|');
    let r = [];
    for(let i=0; i<messages.length; i++){
        r.push(codec.decodeMessage(messages[i]));
    }
    return r;
}
codec.decodeMessage = function(msg){
    if(msg.charAt(0)==':'){
        return codec.decodeMotion(msg);
    }
    else if(msg.charAt(0)==';'){
        return codec.decodeInput(msg);
    }
    else if(msg.charAt(0)=='{'){
        return JSON.parse(msg);
    }
}
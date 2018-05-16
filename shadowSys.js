var shadowSys = {};

shadowSys.currentTickStamp = 0;
shadowSys.shadowQueue = [];

shadowSys.addPack = function(positions){
    shadowSys.shadowQueue.push(positions);
}
shadowSys.step = function(time){
    shadowSys.currentTickStamp += time;
}
/*Math.lerp1 = function(a,b,t){
    return b*t+a*(1-t);
}*/
shadowSys.computeCurrentPositions = function(){
    while(shadowSys.shadowQueue.length>=2){
        if(shadowSys.shadowQueue[0].tickStamp<shadowSys.currentTickStamp){
            shadowSys.shadowQueue.splice(0,1);
            continue;
        }
        else{
            break;
        }
    }
    return shadowSys.shadowQueue[0];
    /*
    while(shadowSys.shadowQueue.length>=2){//做插值运算，需要找到一个可以插值的区间，过早的包被丢弃
        if(shadowSys.shadowQueue[1].tickStamp<shadowSys.currentTickStamp){
            shadowSys.shadowQueue.splice(0,1);
            continue;
        }
        else{
            break;
        }
    }
    if(shadowSys.shadowQueue.length<=1){//包不够用，将出现卡顿
        return shadowSys.shadowQueue[0];
    }
    if(shadowSys.shadowQueue[1].tickStamp==shadowSys.currentTickStamp){
        return shadowSys.shadowQueue[1];
    }
    //否则成功取得可以插值的情况：  shadowQueue[0].tickStamp < currentTickStamp <= shadowQueue[1].tickStamp 的情况
    let positionst=[];
    positionst.tickStamp = shadowSys.currentTickStamp;
    let positions0 = shadowSys.shadowQueue[0]; let positions1 = shadowSys.shadowQueue[1];
    let t = (positionst.tickStamp-positions0.tickStamp)/
    (positions1.tickStamp-positions0.tickStamp);
    for(let i=0; i<positions0.length; i++){
        let pt = {};
        let p0 = positions0[i];
        let p1 = positions1[i];
        if(p0.x){
            pt.x = Math.lerp1(p0.x, p1.x, t);
            pt.y = Math.lerp1(p0.y, p1.y, t);
            pt.angle = Math.lerp1(p0.angle, p1.angle, t);
        }
        positionst.push(pt);
    }
    return positionst;
    */
}
shadowSys.getQueueTime = function(){
    if(shadowSys.shadowQueue[0]){
        return shadowSys.shadowQueue[shadowSys.shadowQueue.length-1].tickStamp - shadowSys.currentTickStamp;
    }
    return 0;
}
shadowSys.reset = function(){
    shadowSys.currentTickStamp = 0;
    shadowSys.shadowQueue = [];
}
shadowSys.init = function(base_objects){
    shadowSys.addPack(shadowSys.takePositions(base_objects, 0));
}
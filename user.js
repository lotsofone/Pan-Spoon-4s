var uname="";
function openadmin(){
	document.getElementById("win1").style.display="";
}
function closeadmin(){
	document.getElementById("win1").style.display="none";
}
function closesign(){
	document.getElementById("win2").style.display="none";
}
function opensignup(){
	document.getElementById("win2").style.display="";
}
function logres(){
	document.getElementById("win3").style.display="";	
}
function closelogres(){
	document.getElementById("win3").style.display="none";	
}


function loginForm(){ 
	  var ntip = checkName(); 
	  var ptip = checkPwd();
	  if(ntip&&ptip){
	  	 uname=document.getElementById('Name').value;
	  	var ename = document.getElementById('nerr'); 
		var upassword=document.getElementById('Password').value;
		var epassword=document.getElementById('perr');
		var lognname=document.getElementById('logname');
	 	 connection_manager.server_socket.send(JSON.stringify({tag:'login', username:uname, 
	 		 password:upassword}));
	 	 connection_manager.setDistributionFunction("success", function(msg){
			console.log(msg.tag);
			closeadmin();
			alert("登录成功");
			lognname.innerHTML=uname;
			connection_manager.setDistributionFunction("success", null);
			connection_manager.setDistributionFunction("notexist", null);
			connection_manager.setDistributionFunction("fail", null);
	 	 });
	 	 connection_manager.setDistributionFunction("notexist", function(msg){
			console.log(msg.tag);
			alert("用户不存在");
			connection_manager.setDistributionFunction("success", null);
			connection_manager.setDistributionFunction("notexist", null);
			connection_manager.setDistributionFunction("fail", null);
	 	 });
	 	 connection_manager.setDistributionFunction("fail", function(msg){
			console.log(msg.tag);
			alert("用户名与密码不匹配");
			connection_manager.setDistributionFunction("success", null);
			connection_manager.setDistributionFunction("notexist", null);
			connection_manager.setDistributionFunction("fail", null);
	 	 });
	 	 return ntip && ptip; 
	  }
//  return ntip && ptip; 
} 
	  
function checkName(){ 
	  var uname = document.getElementById('Name'); 
	  var ename = document.getElementById('nerr');  
	  if(uname.value.length == 0){ 
		ename.style.visibility="visible";
	    ename.innerHTML="用户名不能为空";
	    ename.className="error";
	    return false; 
	    } 
	  else{
		  ename.style.visibility="hidden";
		  return true;
	  }
	  }
	 
function checkPwd(){ 
	  var upassword = document.getElementById('Password'); 
	  var epassword = document.getElementById('perr'); 
	  if(upassword.value.length == 0){
		  	epassword.style.visibility="visible";
		    epassword.innerHTML="密码不能为空";
		    epassword.className="error";
		    return false; 
		    } 
	  else{
		  //alert("2");
		  epassword.style.visibility="hidden";
		  return true;
	  }
	  } 
	  
function checkForm(){ 
	  var nametip = checkUserName(); 
	  var passtip = checkPassword();  
	  var conpasstip = ConfirmPassword(); 
	  if(nametip && passtip && conpasstip){
		 	 alert("注册");
		 	var signmssg=document.getElementById("signmsg");
		  	var userName=document.getElementById('userName').value;
		  	var errname = document.getElementById('nameErr');
		  	//errname.innerHTML=userName;
			var userPassword=document.getElementById('userPassword').value;
			//alert(userPassword);
		 	connection_manager.server_socket.send(JSON.stringify({tag:'signup', username:userName, 
		 	 	password:userPassword}));
		 	connection_manager.setDistributionFunction("success", function(msg){
				console.log(msg.tag);
				 //显示成功---------------------------------
				closesign();
				alert("注册成功");
				connection_manager.setDistributionFunction("success", null);
				connection_manager.setDistributionFunction("fail", null);
			});
			connection_manager.setDistributionFunction("fail", function(msg){
				console.log(msg.tag);
				//显示失败-----------------------------------
				alert("注册失败");
			    connection_manager.setDistributionFunction("success", null);
			    connection_manager.setDistributionFunction("fail", null);
		   	});
		 	 return nametip && passtip && conpasstip;
		  }
	  } 
//注册	  
//验证用户名   
function checkUserName(){ 
	  var username = document.getElementById('userName'); 
	  var errname = document.getElementById('nameErr'); 
	  var pattern = /^\w{1,10}$/;  //用户名格式正则表达式：用户名少于10位 
	  if(username.value.length == 0){ 
	    errname.innerHTML="用户名不能为空";
	    errname.className="error";
	    return false; 
	    } 
	  if(!pattern.test(username.value)){ 
	    errname.innerHTML="用户名不合规范";
	    errname.className="error";
	    return false; 
	    } 
	   else{ 
	     errname.innerHTML="OK";
	     errname.className="success"; 
	     return true; 
	     } 
	  } 

//验证密码   
function checkPassword(){ 
	  var userPasswd = document.getElementById('userPassword'); 
	  var errPasswd = document.getElementById('passwordErr'); 
	  var pattern = /^\w{1,10}$/; //密码要在1-10位 
	  if(!pattern.test(userPasswd.value)){ 
	    errPasswd.innerHTML="密码不合规范";
	    errPasswd.className="error";
	    return false; 
	    } 
	   else{ 
	     errPasswd.innerHTML="OK"
	     errPasswd.className="success"; 
	     return true; 
	     } 
	  } 

//确认密码 
function ConfirmPassword(){ 
	  var userpasswd = document.getElementById('userPassword'); 
	  var userConPassword = document.getElementById('userConfirmPassword'); 
	  var errConPasswd = document.getElementById('conPasswordErr'); 
	  if((userpasswd.value)!=(userConPassword.value) || userConPassword.value.length == 0){ 
	    errConPasswd.innerHTML="密码不一致";
	    errConPasswd.className="error";
	    return false; 
	    } 
	   else{ 
	     errConPasswd.innerHTML="OK";
	     errConPasswd.className="success"; 
	     return true; 
	     }    
	} 

function ViewRank(){
	connection_manager.server_socket.send(JSON.stringify({tag:"requestrank"}));
	connection_manager.setDistributionFunction("ranklist", function(msg){
		document.getElementById("name1").innerHTML=msg.value[0].name;
		document.getElementById("lose1").innerHTML=msg.value[0].lose;
		document.getElementById("111").innerHTML=msg.value[0].win;
		document.getElementById("name2").innerHTML=msg.value[1].name;
		document.getElementById("lose2").innerHTML=msg.value[1].lose;
		document.getElementById("222").innerHTML=msg.value[1].win;
		document.getElementById("name3").innerHTML=msg.value[2].name;
		document.getElementById("lose3").innerHTML=msg.value[2].lose;
		document.getElementById("333").innerHTML=msg.value[2].win;
		connection_manager.setDistributionFunction("ranklist", null);
	});
}

function viewRecord(){
	connection_manager.server_socket.send(JSON.stringify({tag:"record"}));
	connection_manager.setDistributionFunction("self", function(msg){
		console.log(msg.tag);
		console.log(msg.value[0]);
		//alert("当前用户为："+uname);
		if(msg.value.length<1)return;
		document.getElementById("date1").innerHTML=msg.value[0].date;
	
		if(msg.value[0].win==1)
		{
			document.getElementById("res1").innerHTML=msg.value[0].host;
		}
		else if(msg.value[0].win==0)
		{
			document.getElementById("res1").innerHTML=msg.value[0].guest;
		}
		document.getElementById("pe1").innerHTML=msg.value[0].guest+"   VS   "+msg.value[0].host;

		connection_manager.setDistributionFunction("ranklist", null);
	});
}

async function startMatch(){
	if(game.whohost=="youhost"||game.whohost=="hehost"||game.whohost=="local"){
		document.getElementById("game_status").innerHTML = "进行在线游戏之前必须停止正在进行的游戏";
		return;
	}
	else if(game.whohost=="youhoststopped"||game.whohost=="hehoststopped"||game.whohost=="localstopped"){
		game.endGame();
	}

	try{
		await connection_manager.server_socket.send(JSON.stringify({tag:"match"}));
	}
	catch(reason){
		document.getElementById("game_status").innerHTML = "暂未连接上服务器，请等待几秒后重试";
		return;
	}
	document.getElementById("game_status").innerHTML = "匹配中";
	connection_manager.setDistributionFunction("pairing success", function(msg){
		connection_manager.setDistributionFunction("pairing success", null);
		document.getElementById("game_status").innerHTML = "建立连接";
		tryp2p(msg);
	});
}
function tryp2p(msg){
	connection_manager.startPeerConnection(msg.whohost=="youhost");
	connection_manager.dataChannel.onopen = function(){
		game.prepareGame(msg.whohost, connection_manager.dataChannel);
		document.getElementById("game_status").innerHTML = "";
		console.log("channel open");
		connection_manager.peerConnection.oniceconnectionstatechange = function(){
			console.log("peerConnection iceConnectionState "+connection_manager.peerConnection.iceConnectionState);
			if(connection_manager.peerConnection.iceConnectionState=="disconnected"){
				document.getElementById("game_status").innerHTML = "连接已中断";
			}
			connection_manager.peerConnection.oniceconnectionstatechange = function(){};
		}
	}
	connection_manager.dataChannel.onerror = function(e){
		game.stopGame();
		console.log("channel error:"+JSON.stringify(e));
	}
	connection_manager.dataChannel.onclose = function(){
		game.stopGame();
		console.log("channel closed");
	}
	//retry
	connection_manager.peerConnection.oniceconnectionstatechange = function(){
		console.log("peerConnection iceConnectionState "+connection_manager.peerConnection.iceConnectionState);
		if(connection_manager.peerConnection.iceConnectionState=="failed"){
			console.log("retrying");
			document.getElementById("game_status").innerHTML = "正在重试连接";
			connection_manager.closePeerConnection();
			tryp2p();
		}
	}
}
function closeMatch(){
	connection_manager.setDistributionFunction("pairing success", null);
	document.getElementById("game_status").innerHTML = "游戏已结束";
	if(game.whohost==null){
		return;
	}
	game.endGame();
	if(connection_manager.peerConnection!=null){
		connection_manager.closePeerConnection();
	}
}
function addgetmsg(){
	connection_manager.setDistributionFunction("chat", function(msg){
		document.getElementById("chattext").innerHTML+='<p>'+(msg.username==""?"游客":msg.username)+": "+msg.text+'</p>';
	});
}
function sendmsg(){
	chatmsg=document.getElementById("textsend").value;
	//alert(sendmsg);
	document.getElementById("chattext").innerHTML+='<p>'+(uname==""?"(你)":unsme)+": "+chatmsg+'</p>';
	document.getElementById("textsend").value = "";
	connection_manager.server_socket.send(">"+JSON.stringify({tag:'chat', username:uname, text:chatmsg}));
}
function startLocal(){
	connection_manager.setDistributionFunction("pairing success", null);
	if(game.whohost=="local"||game.whohost=="localstopped"){
		game.endGame();
	}
	game.prepareGame("local");
	document.getElementById("game_status").innerHTML = "本地游戏中";
}
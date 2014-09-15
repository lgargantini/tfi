var sending = false,
response,
positions,
msgAjaxBtn,
lastMsgDate,
upAjaxBtn,
user,
check,
initDate, lastDate,
messages,
initialized = false;
//log
consoleLog = document.getElementById("box");
//CURSOR AJAX
document.getElementById('enableCursorAjax').onclick = doFollow;
document.getElementById('disableCursorAjax').onclick = doDisable;
//MSG AJAX
msgAjax = document.getElementById('msgAjax');
document.getElementById('sendMsgAjax').onclick = doMsg;

check = document.getElementById('getMsg');
document.getElementById('getMsg').onchange = getValues;

//UPLOAD AJAX
upAjaxBtn = document.getElementById('UploadButtonHttp');
upAjaxBtn.onclick = doUpload;

function loginUser () {
	user = prompt('What is your name?');
	lastMsgDate = Date.now();
}

function doMsg() {

	if( msgAjax.value != undefined){
		
		if(!user){
			loginUser();		
		}

		var m = msgAjax.value+'&usr='+user+'&date='+Date.now();
		httpRequest('POST','/msg', m);

		msgAjax.value='';
		msgAjax.focus();
		doLatency('latency-msg');
	}
}

function getValues () {
	console.log(check.value);
	if(check.value != undefined){
	setInterval(function () {
				
				httpRequest('GET','/msg','messageGet');
				httpRequest('GET','/position','positionGet');

				}, 1000); 
	}
}

function doUpload () {
	doLatency('latency-up');
}

function doLatency (type) {
	
	initDate = new Date();
	response = httpRequest('POST','/latency', null);
	if(response != undefined){
		lastDate = new Date();
		document.getElementById(type).innerHTML = lastDate - initDate;
	}
}

function httpRequest (form, theUrl, msgUrl) {
	var xmlHttp = null;
	console.log(theUrl);

	xmlHttp = new XMLHttpRequest();
	xmlHttp.open( form, theUrl, true );
	
	if(msgUrl != null){

		xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xmlHttp.onreadystatechange=function(){

		  if (xmlHttp.readyState==4 && xmlHttp.status==200) {

		    if(xmlHttp.responseText != undefined){
		    	parseResp(JSON.parse(xmlHttp.response), msgUrl);
			}

		  }

	  	}
	}
	xmlHttp.send( 'msg='+msgUrl );

}
function parseResp (obj,msg) {
	//console.log(msg);
	switch(msg){
		case 'messageGet':
			parseMsg(obj);
			break;
		case 'positionGet':
			parsePos(obj);
			break;
		default:
			break;
	}
}

function parseMsg (obj) {
	console.log(obj);
	for(id in obj){
		if(obj[id].date >= lastMsgDate){
			var p = logToConsole('<span class="bg-primary">'+obj[id].usr+': ' + obj[id].msg+'</span>');
   				p.className = 'bg-primary';
		}
	}
	//update lastMsgDate
	lastMsgDate = Date.now();
}				

function parsePos (obj) {
	console.log(obj);
	for(var id in obj){
		onMove(id, obj[id]);
	}
}

function doFollow () {

	$(document).mousemove(function (ev) {
	//check position
	//first time
	if(!user){
		loginUser();
	}

	initDate = new Date();
	response = $.post('/position', { x: ev.clientX, y: ev.clientY , usr: user},
									function(){
		if(response.responseText != undefined){
			positions = JSON.parse(response.responseText);
			lastDate = new Date();
			document.getElementById('latency-cur').innerHTML = lastDate - initDate;
			/*
			for(var id in positions){
				onMove(id,positions[id]);
			}*/
		}
	});
});

}

function doDisable () {
	$(document).unbind('mousemove');
	document.getElementById('latency-cur').innerHTML = '';
	$.post('/logout');
}

function onMove (id,pos) {


	var cursor = document.getElementById('cursor-'+id);
	if(!cursor){
		cursor = document.createElement('span');
		cursor.id = 'cursor-'+id;
      //cursor.src = '/cursor.png';
      cursor.className = 'glyphicon glyphicon-hand-up';
      cursor.style.position = 'absolute';
      document.body.appendChild(cursor);
  	}

  cursor.style.left = pos.x + 'px';
  cursor.style.top = pos.y + 'px';
}

//LOG SECTION
function logToConsole(message){

  var tr = document.createElement('tr');
  var td = document.createElement("td");
  var p = document.createElement('p');
  
  p.innerHTML = message;
  td.appendChild(p);
  tr.appendChild(td);
  consoleLog.appendChild(tr);

  while (consoleLog.childNodes.length > 50){

    consoleLog.removeChild(consoleLog.firstChild);

  }

  consoleLog.scrollTop = consoleLog.scrollHeight;

  return p;
}
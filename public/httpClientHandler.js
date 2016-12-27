'use strict';
//var sending = false,
var response;
var positions;
var lastMsgDate;
var user;
var msgAjax;
var check;

//log
var consoleLog = document.getElementById('box');

//CURSOR AJAX
document.getElementById('enableCursorAjax').onclick = doFollow;
document.getElementById('disableCursorAjax').onclick = doDisable;

//MSG AJAX
msgAjax = document.getElementById('msgAjax');
document.getElementById('sendMsgAjax').onclick = doMsg;

check = document.getElementById('getMsg');
check.onchange = getValues;

function loginUser () {
	user = prompt('What is your name?');
	lastMsgDate = Date.now();
}

function doMsg() {

	if( msgAjax.value !== undefined){
		
		if(!user){ loginUser(); }

		var m = msgAjax.value+'&usr='+user+'&date='+Date.now();
		httpRequest('POST','/msg', m);

		msgAjax.value='';
		msgAjax.focus();
		httpRequest('GET','/latency','latency-msg');
		if(!check.value){
			getValues();
		}
	}
}

function getValues () {
	
	console.log('Check every :'+check.value+' ms');
	var tm = check.value ? check.value : 1000
	if(check.value !== undefined){
		setInterval(function () {
				httpRequest('GET','/msg','messageGet');
				httpRequest('GET','/position','positionGet');
				}, tm); 
	}
}

function httpRequest (verb, theUrl, msgUrl) {

	var xmlHttp;
	var initDate = new Date();
	console.log(theUrl);
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open( verb, theUrl, true );
	var parseVar;
	if(msgUrl !== null){

		xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		xmlHttp.onreadystatechange = function(){

		  if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {

		    if(	xmlHttp.responseText !== undefined && 
		    	xmlHttp.responseText !== ''&& 
		    	xmlHttp.responseText !== "{}"){	
			    	console.log('got answer xmlHttp'+xmlHttp.response);			    	
			    	parseResp(JSON.parse(xmlHttp.response), theUrl);
			    	
			    	if(theUrl === '/latency' && verb === 'GET' && typeof msgUrl !== 'undefined'){
				    	var lastDate = new Date();
				    	var lat = lastDate - initDate;
			    		
			    		document.getElementById(msgUrl).innerHTML = lat;
			    		var l = msgUrl+'&lat='+lat+'&usr='+user+'&date='+Date.now();
			    		httpRequest('POST', '/latency', l);
			    	}
			}

		  }

	  	};
	}	
	xmlHttp.send( 'msg='+msgUrl );
	 
}

function parseResp (obj, msg) {

	console.log('estoy en parseResp y tengo'+msg);
	
	switch(msg){

		case '/msg':
			parseMsg(obj);
			break;
		case '/latency':
			console.log('latency on parseResp');
			break;
		case '/position':
			parsePos(obj);
			break;
		default:
			break;
	
	}

}

function parseMsg (obj) {
	
	console.log(obj);

	for(var id in obj){
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

	var initDate = new Date();
	response = $.post('/position', { x: ev.clientX, y: ev.clientY , usr: user},
									function(){
		if(response.responseText !== undefined){
			positions = JSON.parse(response.responseText);
			var lastDate = new Date();
			var lat = lastDate - initDate;
			document.getElementById('latency-cur').innerHTML = lat;
			$.post('/latency', { type:'latency-cur', usr: user, msg: lat, date: Date.now()}, function () {
				console.log('latency posted!');
			});
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
  var td = document.createElement('td');
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
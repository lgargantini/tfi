var sending = false,
response,
positions,
msgAjaxBtn,
messages,
upAjaxBtn,
initDate, lastDate,
initialized = false;
//CURSOR AJAX
document.getElementById('enableCursorAjax').onclick = doFollow;
document.getElementById('disableCursorAjax').onclick = doDisable;
//MSG AJAX
document.getElementById('sendMsgAjax').onclick = doMsg;
msgAjax = document.getElementById('msgAjax');
//UPLOAD AJAX
upAjaxBtn = document.getElementById('UploadButtonHttp');
upAjaxBtn.onclick = doUpload;


function doMsg() {

	if( msgAjax.value != undefined){
		response = httpPost('/msg', msgAjax.value);
		if(response != undefined){
			
			console.log(response);
		}

		msgAjax.value='';
		msgAjax.focus();
		doLatency('latency-msg');
	}
}

function doUpload () {
	doLatency('latency-up');
}

function doLatency (type) {
	
	initDate = new Date();
	response = httpPost('/latency', null);
	if(response != undefined){
		lastDate = new Date();
		document.getElementById(type).innerHTML = lastDate - initDate;
	}
}

function httpPost(theUrl, msg){
	var xmlHttp = null, 
	responseXml = null;

	xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "POST", theUrl, true );
	
	if(msg != null){
		msg = 'msg='+msg;
		xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlHttp.onreadystatechange=function(){

	  if (xmlHttp.readyState==4 && xmlHttp.status==200) {
	    responseXml = xmlHttp.responseText;
	    console.log(xmlHttp.responseText);
	  }

  	}
  	
	}

	xmlHttp.send( msg );

	return responseXml;

}

function doFollow () {

	$(document).mousemove(function (ev) {
	//check position
	//first time
	initDate = new Date();
	response = $.post('/position',{x:ev.clientX, y:ev.clientY}, function(){
		if(response.responseText != undefined){
			positions = JSON.parse(response.responseText);
			lastDate = new Date();
			document.getElementById('latency-cur').innerHTML = lastDate - initDate;
			for(var id in positions){
				onMove(id,positions[id]);
			}
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

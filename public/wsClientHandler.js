'use strict';
var wsUri;
var consoleLog;
var connectBut;
var disconnectBut;
var sendMessage;
var sendBut;
var cursor;
var cursorDisable;
var socket;
var selectedFile;
var initUp;
var lastUp;
var initPos;
var lastPos;
var socket;
var FReader;
var user;
var connect;

function start(){

  //EVENTS HANDLERS!!!

  wsUri = document.getElementById('wsUri');

  connectBut = document.getElementById('connect');
  connectBut.onclick = doConnect;

  disconnectBut = document.getElementById('disconnect');
  disconnectBut.onclick = doDisconnect;

  //MSG 
  sendMessage = document.getElementById('msg');
  sendMessage.onblur = doSend;

  sendBut = document.getElementById('sendMsgWs');
  sendBut.onclick = doSend;


  //LOG
  consoleLog = document.getElementById('box');

  //CURSOR WS
  cursor = document.getElementById('enableCursorWs');
  cursor.onclick = doCursor;

  cursorDisable = document.getElementById('disableCursorWs');
  cursorDisable.onclick = doDisableCursor;

  setGuiConnected(false);
    
}

  function doConnect(){

    if (!window.WebSocket){
      logToConsole('<span style="color: red;"><strong>Error:</strong> This browser does not have support for WebSocket</span>');
      return;
    }
    // prefer text messages
    var uri = wsUri.value;

    if (uri.indexOf('?') == -1) {
      uri += '?encoding=text';
    } else {
      uri += '&encoding=text';
    }
    //connect to server!
    logToConsole('Log in ....');
    socket = io.connect(uri);
    
    onOpen();

  }

  function doDisconnect(){

    socket.emit('close');
    logToConsole('DISCONNECTED');
    setGuiConnected(false);

  }
  
//MSG SECTION
function doSend(){
  if(sendMessage.value == ""){
    return false;
  }
  var p = logToConsole(sendMessage.value);
  //timestamp
  var initMessage = Date.now();
  p.className = 'bg-warning';

  socket.emit('message', {'msg': sendMessage.value , 'date': initMessage}, function (status) {

    var lastMessage = Date.now();
    p.className = status;
    var lat = lastMessage - initMessage;
    document.getElementById('latency-msg').innerHTML = lat;
    socket.emit('latency', {'test':'latency-msg' ,'lat':lat, 'date': Date.now(), 'usr': user});
  });
  //clean fields
  sendMessage.value = '';
  sendMessage.focus();
  return false;

}

//CURSOR SECTION

function doCursor () {

  if(connect){ document.addEventListener('mousemove',doMove,false); }

}

function doMove(ev) {

    initPos = new Date();
    socket.emit('position', {'x': ev.clientX, 'y': ev.clientY}, function (status) {
    lastPos = Date.now();
    document.getElementById('latency-cur').className = status;
    var lat = lastPos - initPos;
    document.getElementById('latency-cur').innerHTML = lat;
    socket.emit('latency', {'test':'latency-cur', 'lat': lat, 'date': Date.now(), 'usr': user});
    });

}

function doDisableCursor () {

  if(connect){
    document.removeEventListener('mousemove',doMove,false);
    document.getElementById('latency-cur').innerHTML = '';
  }

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

function onOpen(){

  user = prompt('What is your name?');
  connect = true;

  if(user === '' || user === null){
    onError('bad user');
    doDisconnect();
    return false;
  }

  logToConsole('Connected');
  
    //listeners!!!
    socket.on('error', function (evt) { onError(evt);  });
    socket.on('close', function (id) { onClose(id);  });
    socket.on('message', onMessage );
    socket.on('latency', onLatency );
    socket.on('done', function (file){ onDone(file); });
    socket.on('moreData', function  (data) { onMoreData(data); });
    socket.on('announcement',function (msg) {   onAnnouncement(msg);  });
    socket.on('position',function (positions) { onPositions(positions);  });
    socket.on('join', function (evt) { logToConsole(evt);  });
    
    socket.emit('join',user);
    setGuiConnected(true);

  }

function onLatency (from, message) {
  if(from != user){
    console.log('new latency -> usr :'+from+" -> "+message.msg);
  }
}
  
function onClose(id){
  //should erase every cursor
  var cursor = document.getElementById('cursor-'+id);
  document.body.removeChild(cursor);
  doDisconnect();

}

function onMessage(from, message){

  if(from != user){
    var p = logToConsole('<span class="bg-primary">'+from+': ' + message.msg+'</span>');
    p.className = 'bg-primary';
  }
}

function onPositions (positions) {
  var i = 0;

  try{

    for(var id in positions){
      i++;
      onMove(i,positions[id]);
    }

  }catch(e){

    console.log(e);
  }

}

function onMove (id,pos) {
  console.log('cursor'+id);
  var cursor = document.getElementById('cursor-'+id);

  if(!cursor){

    cursor = document.createElement('span');
    cursor.id = 'cursor-'+id;
    cursor.className = 'glyphicon glyphicon-hand-up';
    cursor.style.position = 'absolute';
    document.body.appendChild(cursor);

  }

  cursor.style.left = pos.x + 'px';
  cursor.style.top = pos.y + 'px';

}

function onError(evt){

  logToConsole('<span style="color: red;">ERROR:</span> ' + evt);

}



function onAnnouncement (msg) {

  logToConsole(msg);

}


function setGuiConnected(isConnected){

  var labelColor = 'black';
  wsUri.disabled = isConnected;
  connectBut.disabled = isConnected;

  disconnectBut.disabled = !isConnected;
  sendMessage.disabled = !isConnected;
  sendBut.disabled = !isConnected;
  enableCursorWs.disabled = !isConnected;
  disableCursorWs.disabled = !isConnected;

  //disable Ajax-http test
  document.getElementById('enableCursorAjax').disabled = isConnected;
  document.getElementById('disableCursorAjax').disabled = isConnected;
  document.getElementById('msgAjax').disabled = isConnected;
  document.getElementById('sendMsgAjax').disabled = isConnected;
  document.getElementById('getMsg').disabled = isConnected;

  if (isConnected){ labelColor = '#999999'; }

}

window.addEventListener('load', start, false);
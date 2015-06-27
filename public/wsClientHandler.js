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

//These are the relevant HTML5 objects that we are going to use 
    if(window.File && window.FileReader){
      document.getElementById('UploadButtonWs').addEventListener('click', StartUpload);  
      document.getElementById('FileBox').addEventListener('change', FileChosen);
    }else{
      document.getElementById('UploadAreaWs').innerHTML = 'Your Browser Doesnt Support The File API Please Update Your Browser';
    }

  }

  function doConnect(){

    if (window.MozWebSocket){
      logToConsole('<span style="color: red;"><strong>Info:</strong> This browser supports WebSocket using the MozWebSocket constructor</span>');
      window.WebSocket = window.MozWebSocket;
    }

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

function onDone (file) {

  logToConsole('Video :'+file.name+' Successfully Uploaded !!');
  var lat = lastUp - initUp;
  document.getElementById('latency-up').innerHTML = lat;
  socket.emit('latency', {'test': 'latency-up' ,'lat': lat, 'date': Date.now(), 'usr': user});
  var Content = '<button type="button" name="Upload" id="Restart" class="btn btn-success">Upload Another</button>';
  document.getElementById('UploadAreaWs').innerHTML = Content;
  document.getElementById('Restart').addEventListener('click', Refresh);
  document.getElementById('Restart').style.left = '20px';

}

function onAnnouncement (msg) {

  logToConsole(msg);

}


function setGuiConnected(isConnected){

  var labelColor = 'black';
  wsUri.disabled = isConnected;
  connectBut.disabled = isConnected;

  UploadButtonWs.disabled = !isConnected;
  FileBox.disabled = !isConnected;
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
  document.getElementById('UploadButtonHttp').disabled = isConnected;
  document.getElementById('UploadFileHttp').disabled = isConnected;
  document.getElementById('getMsg').disabled = isConnected;


  if (isConnected){ labelColor = '#999999'; }

}

  //UPLOAD SECTION
function FileChosen(evnt) {

    selectedFile = evnt.target.files[0];

}

function StartUpload(){
 
    if(document.getElementById('FileBox').value !== ''){
        FReader = new FileReader();
        initUp = Date.now();
        var content = '<div id="ProgressContainer"><div id="ProgressBar"></div></div><span id="percent">0%</span>';
        content += '<span id="Uploaded"> - <span id="MB">0</span>/' + Math.round(selectedFile.size / 1048576) + 'MB</span>';
        document.getElementById('UploadAreaWs').innerHTML = content;
        //onload chunk of data, set name
        FReader.onload = function(evnt){
          socket.emit('upload', { 'name' : selectedFile.name, data : evnt.target.result },function (status) {
            lastUp = Date.now();
            document.getElementById('latency-up').className = status;
            var lat = lastUp - initUp;
            document.getElementById('latency-up').innerHTML = lat;
            socket.emit('latency', {'test':'latency-up','lat': lat, 'date': Date.now(), 'usr': user});

          });
        };
      //only execute at start
      socket.emit('start', { 'name' : selectedFile.name, 'size' : selectedFile.size });
    
    }else{
      alert('Please Select A File');
    }
  }

function onMoreData(data){
    updateBar(data.percent);
    //The Next Blocks Starting Position
    var place = data.place * 524288; 
    var newFile; //The Variable that will hold the new Block of Data

    //chunk current file
    if(selectedFile.slice){
      newFile = selectedFile.slice(place, place + Math.min(524288, (selectedFile.size-place)));
    }else if (selectedFile.webkitSlice){
      newFile = selectedFile.webkitSlice(place, place + Math.min(524288, (selectedFile.size-place)));
    }else if(selectedFile.mozSlice){
      newFile = selectedFile.mozSlice(place, place + Math.min(524288, (selectedFile.size-place)));
    }else{
      throw new Error('falla slice!!');
    }
    FReader.readAsBinaryString(newFile);
}

function updateBar(percent){
    document.getElementById('ProgressBar').style.width = percent + '%';
    document.getElementById('percent').innerHTML = (Math.round(percent*100)/100) + '%';
    var MBDone = Math.round(((percent/100.0) * selectedFile.size) / 1048576);
    document.getElementById('MB').innerHTML = MBDone;
}

function Refresh(){
    location.reload(true);
}

window.addEventListener('load', start, false);
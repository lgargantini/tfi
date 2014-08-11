var wsUri,
    consoleLog,
    connectBut,
    disconnectBut,
    sendMessage,
    sendBut,
    initMessage, lastMessage,
    initPos, lastPos,
    initUp,lastUp,
    selectedFile,
    socket,
    FReader,
    connect = false,
    Name,
    user,
    initialized;

function start(){

//EVENTS HANDLERS!!!

wsUri = document.getElementById("wsUri");
 connectBut = document.getElementById("connect");
 connectBut.onclick = doConnect;

 disconnectBut = document.getElementById("disconnect");
 disconnectBut.onclick = doDisconnect;
//MSG 
 sendMessage = document.getElementById('msg');
 
 sendBut = document.getElementById("sendMsgWs");
 sendBut.onclick = doSend;
//LOG
 consoleLog = document.getElementById("box");
//CURSOR WS
 cursor = document.getElementById('enableCursorWs');
 cursor.onclick = doCursor;

 cursorDisable = document.getElementById('disableCursorWs');
 cursorDisable.onclick = doDisableCursor;

    setGuiConnected(false);

    if(window.File && window.FileReader){ //These are the relevant HTML5 objects that we are going to use 
      document.getElementById('UploadButtonWs').addEventListener('click', StartUpload);  
      document.getElementById('FileBox').addEventListener('change', FileChosen);
    }else{
      document.getElementById('UploadAreaWs').innerHTML = "Your Browser Doesn't Support The File API Please Update Your Browser";
    }
/*
//***Extracted from example ***
    if (window.WebSocket)
    {
      document.getElementById("webSocketSupp").style.display = "block";
    }
    else
    {
      document.getElementById("noWebSocketSupp").style.display = "block";
    }

    secureCb = document.getElementById("secureCb");
    secureCb.checked = false;
    secureCb.onclick = toggleTls;
    secureCbLabel = document.getElementById("secureCbLabel")
    */

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
    if (uri.indexOf("?") == -1) {
      uri += "?encoding=text";
    } else {
      uri += "&encoding=text";
    }
    //connect to server!
    logToConsole("Log in ....");
    socket = io.connect(uri);
    onOpen();

}

function doDisconnect(){

    socket.emit('close');
    logToConsole("DISCONNECTED");
    setGuiConnected(false);

}
//MSG SECTION

function doSend(){
    
  var p = logToConsole(sendMessage.value);
  //record timestamp
  initMessage = Date.now();
  console.log('init'+initMessage);
  p.className = 'bg-warning';

  socket.emit('message', {'msg': sendMessage.value}, function (status) {
    lastMessage = Date.now();
    console.log('last'+lastMessage);
    p.className = status;
    document.getElementById('latency-msg').innerHTML = lastMessage - initMessage;
  });
  //clean field
  sendMessage.value = '';
  sendMessage.focus();
  return false;
}

//CURSOR SECTION

function doCursor () {
  
  if(connect){

    document.addEventListener('mousemove',doMove,false);

  }

}

function doMove(ev) {

      initPos = new Date();
      socket.emit('position', {'x': ev.clientX, 'y': ev.clientY}, function (status) {
        lastPos = Date.now();
        document.getElementById('latency-cur').className = status;
        document.getElementById('latency-cur').innerHTML = lastPos - initPos;
      
      });
}

function doDisableCursor () {
  
  if(connect){
    
    document.removeEventListener('mousemove',doMove,false);
    document.getElementById('latency-cur').innerHTML = '';
    //$(document).unbind('onmousemove');
  }

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

function onOpen(){

  user = prompt('What is your name?');
  connect = true;

  if(user === '' || user == null){
    onError('bad user');
    doDisconnect();
    return false;
  }

  logToConsole('Connected');
  
    //listeners!!!
  
    socket.on('error', function (evt) { onError(evt);  });
    socket.on('close', function (id) { onClose(id);  });
    socket.on('message', onMessage );
    socket.on('done', function (file){ onDone(file); });
    socket.on('moreData', function  (data) { onMoreData(data); });
    socket.on('announcement',function (msg) {   onAnnouncement(msg);  });
    socket.on('position',function (positions) { onPositions(positions);  });
    socket.on('join', function (evt) { logToConsole(evt);  });
    
   socket.emit('join',user);
   setGuiConnected(true);

  }


  
  function onClose(id){
//should erase every cursor
   var cursor = document.getElementById('cursor-'+id);
   document.body.removeChild(cursor);

  }

  function onMessage(from, msg){

    if(from != user){
      var p = logToConsole('<span class="bg-primary">'+from+': ' + msg.msg+'</span>');
      p.className = 'bg-primary';
    }
  }
  
  function onPositions (positions) {
  var i;

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

    logToConsole('Video '+file.name+' Successfully Uploaded !!"');
    document.getElementById('latency-up').innerHTML = lastUp - initUp;
    var Content = "<button type='button' name='Upload' id='Restart' class='btn btn-success'>Upload Another</button>";
    document.getElementById('UploadAreaWs').innerHTML = Content;
    document.getElementById('Restart').addEventListener('click', Refresh);
    document.getElementById('Restart').style.left = '20px';

    }

    function onAnnouncement (msg) {
      logToConsole(msg);
    }
    

function setGuiConnected(isConnected){

  wsUri.disabled = isConnected;
  connectBut.disabled = isConnected;

  disconnectBut.disabled = !isConnected;
  sendMessage.disabled = !isConnected;
  sendBut.disabled = !isConnected;

  //  secureCb.disabled = isConnected;
  
  var labelColor = "black";
  
  if (isConnected){
    labelColor = "#999999";
  }
   //  secureCbLabel.style.color = labelColor;
}

/*
//extracted from example
 function clearLog(){

  while (consoleLog.childNodes.length > 0){

   consoleLog.removeChild(consoleLog.lastChild);

  }

}

  function getSecureTag()
  {
    if (secureCb.checked)
    {
      return '<img src="img/tls-lock.png" width="6px" height="9px"> ';
    }
    else
    {
      return '';
    }
  }
  */

  //UPLOAD SECTION
  function FileChosen(evnt) {
    selectedFile = evnt.target.files[0];
  }

  function StartUpload(){
    if(document.getElementById('FileBox').value != ""){
      FReader = new FileReader();
      initUp = Date.now();

     // Name = document.getElementById('NameBox').value;
     var content = '<div id="ProgressContainer"><div id="ProgressBar"></div></div><span id="percent">0%</span>';
     content += "<span id='Uploaded'> - <span id='MB'>0</span>/" + Math.round(selectedFile.size / 1048576) + "MB</span>";
     document.getElementById('UploadAreaWs').innerHTML = content;
      //onload chunk of data, set name
      FReader.onload = function(evnt){
        console.log(evnt);
        socket.emit('upload', { 'name' : selectedFile.name, data : evnt.target.result },function (status) {
          lastUp = Date.now();
          document.getElementById('latency-up').className = status;
          document.getElementById('latency-up').innerHTML = lastUp - initUp;
        });
      }
      //only execute at start
      socket.emit('start', { 'name' : selectedFile.name, 'size' : selectedFile.size });
    }else{
      alert("Please Select A File");
    }
  }

  function onMoreData(data){
    updateBar(data['percent']);
    //The Next Blocks Starting Position
    var place = data['place'] * 524288; 
    var newFile; //The Variable that will hold the new Block of Data

    //chunk current file
    if(selectedFile.slice){
      newFile = selectedFile.slice(place, place + Math.min(524288, (selectedFile.size-place)));
    }else if (selectedFile.webkitSlice){
      newFile = selectedFile.webkitSlice(place, place + Math.min(524288, (selectedFile.size-place)));
    }else if(selectedFile.mozSlice){
      newFile = selectedFile.mozSlice(place, place + Math.min(524288, (selectedFile.size-place)));
    }else{
      throw new Error("falla slice!!");
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

window.addEventListener("load", start, false);

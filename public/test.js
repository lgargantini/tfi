
  //var secureCb;
  //var secureCbLabel;
    //var clearLogBut;
  var wsUri,
    consoleLog,
    connectBut,
    disconnectBut,
    sendMessage,
    sendBut,
    lastMessage,
    lastPos,
    initUp,lastUp,
    selectedFile,
    socket,
    FReader,
    connect = false,
    Name,
    user,
    initialized;

function echoHandlePageLoad(){
//TRIGGERS!!!
wsUri = document.getElementById("wsUri");
 //   toggleTls();
 connectBut = document.getElementById("connect");
 connectBut.onclick = doConnect;
 disconnectBut = document.getElementById("disconnect");
 disconnectBut.onclick = doDisconnect;

 sendMessage = document.getElementById('msg');
 sendBut = document.getElementById("send");
 sendBut.onclick = doSend;

 consoleLog = document.getElementById("box");

 cursor = document.getElementById('cursor');
 cursor.onclick = doCursor;

 cursorDisable = document.getElementById('disableWs');
 cursorDisable.onclick = doDisableCursor;
    //clearLogBut = document.getElementById("clearLogBut");
    //clearLogBut.onclick = clearLog;

    setGuiConnected(false);

    document.getElementById("disconnect").onclick = doDisconnect;
    document.getElementById("send").onclick = doSend;

    if(window.File && window.FileReader){ //These are the relevant HTML5 objects that we are going to use 
      document.getElementById('UploadButton').addEventListener('click', StartUpload);  
      document.getElementById('FileBox').addEventListener('change', FileChosen);
    }
    else
    {
      document.getElementById('UploadArea').innerHTML = "Your Browser Doesn't Support The File API Please Update Your Browser";
    }
/*    if (window.WebSocket)
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
/*
  function toggleTls()
  {
    var wsPort = (window.location.port.toString() === "" ? "" : ":"+window.location.port)
    if (wsUri.value === "") {
        wsUri.value = "ws://" + window.location.hostname.replace("www", "echo") + wsPort;
    }
    if (secureCb.checked)
    {
      wsUri.value = wsUri.value.replace("ws:", "wss:");
    }
    else
    {
      wsUri.value = wsUri.value.replace ("wss:", "ws:");
    }
  }
  */

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

function doSend(){
    
  var p = logToConsole(sendMessage.value);
  //record timestamp
  lastMessage = new Date();
  
  socket.emit('message', {'msg': sendMessage.value}, function (date) {
    p.className = 'bg-success';
    //console.log(date);
    //p.title = date;
    document.getElementById('latency-msg').innerHTML = date - lastMessage;
  });

  sendMessage.value = '';
  sendMessage.focus();
  return false;
}
function doCursor () {
  
  if(connect){
    document.onmousemove = function (ev) {
      lastPos = new Date();
      socket.emit('position', {'x': ev.clientX, 'y': ev.clientY}, function (date) {
        document.getElementById('latency-cur').innerHTML = date - lastPos;
      });
    }
  }

}
function doDisableCursor () {
  
  if(connect)
    $(document).unbind('mousemove');

}

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
    return;
  }

  logToConsole('Connected');
  
    //listeners!!!
  
    socket.on('error', function (evt) { onError(evt);  });
    socket.on('close', function (id) { onClose(id);  });
    socket.on('message', onMessage );
    socket.on('done', function (file){ onDone(file); });
    socket.on('moreData', function  (data) { onMoreData(data); });
    socket.on('announcement',function (msg) {   onAnnouncement(msg);  });
    socket.on('position',function (positions) {
  
    //first time
  
    var obj = JSON.parse(positions);

      for(var id in obj){
          onMove(id,obj[id]);
       }
   
   });
   
   socket.on('join', function (evt) { logToConsole(evt);  });
    
   socket.emit('join',user);
   
   setGuiConnected(true);

  }

  function onClose(id){

   var cursor = document.getElementById('cursor-'+id);
   document.body.removeChild(cursor);

  }

 function onMessage(from, msg){

    if(from != user){
      var p = logToConsole('<span class="bg-primary">'+from+': ' + msg.msg+'</span>');
      p.className = 'bg-primary';
    }
  }

  function onMove (id,pos) {
    
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
    document.getElementById('UploadArea').innerHTML = Content;
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
 function clearLog(){

  while (consoleLog.childNodes.length > 0){

   consoleLog.removeChild(consoleLog.lastChild);

  }

}

/*  function getSecureTag()
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

  //chose file
  function FileChosen(evnt) {
    selectedFile = evnt.target.files[0];
  }
  //begin upload handle
  function StartUpload(){
    if(document.getElementById('FileBox').value != ""){
      FReader = new FileReader();
      initUp = new Date();

     // Name = document.getElementById('NameBox').value;
     var content = '<div id="ProgressContainer"><div id="ProgressBar"></div></div><span id="percent">0%</span>';
     content += "<span id='Uploaded'> - <span id='MB'>0</span>/" + Math.round(selectedFile.size / 1048576) + "MB</span>";
     document.getElementById('UploadArea').innerHTML = content;
      //onload chunk of data, set name
      FReader.onload = function(evnt){
        console.log(evnt);
        socket.emit('upload', { 'name' : selectedFile.name, data : evnt.target.result },function (date) {
          lastUp = date;
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
//Something on ws!!!!


window.addEventListener("load", echoHandlePageLoad, false);

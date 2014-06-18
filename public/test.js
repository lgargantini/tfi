
  //var secureCb;
  //var secureCbLabel;
  var wsUri;
  var consoleLog;
  var connectBut;
  var disconnectBut;
  var sendMessage;
  var sendBut;
  var lastMessage;
  //var clearLogBut;
  var SelectedFile;
  var socket;
  var FReader;
  var Name;

  function echoHandlePageLoad()
  {
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

   // clearLogBut = document.getElementById("clearLogBut");
   // clearLogBut.onclick = clearLog;

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

  function doConnect()
  {
    if (window.MozWebSocket)
    {
      logToConsole('<span style="color: red;"><strong>Info:</strong> This browser supports WebSocket using the MozWebSocket constructor</span>');
      window.WebSocket = window.MozWebSocket;
    }
    else if (!window.WebSocket)
    {
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
    socket = io.connect(uri);
    onOpen();
    socket.on('error', function (evt) { onError(evt);  });
    socket.on('close', function (evt) { onClose(evt);  });
    socket.on('message', function (data) { onMessage(data);  });
    socket.on('Done', function (data){ onDone(data,uri); });
    socket.on('MoreData', function  (data) { onMoreData(data); });
  }

  function doDisconnect()
  {
    socket.close()
  }

  function doSend()
  {
    logToConsole("SENT: " + sendMessage.value);
  // record the timestamp
  lastMessage =+ +new Date;
  socket.emit('message', {'msg': sendMessage.value});
  //socket.emit('Upload', { 'Name' : Name, Data : evnt.target.result });
    //websocket.send(sendMessage.value);
  }

  function logToConsole(message)
  {
    var pre = document.createElement("p");
    pre.innerHTML = message;
    consoleLog.appendChild(pre);

    while (consoleLog.childNodes.length > 50)
    {
      consoleLog.removeChild(consoleLog.firstChild);
    }
    
    consoleLog.scrollTop = consoleLog.scrollHeight;
  }
  
  function onOpen()
  {
    logToConsole("CONNECTED");
    setGuiConnected(true);
  }
  
  function onClose(evt)
  {
    logToConsole("DISCONNECTED");
    setGuiConnected(false);
  }
  
  function onMessage(evt)
  {
    console.log(evt);
    logToConsole('<span style="color: blue;">RESPONSE: ' + evt.msg+'</span>');
     // we got echo back, measure latency
     document.getElementById('latency').innerHTML = new Date - lastMessage;
   }

   function onError(evt)
   {
    logToConsole('<span style="color: red;">ERROR:</span> ' + evt.data);
  }
  function onDone (data,Path) {
    var Content = "Video Successfully Uploaded !!"
    Content += "<img id='Thumb' src='" + Path + data['Image'] + "' alt='" + Name + "'><br>";
    Content += "<button type='button' name='Upload' value='' id='Restart' class='Button'>Upload Another</button>";
    document.getElementById('UploadArea').innerHTML = Content;
    document.getElementById('Restart').addEventListener('click', Refresh);
    document.getElementById('UploadBox').style.width = '270px';
    document.getElementById('UploadBox').style.height = '270px';
    document.getElementById('UploadBox').style.textAlign = 'center';
    document.getElementById('Restart').style.left = '20px';
    
  }
  function setGuiConnected(isConnected)
  {
    wsUri.disabled = isConnected;
    connectBut.disabled = isConnected;
    disconnectBut.disabled = !isConnected;
    sendMessage.disabled = !isConnected;
    sendBut.disabled = !isConnected;
  //  secureCb.disabled = isConnected;
  var labelColor = "black";
  if (isConnected)
  {
    labelColor = "#999999";
  }
   //  secureCbLabel.style.color = labelColor;
 }
 function clearLog()
 {
  while (consoleLog.childNodes.length > 0)
  {
   consoleLog.removeChild(consoleLog.lastChild);
 }
}

/*	function getSecureTag()
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
  function FileChosen(evnt) {
    SelectedFile = evnt.target.files[0];
    document.getElementById('NameBox').value = SelectedFile.name;
  }


  function StartUpload(){
    if(document.getElementById('FileBox').value != "")
    {
      FReader = new FileReader();
      Name = document.getElementById('NameBox').value;
      var Content = "<span id='NameArea'>Uploading " + SelectedFile.name + " as " + Name + "</span>";
      Content += '<div id="ProgressContainer"><div id="ProgressBar"></div></div><span id="percent">0%</span>';
      Content += "<span id='Uploaded'> - <span id='MB'>0</span>/" + Math.round(SelectedFile.size / 1048576) + "MB</span>";
      document.getElementById('UploadArea').innerHTML = Content;
      FReader.onload = function(evnt){
        socket.emit('Upload', { 'Name' : Name, Data : evnt.target.result });
      }
      socket.emit('Start', { 'Name' : Name, 'Size' : SelectedFile.size });
    }
    else
    {
      alert("Please Select A File");
    }
  }



  function onMoreData(data){
    UpdateBar(data['Percent']);
        var Place = data['Place'] * 524288; //The Next Blocks Starting Position
        var NewFile; //The Variable that will hold the new Block of Data
        if(SelectedFile.slice){
          NewFile = SelectedFile.slice(Place, Place + Math.min(524288, (SelectedFile.size-Place)));
        }else if (SelectedFile.webkitSlice){
          NewFile = SelectedFile.webkitSlice(Place, Place + Math.min(524288, (SelectedFile.size-Place)));
        }else if(SelectedFile.mozSlice){
          NewFile = SelectedFile.mozSlice(Place, Place + Math.min(524288, (SelectedFile.size-Place)));
        }else{
          throw new Error("falla!!");
        }
        FReader.readAsBinaryString(NewFile);
      }

      function UpdateBar(percent){
        document.getElementById('ProgressBar').style.width = percent + '%';
        document.getElementById('percent').innerHTML = (Math.round(percent*100)/100) + '%';
        var MBDone = Math.round(((percent/100.0) * SelectedFile.size) / 1048576);
        document.getElementById('MB').innerHTML = MBDone;
      }


      function Refresh(){
        location.reload(true);
      }

      window.addEventListener("load", echoHandlePageLoad, false);

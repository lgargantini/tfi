var sending = false,
	response,
	positions,
	initialized = false;
document.getElementById('ajax').onclick = doFollow;
function doFollow () {

$(document).mousemove(function (ev) {
	//check position
	//first time
	response = $.post('/position',{x:ev.clientX, y:ev.clientY}, function(){
		if(response.responseText != undefined){
			positions = JSON.parse(response.responseText);
			for(var id in positions){
				onMove(id,positions[id]);
			}
		}
	});
});

}

document.getElementById('disableAjax').onclick = doDisable;
function doDisable () {
	$(document).unbind('mousemove');
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


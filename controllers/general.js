module.exports = function (positions) {

var general = {

	index:function(req,res) {
		if(req.secure){
			var stream = res.push('httpClientHandler.js',{
		    	status:200,
		    	method:'GET',
		    	request:{
		    		accept:'*/*'
		    	},
		    	response:{
		    		'content-type':'application/javascript'
		    	}
		    });
		    stream.end('alert("hello from push stream!");');
	    }
	    console.log('/ get');
	    res.render('index');
	},
	clear:function  (req,res) {
	    console.log('/clear');
	    delete positions[req.body.usr];
	    delete req.session;
	},
	push:function (req,res) {
		if(req.secure){
			var stream = res.push('/httpClientHandler.js',{
		    	status:200,
		    	method:'GET',
		    	request:{
		    		accept:'*/*'
		    	},
		    	response:{
		    		'content-type':'application/javascript'
		    	}
		    });
		    stream.on('error',function () {
		    	
		    });
		    stream.end('alert("hello from push stream!");');
		}
	    res.render('index');
	}
};

return general;
}
module.exports = function (positions) {

var general = {

	index:function(req,res) {
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
	},
	css:function (req,res) {
		res.render('css');
	},
	multicss:function (req,res) {
		res.render('multicss');
	},
	images:function (req,res) {
		res.render('images');
	}
};

return general;
}
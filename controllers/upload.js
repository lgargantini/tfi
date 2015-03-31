module.exports = function (files) {

var formidable = require('formidable');

	var upload = {
		get: function  (req,res,next) {
			if(req.session.id){
				res.send(files);
			}
		},
		post:function  (req,res,next) {
		    console.log('/ post');
		    var form = new formidable.IncomingForm();
		    form.parse(req,function () {
		    res.redirect('/');
		    });
		    form.on('progress', function(bytesReceived, bytesExpected) {
		          var progress = {
		            type: 'progress',
		            bytesReceived: bytesReceived,
		            bytesExpected: bytesExpected
		          };
		    });

		}
   
	}

	return upload;
}
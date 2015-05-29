module.exports = function (positions) {

var general = {

	index:function(req,res) {
	    console.log('/ get');
	    res.render('/index.html');
	},
	clear:function  (req,res,next) {
	    console.log('/clear');
	    delete positions[req.body.usr];
	    delete req.session;
	}
};

return general;
}
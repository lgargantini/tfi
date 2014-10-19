module.exports = function (positions) {

	var position = {

	get:function (req,res,next) {
    if(req.session.id){
    	//console.log(positions);
        res.send(positions);
    }
    next();
	},
	post:function (req,res,next) {
   // console.log('/position');
    res.set('Content-type','text/plain');
    positions[req.body.usr] = req.body;
    res.send(positions);
	}
	

	}
	return position;
}
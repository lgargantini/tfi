module.exports = function (latencies) {


	var latency = {

		get:function (req,res,next) {
		    //just for latency
		    console.log('/latency get');
		    res.send({"msg":"latency"});
		},
		post:function (req,res,next) {
		    //just for latency
		    console.log('/latency post');
		    if(req.session.id){
		    	var date = req.body.date;

		    	var l = {
		    		date: date,
		    		usr: req.body.usr,
		    		lat: req.body.msg
		    	};

		    	latencies[date] = l;
		    	res.send(latencies);
		    }
		},
		latencyAll: function (req,  res, next) {
			console.log('latencyAll');
			if(req.session.id){
				res.send(latencies);
			}
		}
	}
	return latency;
}
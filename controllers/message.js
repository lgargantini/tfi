module.exports = function (messages) {


	var message = {

		get:function (req,res,next) {
		    if(req.session.id){

		        res.send(messages);

		    }
		},
		post:function (req,res,next) {
		    //get msg from user
		    console.log('/msg');

		    if(req.session.id){
		    
		    var date = req.body.date;
		    
		    var m = {
		        date: date,
		        usr: req.body.usr,
		        msg: req.body.msg
		    };

		    messages[date] = m;

		    res.send(messages);
		    }
		        
		}
		
	}
	return message;
}
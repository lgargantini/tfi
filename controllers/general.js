module.exports = function (positions) {

var general = {

index:function(req,res) {
    console.log('/ get');
    res.render('/index.html');
},
latency:function (req,res,next) {
    //just for latency
    console.log('/latency');
    res.status(200).end();
},
logout:function  (req,res,next) {
    console.log('/logout');
    delete positions[req.body.usr];
    delete req.session;
}


};

return general;
}
var config   = require('config');
var util     = require('util');
var twitter  = require('twitter');
var lib      = require('./lib');

var client = new twitter({
    consumer_key: config.get('twitter.ConsumerKey'),
    consumer_secret: config.get('twitter.ConsumerSecret'),
    access_token_key: config.get('twitter.AccessTokenKey'),
    access_token_secret: config.get('twitter.AccessTokenSecret')
});

var params = {
    q: "NHK",
    lang: "ja",
    count: 2
}
client.get('search/tweets', params, function(err, tweets, response){
    //if(!err){ console.log(tweets) }
    //console.log(tweets);
    tweets.statuses.forEach(function(status){
    //    console.log({
    //        created_at: status.created_at,
    //        text: status.text,
    //        user_name: status.user.name,
    //        user_id: status.user.id_str
    //    });
        var x = lib.textToObj(status.text, "dic");
        //console.log(util.inspect(x, {depth:null}));
        var total = 0;
        for(var prop in x){
            total += x[prop].subtotal;
        }
        console.log(util.format('id:%s, pn:%d, text:%s', status.user.id_str, total, status.text));
        console.log(' *breakdown');
        console.log(util.inspect(x, {depth:null}));
    });


});
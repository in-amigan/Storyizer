const 
	PORT_INT = 81;
var 
	express = require("express"),
	body_parser = require("body-parser"),
	cors = require("cors"),
	app = express(),
	mw = require("./libs/mw.js");
app.use(cors());
app.use(body_parser.json());
app.use(body_parser.urlencoded({
    extended: true
}));
app.post("/get_random_word/:grammar_str", [mw.ensureRequestIsSane, mw.checkForMaintenance, mw.getRandomWord], returnOK);
app.listen(PORT_INT, function(){
	console.log("Started app on port " + PORT_INT);
});
function returnOK(req, res){
	var return_me = {
		msg_str: "success",
		random_word_arr: req.random_word_arr,
		grammar_str: req.grammar_upper_str.toLowerCase()
	};
	res.status(200).send(JSON.stringify(return_me));
}

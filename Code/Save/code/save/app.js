const 
	PORT_INT = 82;
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
app.post("/save_paragraph", [mw.ensureRequestIsSane, mw.saveParagraph], returnOK);
app.listen(PORT_INT, function(){
	console.log("Started app on port " + PORT_INT);
});
function returnOK(req, res){
	var return_me = {
		msg_str: "saved"
	};
	res.status(200).send(JSON.stringify(return_me));
}

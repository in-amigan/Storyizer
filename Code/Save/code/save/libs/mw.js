var dynamo_mw = require("./dynamo_mw.js");
var mw = (function(){
	function ensureRequestIsSane(req, res, next){
		if(req.body && req.body.paragraph_html_str){
			
			//*****VALIDATE FOR XSS*****
			// @TODO
			//check 400k

			if(req.body.paragraph_html_str.length < 500){
				next();
			}else{
				return res.status(412).send({
					msg_str: "That paragraph is too large to save"
				});
			}
		}else{
			return res.status(412).send({
				msg_str: "You need to pass in a paragraph"
			});
		}
		
	}
	function saveParagraph(req, res, next){
		dynamo_mw.saveNewItem(req.body.paragraph_html_str, function(err_str, _data_to_ignore){
			if(err_str){
				//use a better status code!
				res.status(400).send({
					msg_str: err_str
				});
			}else{
				console.log("Saved item in Dynamo");
				next();
			}
		});
	}
	return {
		ensureRequestIsSane,
		saveParagraph
	}
})();
module.exports = mw;
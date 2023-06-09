var mw = (function(){
	const
		VERB_API_UNDER_MAINTENANCE  = false,
		NOUN_API_UNDER_MAINTENANCE  = false,
		ADJECTIVE_API_UNDER_MAINTENANCE  = false,
		WORDS = require("../words.json");
	
	function checkForMaintenance(req, res, next){
		if(req.params.grammar_str === "verb" && VERB_API_UNDER_MAINTENANCE === true){
			return res.status(503).send({
				msg_str: "The verb api is currently under maintenance"
			});
		}
		if(req.params.grammar_str === "noun" && NOUN_API_UNDER_MAINTENANCE === true){
			return res.status(503).send({
				msg_str: "The noun api is currently under maintenance"
			});
		}
		if(req.params.grammar_str === "adjective" && ADJECTIVE_API_UNDER_MAINTENANCE === true){
			return res.status(503).send({
				msg_str: "The adjective api is currently under maintenance"
			});
		}
		next();
	}
	function ensureRequestIsSane(req, res, next){
		if(req.params && req.params.grammar_str){
			var grammar_upper_str = req.params.grammar_str.toUpperCase();
			if(Object.keys(WORDS).indexOf(grammar_upper_str + "_ARR") !== -1){
				if(req.body && req.body[grammar_upper_str.toLowerCase() + "_count_int"]){
					req.grammar_upper_str = grammar_upper_str;
					req.word_count_int = Number(req.body[req.grammar_upper_str.toLowerCase() + "_count_int"]);
					if(req.word_count_int < WORDS[req.grammar_upper_str + "_ARR"].length){
						next();
					}else{
						return res.status(412).send({
							msg_str: "Too many " + grammar_upper_str.toUpperCase() + "'s passed"
						});
					}
				}else{
					return res.status(412).send({
						msg_str: "You need to pass in a " + grammar_upper_str.toUpperCase() + " count"
					});
				}
			}else{
				return res.status(412).send({
					msg_str: "You need to request either a verb, noun or adjective"
				});
			}
		}else{
			return res.status(412).send({
				msg_str: "You need to pass the grammar choice"
			});
		}
	}
	function getRandomWord(req, res, next){
		var construct_arr = [],
			word_str = "",
			random_int = 0,
			temp_word_arr =  WORDS[req.grammar_upper_str + "_ARR"].slice(0);
		for(var i_int = 0; i_int < req.word_count_int; i_int += 1){
			random_int = Math.floor(Math.random() * temp_word_arr.length);
			word_str = temp_word_arr.splice(random_int, 1);
			construct_arr.push(word_str[0]);
		}
		req.random_word_arr = construct_arr;
		next();
	}
	return {
		checkForMaintenance,
		ensureRequestIsSane,
		getRandomWord
	}
})();
module.exports = mw;

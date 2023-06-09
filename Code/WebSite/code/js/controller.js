var controller = (function(){
	function createStateMachine(pass_me){
		window.model.state_machine = pass_me; //replace and rebuild
		window.model.current_recalled_proxy = new Proxy(window.model.state_machine, model.proxyResponseHandler);
	}
	function hitUpToThreeMicroServices(noun_count_int, verb_count_int, adjective_count_int){
		var pass_me = {};
		if(noun_count_int > 0){
			submitNounForm(noun_count_int);
			pass_me.noun_received_boo = false;
		}
		if(verb_count_int > 0){
			submitVerbForm(verb_count_int);
			pass_me.verb_received_boo = false;
		}
		if(adjective_count_int > 0){
			submitAdjectiveForm(adjective_count_int);
			pass_me.adjective_received_boo = false;
		}
		window.controller.createStateMachine(pass_me);
	}
	function _ensureValidEntry(html_str, cb){
		//validate length and scripts etc
		var re_noun = new RegExp("\\*noun\\*","gi"),
			re_verb = new RegExp("\\*verb\\*","gi"),
			re_adjective = new RegExp("\\*adjective\\*","gi"),
			count_int = 3,
			msg_str = "You need at least one verb, noun or adjective";

		if(html_str.match(re_noun) === null){
			--count_int;
		}
		if(html_str.match(re_verb) === null){
			--count_int;
		}
		if(html_str.match(re_adjective) === null){
			--count_int;
		}
		if(count_int > 0){
			cb(null, html_str);
		}else{
			cb(msg_str, null);
		}
	}
	function _ensureValidSaveEntry(html_str, cb){
		//validate all html no **
		var re_noun = new RegExp("\\*noun\\*","gi"),
			re_verb = new RegExp("\\*verb\\*","gi"),
			re_adjective = new RegExp("\\*re_adjective\\*","gi"),
			count_int = 3,
			msg_str = "This form has placeholders, you cannot save with placeholders";

		if(html_str.match(re_noun) === null){
			--count_int;
		}
		if(html_str.match(re_verb) === null){
			--count_int;
		}
		if(html_str.match(re_adjective) === null){
			--count_int;
		}
		if(count_int === 0){
			cb(null, html_str);
		}else{
			cb(msg_str, null);
		}
	}
	function handleNounSuccess(response_str){
		var response = JSON.parse(response_str)
		window.view.replaceNouns(response.random_word_arr);
		window.model.current_recalled_proxy.noun_received_boo = true;
	}
	function handleNounFailure(response){
		var msg_str = "Problem with the noun server";
		//use catch here instead
		if(response.status === 503 && response.responseText && JSON.parse(response.responseText).msg_str){
			//keep app working without adjective
			msg_str = JSON.parse(response.responseText).msg_str;
			window.view.showAllFailingWords("noun");
		}else{
			window.view.flash(msg_str);;
		}
	}
	function handleVerbSuccess(response_str){
		var response = JSON.parse(response_str)
		window.view.replaceVerbs(response.random_word_arr);
		window.model.current_recalled_proxy.verb_received_boo = true;
	}
	function handleVerbFailure(response){
		var msg_str = "Problem with the verb server";
		//use catch here instead
		if(response.status === 503 && response.responseText && JSON.parse(response.responseText).msg_str){
			//keep app working without adjective
			msg_str = JSON.parse(response.responseText).msg_str;
			window.view.showAllFailingWords("verb");
		}else{
			window.view.flash(msg_str);;
		}
	}
	function handleAdjectiveSuccess(response_str){
		var response = JSON.parse(response_str)
		window.view.replaceAdjectives(response.random_word_arr);
		window.model.current_recalled_proxy.adjective_received_boo = true;
	}
	function handleAdjectiveFailure(response){
		var msg_str = "Problem with the adjective server";
		//use catch here instead
		if(response.status === 503 && response.responseText && JSON.parse(response.responseText).msg_str){
			//keep app working without adjective
			msg_str = JSON.parse(response.responseText).msg_str;
			window.view.showAllFailingWords("adjective");
		}else{
			window.view.flash(msg_str);;
		}
	}
	function prepareFormForSave(){
		var html_str = "",
			unchecked_html_str = $("[data-textarea_input]").html();
		window.view.disableSubmission();
		_ensureValidSaveEntry(unchecked_html_str, function(err_str, html_str){
			if(err_str){
				window.view.flash(err_str);
				return;
			}
			// window.view.showSaving();
			console.log("Ready to do save");
			_submitSaveParagraph(html_str);
		});
	}
	function prepareFormForSubmission(){
		var html_str = "",
			unchecked_html_str = $("[data-textarea_input]").html();
		window.view.disableSubmission();
		_ensureValidEntry(unchecked_html_str, function(err_str, html_str){
			if(err_str){
				window.view.flash(err_str);
				return;
			}
			window.view.prepareTextArea(html_str);
			console.log("Ready to do AJAX");
			// _submitForm();
		});
	}
	function submitNounForm(noun_count_int){
		console.log("submitting noun form");
		var params = {
			"noun_count_int": noun_count_int
		};
		$.post(API_URL_STR + "noun", params)
				.done(handleNounSuccess)
				.fail(handleNounFailure);
		//pretend this worked
		// if(mock_boo === true){
		// 	var mock_arr = ["tree", "book", "cup", "table", "xbox"].slice(0, noun_count_int),
		// 		mock_arr_str = JSON.stringify(mock_arr);
		// 		response_str = '{"msg_str": "Here is your mock noun API","noun_arr": ' + mock_arr_str + '}';
		// 	handleNounSuccess(response_str);
		// }else{
		// 	//params would get X number of nouns back
		// 	alert("not set up for real noun API yet");
		// 	//hit real noun API
		// 	// $.post(API_URL_STR, params)
		// 		// .done(handleNounSuccess)
		// 		// .fail(handleNounFailure);
		// }
	}
	function submitVerbForm(verb_count_int){
		console.log("submitting verb form");
		var params = {
			"verb_count_int": verb_count_int
		};
		$.post(API_URL_STR + "verb", params)
				.done(handleVerbSuccess)
				.fail(handleVerbFailure);
		
		//pretend this worked
		// if(mock_boo === true){
		// 	var mock_arr = ["jump", "dance", "sing", "walk", "talk"].slice(0, verb_count_int),
		// 		mock_arr_str = JSON.stringify(mock_arr);
		// 		response_str = '{"msg_str": "Here is your mock verb API","verb_arr": ' + mock_arr_str + '}';
		// 	handleVerbSuccess(response_str);
		// }else{
		// 	//params would get X number of nouns back
		// 	alert("not set up for real verb API yet");
		// 	//hit real noun API
		// 	// $.post(API_URL_STR, params)
		// 		// .done(handleVerbSuccess)
		// 		// .fail(handleVerbFailure);
		// }
	}
	function submitAdjectiveForm(adjective_count_int){
	
		console.log("submitting adjective form");
		//pretend this worked
		var params = {
			"adjective_count_int": adjective_count_int
		};
		$.post(API_URL_STR + "adjective", params)
				.done(handleAdjectiveSuccess)
				.fail(handleAdjectiveFailure);
		// if(mock_boo === true){
		// 	var mock_arr = ["excellent", "amazing", "wonderful", "terrible", "wicked"].slice(0, adjective_count_int),
		// 		mock_arr_str = JSON.stringify(mock_arr);
		// 		response_str = '{"msg_str": "Here is your mock adjective API","adjective_arr": ' + mock_arr_str + '}';
		// 	handleAdjectiveSuccess(response_str);
		// }else{
		// 	//params would get X number of nouns back
		// 	alert("not set up for real adjective API yet");
		// 	//hit real noun API
		// 	// $.post(API_URL_STR, params)
		// 		// .done(handleAdjectiveuccess)
		// 		// .fail(handleAdjectiveFailure);
		// }
	}
	function handleSaveParagraphSuccess(response){
		window.view.flash(JSON.parse(response).msg_str);
		// debugger;
	}
	function handleSaveParagraphFailure(response){
		console.dir(response);
		var msg_str = "Problem with the save server";
		window.view.flash(msg_str);
	}
	function _submitSaveParagraph(html_str){
		//save with the mark tags for clearer display later
		//keep divs ansd brs too.
		console.info("submit save");
		var params = {
			"paragraph_html_str": html_str
		};
		$.post(SAVE_API_URL_STR, params)
				.done(handleSaveParagraphSuccess)
				.fail(handleSaveParagraphFailure);
	}
	return {
		createStateMachine: createStateMachine,
		hitUpToThreeMicroServices: hitUpToThreeMicroServices,
		handleNounSuccess: handleNounSuccess,
		handleNounFailure: handleNounFailure,
		handleVerbSuccess: handleVerbSuccess,
		handleVerbFailure: handleVerbFailure,
		handleAdjectiveSuccess: handleAdjectiveSuccess,
		handleAdjectiveFailure: handleAdjectiveFailure,
		handleSaveParagraphSuccess: handleSaveParagraphSuccess,
		handleSaveParagraphFailure: handleSaveParagraphFailure,
		prepareFormForSave: prepareFormForSave,
		prepareFormForSubmission: prepareFormForSubmission
	}
})();

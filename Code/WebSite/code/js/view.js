var view = (function(){
	function dismissWarning(){
		$(this)
				.parent()
				.attr("data-showing", "not_showing")
				.find("p")
				.text("");
		//lazy
		showApp();
	}
	function showSaveButton(){
		//from state machine
		$("[data-action='save_paragraph']")
				.attr("data-showing", "showing");
	}
	function displayRandomWord(word_to_display_str){
		//USED?????
		alert(word_to_display_str);
	}
	function disableSubmission(){
		// $('[data-action="submit_form"').hide();
	}
	function flash(err_str){
		var $flash = $("[data-role='flash_warnings']");
		if($flash.attr("data-showing") === "showing"){
			//appendFlash
			$flash
					.find("p")
					.append("<br /><br />" + err_str);
			return;
		}
		$flash
			.attr("data-showing", "showing")
			.find("p")
			.html(err_str);
	}
	function prepareTextArea(html_str){
		console.log("prepating text area");
		console.log(html_str);
		console.log("--");
		var holding_html_str = "",
			new_html_str = "",
			noun_count_int = 0,
			verb_count_int = 0,
			adjective_count_int = 0,
			re_noun = new RegExp("\\*noun\\*","gi"),
			re_verb = new RegExp("\\*verb\\*","gi"),
			re_adjective = new RegExp("\\*adjective\\*","gi");

			if(html_str.match(re_noun) !== null){
				noun_count_int = html_str.match(re_noun).length;
				html_str = html_str.replace(re_noun, "<mark data-noun>getting a noun...</mark>");
			}
			if(html_str.match(re_verb) !== null){
				verb_count_int = html_str.match(re_verb).length;
				html_str = html_str.replace(re_verb, "<mark data-verb>getting a verb...</mark>");
			}
			if(html_str.match(re_adjective) !== null){
				adjective_count_int = html_str.match(re_adjective).length;
				html_str = html_str.replace(re_adjective, "<mark data-adjective>getting an adjective...</mark>");
			}
			$("[data-textarea_input]").html(html_str);
			// debugger;
			// alert("Show we are hiiting up to 3 separate services now");
			window.controller.hitUpToThreeMicroServices(noun_count_int, verb_count_int, adjective_count_int);
	}
	function replaceNouns(noun_arr){
		// setTimeout(function(){
			var $noun_collection = $("[data-noun]");
			for(var i_int = 0; i_int < noun_arr.length; i_int += 1){
				$($noun_collection[i_int]).text(noun_arr[i_int]);
			}
		// }, 1000 * 1);
	}
	function replaceVerbs(verb_arr){
		// setTimeout(function(){
			var $verb_collection = $("[data-verb]");
			for(var i_int = 0; i_int < verb_arr.length; i_int += 1){
				$($verb_collection[i_int]).text(verb_arr[i_int]);
			}
		// }, 1000 * 2);
	}
	function replaceAdjectives(adjective_arr){
		// setTimeout(function(){
			var $adjective_collection = $("[data-adjective]");
			for(var i_int = 0; i_int < adjective_arr.length; i_int += 1){
				$($adjective_collection[i_int]).text(adjective_arr[i_int]);
			}
		// }, 1000 * 3);
	}
	function showApp(){
		var html_str = '';
		html_str +=		'<header>';
		html_str += 		'<h1>Storyizer</h1>';
		html_str += 		'<span data-action="show_help">?</span>';
		html_str += 	'</header>';
		html_str += 	'<aside data-showing="not_showing" data-role="flash_warnings">';
		html_str += 		'<button data-action="dismiss_warning">dismiss</button>';
		html_str += 		'<p>Some warning</p>';
		html_str += 	'</aside>';
		html_str +=		'<section>';
		html_str +=			'<div contenteditable data-textarea_input></div>';
		html_str +=			'<footer>';
		html_str +=				'<button data-action="submit_form">submit</button>';
		html_str +=				'<button data-showing="not_showing" data-action="save_paragraph">save</button>';
		html_str +=			'</footer>';
		html_str +=		'</section>';
		
		$("[data-role=app_holder]").html(html_str);	
		$("body > section > section > div").focus();	
	}
	function showAllFailingWords(word_type_str){
		$("[data-" + word_type_str + "]")
				.text(word_type_str + " api under maintenance");
	}
	function showHelp(){
		var html_str = '';
		html_str +=		'<header>';
		html_str += 		'<h1>Help page</h1>';
		html_str += 		'<span data-action="show_app">X</span>';
		html_str += 	'</header>';
		html_str += 	'<aside data-showing="not_showing" data-role="flash_warnings">';
		html_str += 		'<button data-action="dismiss_warning">dismiss</button>';
		html_str += 		'<p>Some warning</p>';
		html_str += 	'</aside>';
		html_str +=		'<section>';
		html_str +=			'<div>';
		html_str += 			'<h2>How this works</h2>';
		html_str += 			'<p>';
		html_str += 				'Type a paragraph and replace verbs, nouns, and adjectives with';
		html_str += 				'these placeholder words *noun* or *verb* or *adjective*';
		html_str += 			'</p>';
		html_str += 			'<p>';
		html_str += 				'When you press Submit we will ask the server for random words';
		html_str += 				'the placeholders will be replaces with the words from the server';
		html_str += 			'</p>';
		html_str += 			'<p>';
		html_str += 				'When you press Save we will save the paragraph to DynamoDB.';
		html_str += 			'</p>';
		html_str += 			'<p>';
		html_str += 				'One day I went to the *noun* and thought I was having a *adjective* time.';
		html_str += 				'That\'s when I decided to *verb* over to the *adjective* library to check out a *noun*.';
		html_str += 			'</p>';
		html_str += 		'</div>';
		html_str +=			'<footer>';
		html_str += 			'<button data-action="show_app">return to app</button>';
		html_str += 		'</footer>';
		html_str += 	'</section>';

		$("[data-role=app_holder]").html(html_str);	
	}
	return {
		dismissWarning: dismissWarning,
		displayRandomWord: displayRandomWord,
		disableSubmission: disableSubmission,
		flash, flash,
		prepareTextArea: prepareTextArea,
		replaceNouns: replaceNouns,
		replaceVerbs: replaceVerbs,
		replaceAdjectives: replaceAdjectives,
		showSaveButton: showSaveButton,
		showAllFailingWords: showAllFailingWords,
		showApp: showApp,
		showHelp: showHelp
	}
})();
var model = (function(){
	var proxyResponseHandler = {
		set: function(a, b, c){
			console.log("state machine was altered");
			window.model.state_machine[b] = c;
			if(			
						(window.model.state_machine["noun_received_boo"] === undefined || window.model.state_machine["noun_received_boo"] === true)
				 	&& 	(window.model.state_machine["verb_received_boo"] === undefined || window.model.state_machine["verb_received_boo"] === true)
				  	&& 	(window.model.state_machine["adjective_received_boo"] === undefined || window.model.state_machine["adjective_received_boo"] === true)
			){
				console.info("proxyResponseHandler:All expected respoinses came back");
				window.view.showSaveButton();
			}
			return 1;
		}
	}
	return {
		proxyResponseHandler
	}
})();
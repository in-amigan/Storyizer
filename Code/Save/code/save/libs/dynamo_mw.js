const 
	CREDS = require("../creds.json");

var dynamo_mw = (function(){
	var aws = require("aws-sdk"),
		uuidV4 = require("uuid/v4"),
		/*
			I am using dynamo on my account for now
			You will need to creare a dynamo table called "nouns_verbs_and_adjectives"
			Where a guid_str is the partion key hash
			(see save_item_params.json)
			see policy.json (use your own account tho' ;)
		*/

		//I am using temp creds as I am running this from localhost
		//rather than sending over a docker container

		//Use roles when you push this out
		dynamodb = new aws.DynamoDB({
			apiVersion: "2012-08-10",
            region: CREDS["YOUR_REGION"]
        }),
		save_item_params = require("../dynamo_calls/save_item_params.json");

	function saveNewItem(paragraph_str, cb){
		save_item_params.Item.guid_str.S = uuidV4();
		save_item_params.Item.paragraph_html_str.S = paragraph_str;
		// console.dir(save_item_params);
		// "ConditionExpression": "attribute_not_exists(guid_str)" required for localdynanodb only
		dynamodb.putItem(save_item_params, function(err, data){
			if(err){
				console.log(err, err.stack);
				return cb(err.message, null);
			}
			console.log("I just saved this to dynamo");
			cb(null, data);
		});
	}
	return {
		saveNewItem
	}
})();
module.exports = dynamo_mw;
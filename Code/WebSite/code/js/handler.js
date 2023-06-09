/*******HANDLERS***********/

$(document).on("click", "[data-action='submit_form']", window.controller.prepareFormForSubmission);
$(document).on("click", "[data-action='save_paragraph']", window.controller.prepareFormForSave);
$(document).on("click", "[data-action='show_help']", window.view.showHelp);
$(document).on("click", "[data-action='show_app']", window.view.showApp);
$(document).on("click", "[data-action='dismiss_warning']", window.view.dismissWarning);

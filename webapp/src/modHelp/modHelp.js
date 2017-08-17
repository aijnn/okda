// ################################
// # Module object                #
// ################################

modHelp = {
    version: "0.1",
    author: "David Petek",
    email: "me@davidpetek.com",
    license: "MIT"
}

// ################################
// # Initialization               #
// ################################

// Initialize module
modHelp.init = function () {
    modHelp.initElements();
    modHelp.summary();
    modHelp.overlay();
    markActive("modHelp", true);
}

// Initialize module elements
modHelp.initElements = function () {
    initContainers("modHelp", ["rside","overlay"]);
}

// ################################
// # Containers                   #
// ################################

// Summary
modHelp.summary = function () {
    var html = "author:&nbsp;&nbsp;" + modHelp["author"] +
        "&nbsp;(" + modHelp["email"] + ")<br />" +
        "license:&nbsp;" + modHelp["license"] + "<br />" +
        "version:&nbsp;" + modHelp["version"];
    setHtml(W["modHelp_statbox"], html);
}

// Overlay
modHelp.overlay = function (thankyou = false) {
    var name = (thankyou)? "thankyou_" : "";
    var html = "<div id='overlay_modHelp_inner'>" +
        "<h1>" + C["modHelp_" + name + "title"] + "</h1>" +
        C["modHelp_" + name + "text"];

    // Add start button
    if (!thankyou && C["modHelp_button"]) {
        html += "<div id='overlay_modHelp_start' class='success' onclick='modHelp.quickstart();'>" + C["modHelp_button_text"] + "</div>"
    }

    html += "</div>";
    setHtml(W["modHelp_overlay"], html);
}

// ################################
// # Functions                    #
// ################################

// Start overlay automatically
modHelp.start = function () {
    showOverlay("modHelp");
}

// Reset modHelp
modHelp.reset = function () {

}

// Close overlay and start
modHelp.quickstart = function () {
    hideOverlays();
    start();
}

// Thank the user
modHelp.thankyou = function () {
    if (C["modHelp_thankyou"] &&
        (!C["modText"] || modText["finished"]) &&
        (!C["modQuestions"] || modQuestions["finished"])) {
            if (C["modSave"] && C["modSave_autosave"]) {
                modSave.save();
            }

            modHelp.overlay(true);
            showOverlay("modHelp");
    }
}

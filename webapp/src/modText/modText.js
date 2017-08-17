// ################################
// # Module object                #
// ################################

modText = {
    // Elements
    buttons: false,
    spans: false,

    // Counts
    nwords: 0,
    nchars: 0,
    cword: 0,
    nerrors: 0,
    ncorrections: 0,

    // Text
    raw: "",
    uraw: "",
    words: [],
    lastchar: 0,

    // State
    running: false,
    finished: false,
    saved: false,
    fresh: true,
    lastword: false,

    // Analysis
    rawfreq: [],
    groupfreq: [[]],
    rawjumps: [[]],
    groupjumps: [[[]]]
};

// ################################
// # Initialization               #
// ################################

// Initialize module
modText.init = function () {
    modText.initElements();
    modText.main();
    modText["spans"] = W["modText_text"].getElementsByTagName("span");
    modText["buttons"] = E["actions"].getElementsByTagName("button");
    modText["raw"] = C["modText_text"].replace(/\s+/g, " ");
    modText["uraw"] = modText["raw"].toUpperCase();
    modText["nchars"] = modText["raw"].length;
    modText["words"] = modText["raw"].split(" "); 
    modText["nwords"] = modText["words"].length;
    modText["lastchar"] = modText.initLastChar();
    modText["lastword"] = (modText["nwords"] <= 1);
    var out = "";
    for (var i = 0; i < modText["nwords"]; i++) out += "<span>" + modText["words"][i] + "</span><wbr>";
    setHtml(W["modText_text"], out);
    modText.summary();
    modText.analyze();
}

// Find code of last character
modText.initLastChar = function () {
    c = modText["uraw"].substr(modText["nchars"]-1).charCodeAt();
    for (var i = 0; i < C["overwrite"].length; i++) {
        if (c == C["overwrite"][i][0]) {
            return C["overwrite"][i][1];
        }
    }
    return c;
}

// Initialize module elements
modText.initElements = function () {
    initContainers("modText", ["content","rside","overlay","progress"]);
}

// ################################
// # Containers                   #
// ################################

// Main content
modText.main = function () {
    var html = "<div id='w_modText_text'>No text loaded</div>" +
        "<input type='text' id='w_modText_input' class='noselect' onfocus='modText.focus();'>";
    setHtml(E["modText_main"], html);
    initElement("modText_text", "writable");
    initElement("modText_input", "writable");
}

// Summary
modText.summary = function () {
    var summary = "Words: <strong>" + modText["nwords"] + "</strong>, " +
        "chars: <strong>" + modText["nchars"] + "</strong>, " +
        "current: <strong>" + modText["cword"] + "</strong>, " +
        "errors: <strong>" + modText["nerrors"] + "</strong>, " +
        "corr: <strong>" + modText["ncorrections"] + "</strong>";
    setHtml(W["modText_statbox"], summary);
}

// Overlay
modText.overlay = function () {
    var out = "<h1>Text analysis</h1>";
    
    // Draw group frequency tables
    out += "<h2>Group frequency</h2>";
    for (var i = 0; i < C["metagroups"].length; i++) {
        var groups = C["metagroups"][i]["groups"];
        var bigval = Math.ceil(modText["nchars"] / (groups.length / 2)); 
        out += "<h3>" + C["metagroups"][i]["name"] + "</h3>" +
            wrapHtmlTable(trTitles(arrayProperty(groups, "title")) + trList(modText["groupfreq"][i], 0, bigval));
    }

    // Draw character frequency table
    var bigval = Math.ceil(modText["nchars"] / C["chars"].length);
    out += "<h2>Character frequency</h2>" +
        wrapHtmlTable(trTitles(C["chars"]) + trList(modText["rawfreq"], 0, bigval));

    // Draw group jump frequency tables
    out += "<h2>Group jump frequency</h2>" +
        "<p>Jumps from group in row to group in column.</p>";
    for (var i = 0; i < C["metagroups"].length; i++) {
        var groups = C["metagroups"][i]["groups"];
        var bigval = Math.ceil(modText["nchars"] / (Math.pow(groups.length, 2) / 2));
        out += "<h3>" + C["metagroups"][i]["name"] + "</h3>" +
            wrapHtmlTable(trTitles(arrayProperty(groups, "title"), 1) + trsListList(modText["groupjumps"][i], 0, bigval, arrayProperty(groups, "title")));
    }

    // Draw character jump frequency tables
    var bigval = Math.ceil(modText["nchars"] / Math.pow(C["chars"].length, 2));
    out += "<h2>Character jump frequency</h2>" +
        "<p>Jumps from character in row to character in column.</p>" +
        wrapHtmlTable(trTitles(C["chars"], 1) + trsListList(modText["rawjumps"], 0, bigval, C["chars"]));

    // Output HTML
    setHtml(W["modText_overlay"], out);
    markActive("modText", true);
}

// ################################
// # Functions                    #
// ################################

// Analyze text supplied in configuration
modText.analyze = function () {
    // Prepare frequency and jump arrays
    modText["rawfreq"] = arrayConstruct(0, [C["chars"].length]);
    modText["rawjumps"] = arrayConstruct(0, [C["chars"].length, C["chars"].length]);
    modText["groupfreq"] = arrayConstruct([], [C["metagroups"].length]);
    modText["groupjumps"] = arrayConstruct([], [C["metagroups"].length]);

    for (var i = 0; i < C["metagroups"].length; i++) {
        var ngroups = C["metagroups"][i]["groups"].length;
        modText["groupfreq"][i] = arrayConstruct(0, [ngroups]);
        modText["groupjumps"][i] = arrayConstruct(0, [ngroups, ngroups]);
    }
    
    // Calculate frequencies and jumps
    var prevc, prevgroups, prevpos;
    var pos = false, c = false, groups = [];
    for (var i = 0; i < modText["uraw"].length; i++) {
        [prevc, prevgroups, prevpos] = [c, groups, pos];
        c = modText["uraw"].charAt(i); 
        groups = getGroups(c);
        pos = C["chars"].indexOf(c);

        if (pos < 0) {
            logMsg(STRINGS["logErrr"] + "Character '" + c + "' is not allowed in config");
        }
        else {
            modText.updateRawC(prevc, pos, prevpos);
            modText.updateGroupC(groups, prevgroups);
       }
    }
    modText.overlay();
}

// Add character to raw count
modText.updateRawC = function (prevc, pos, prevpos) {
    modText["rawfreq"][pos]++;
    if (prevc != false && prevpos > 0) {
        modText["rawjumps"][prevpos][pos]++;
    }
}

// Add character to group count
modText.updateGroupC = function (groups, prevgroups) {
    for (var i = 0; i < C["metagroups"].length; i++) {
        // Count character toward all groups which it belongs to (one for each metagroup)
        modText["groupfreq"][i][groups[i]]++;

        // Skip first character when there are no previous groups
        if (prevgroups.length != 0) {
            // Count jumps from group to group (once for each metagroup)
            modText["groupjumps"][i][prevgroups[i]][groups[i]]++;
        }
    }
}

// Focus input area
modText.focus = function () {
    // If running, focus area
    if (modText["running"]) {
        W["modText_input"].focus();
    }

    // If finished, we can't accept text
    else if (modText["finished"]) {
        logMsg(STRINGS["logErrr"] + "Already finished, reset to try again");
        modText.blur();
    }

    // If not running, start it automatically
    else {
        logMsg(STRINGS["logWarn"] + "Text capture not started");
        modText.start();
    }
}

// Blur input area
modText.blur = function () {
    W["modText_input"].blur();
}

// Enable user to write text
modText.start = function () {
    if (modText["running"]) {
        logMsg(STRINGS["logWarn"] + "Can't start capure, already running");
    }
    else if (modText["finished"]) {
        logMsg(STRINGS["logWarn"] + "Already finished, reset to start again");
    }
    else {
        modText["running"] = true;
        modText["saved"] = false;
        logMsg(STRINGS["logStat"] + "Starting text capture");
        modText.setCurrent();    
        modText.focus();
        setStatus("Waiting for keystrokes", "warning");
        modText.setButtons();
    }
}

// Disable user to start text
modText.stop = function () {
    if (modText["running"]) {
        logMsg(STRINGS["logStat"] + "Stoping text capture");
        remVal(W["modText_input"]);
        modText.blur();
        modText["running"] = false;
        modText["fresh"] = false;
        modText.resetCurrent();
        modText.setButtons();

        if (C["modCapture"] && modCapture["running"]) {
            modCapture.stop();
        }

        setStatus("Ready", "success");
    }
    else {
        logMsg(STRINGS["logWarn"] + "Can't stop, not running"); 
    }
}

// Reset text progress, also trigger modCapture reset if enabled
modText.reset = function () {
    if (modText["running"]) {
        logMsg(STRINGS["logWarn"] + "Can't reset while running, stop first");
    }
    else if (!modText["fresh"]) {
        logMsg(STRINGS["logStat"] + "Reseting text and capture");
        modText["fresh"] = true;
        modText["finished"] = false;
        modText["lastword"] = (modText["nwords"] <= 1);
        modText["cword"] = 0;
        modText["nerrors"] = 0,
        modText["ncorrections"] = 0,
        modText.summary();
        modText.setButtons();
        setStatus("Ready", "success");
    }
}

// Set current word
modText.setCurrent = function (failed = false) {
    cls = (failed)? "warning" : "current";
    if (modText["cword"] > 0) {
       resClass(modText["spans"][modText["cword"] - 1]); 
    }
    setClass(modText["spans"][modText["cword"]], cls);
    modText.summary();
}

modText.resetCurrent = function () {
    for (var i = 0; i < modText["spans"].length; i++) resClass(modText["spans"][i]);
    modText.summary();
}

// Set buttons to active / inactive based on status
modText.setButtons = function () {
    // Set text done status
    markDone("modText", modText["finished"]);
    
    // Set action buttons
    if (modText["running"]) {
        mode = 2;
    }
    else {
        mode = 0;
        if (!modText["finished"]) {
            mode += 1;
        }
        if (!modText["fresh"]) {
            mode += 4; 
        }
        if (modText["finished"] && !modText["saved"]) {
            mode += 8;
        }
    }
    for (var i = 0; i < 4; i++) {
        cls = ((1 << i & mode) > 0)? "success" : "offline";
        setClass(modText["buttons"][i], cls);
    }
}

// Evaluate current word submitted by user
modText.evalWord = function (soft = false) {
    // Read and reset input field
    word = W["modText_input"].value.replace(/ /g, "");

    // Word is correct, progress and check if next word is last
    if (word == modText["words"][modText["cword"]]) {
        modText["cword"] += 1;

        if (modText["cword"] == modText["nwords"] - 1) {
            modText["lastword"] = true;
        }
        else if (modText["cword"] == modText["nwords"]) {
            return true;
        }

        modText.setCurrent();
        remVal(W["modText_input"]);
        return true;
    }
    
    // Word is incorrect, repeat (unless soft check)
    if (!soft) {
        modText["nerrors"] += 1;
        modText.setCurrent(true); 
        remVal(W["modText_input"]);
        beep();
    }

    return false; 
}

// Check if user is done writing
modText.checkEnd = function () {
    if (modText.evalWord(true)) {
        modText["finished"] = true;
        modText.stop();
        logMsg(STRINGS["logSucc"] + "Text finished");
        moduleCallFirst("thankyou");
        if (C["modCapture"]) modCapture.analyze();
    }
}

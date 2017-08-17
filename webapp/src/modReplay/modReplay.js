// ################################
// # Module object                #
// ################################

modReplay = {
    // State
}

// ################################
// # Initialization               #
// ################################

// Initialize module
modReplay.init = function () {
    modReplay.initElements();
    modReplay.summary();
}

// Initialize module elements
modReplay.initElements = function () {
    initContainers("modReplay", ["rside"]);
}

// ################################
// # Containers                   #
// ################################

// Summary
modReplay.summary = function () {
    var html = "<input type='text' id='modReplay_input' placeholder='... data to replay ...'>" +
        "<div id='modReplay_replay' class='warning' onclick='modReplay.replay();'>Replay</div>";
    setHtml(W["modReplay_statbox"], html);
    initElement("modReplay_input", "element");
}

// ################################
// # Functions                    #
// ################################

// Replay user supplied data
modReplay.replay = function () {
    var data = E["modReplay_input"].value;
    var type = C["modReplay_type"];
    var format = C["modReplay_format"];
    
    // Check data is not empty
    if (data.length == 0) {
        logMsg(STRINGS["logErrr"] + "Can't replay empty data");
        return;
    }

    // Transform data to appropriate type
    switch (format) {
        case "json":
            try {
                data = JSON.parse(data);    
            }
            catch (err) {
                logMsg(STRINGS["logErrr"] + "Can't parse JSON data for replaying");
                return;
            }
            break;
        default:
            logMsg(STRINGS["logErrr"] + "Unrecognized format specified for replaying");
            return;
    }

    // Replay data
    switch (type) {
        case "raw":
            modReplay.rawCapture(data);
            logMsg(STRINGS["logSucc"] + "Successfully replayed raw data");
            break;
        default:
            logMsg(STRINGS["logErrr"] + "Unrecognized type specified for replaying");
            return;
    }
}

// Replay raw modCapture data
modReplay.rawCapture = function (data) {
    reset();

    // Set modCapture data
    if (C["modCapture_shift"]) {
        modCapture["rawshift"] = data[1];
        data = data[0];
    }
    modCapture["raw"] = data;
    modCapture["time"] = data[data.length-1][2] - data[0][2];
   
    // Set modText data 
    if (C["modText"]) {
        modText["finished"] = true;
    }

    // Analyze
    modCapture.analyze();
}

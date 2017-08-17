// ################################
// # Module object                #
// ################################

modSave = {
    // State
    finished: false,
    saved: false,
    id: "",
}

// ################################
// # Initialization               #
// ################################

// Initialize module
modSave.init = function () {
    modSave.initElements();
    modSave["id"] = modSave.makeId();
    modSave.summary();
}

// Initialize module elements
modSave.initElements = function () {
    initContainers("modSave", ["rside","progress"]);
}

// ################################
// # Containers                   #
// ################################

// Summary
modSave.summary = function () {
    var html = "<a id='modSave_download' download='file'></a>";

    for (var key in C["modSave_save"]) {
        if (C["modSave_save"].hasOwnProperty(key)) {
            var item = C["modSave_save"][key];
            var cls = item["enabled"]? "success" : "failure";
            html = "<div class='modSave_statusItem " + cls + "'>" + item["title"] + "</div>" + html;
        }
    }

    html = "<input id='modSave_id' class='message' value='" + modSave["id"] + "'>" + html;
    setHtml(W["modSave_statbox"], html);
    initElement("modSave_id", "element");
    initElement("modSave_download", "element");
}

// ################################
// # Functions                    #
// ################################

// Generate id based on date and random value
modSave.makeId = function () {
    var date = new Date();
    id = ("" + date.getYear()).substr(-2) +
        "_" + zeropad(("" + (date.getMonth() + 1)), 2) +
        "_" + zeropad(("" + (date.getDate())), 2);

    if (C["modSave_rand"]) {
        id += "_" + randomString(C["modSave_rand_len"]);
    }

    return id;
}

// Save data
modSave.save = function () {
    modSave["id"] = E["modSave_id"].value;
    setStatus("Saving", "failure");
    var csvHeaders = [];
    var csvData = [];

    // Save data (appends to arrays)
    modSave.appendModCapture(csvHeaders,csvData);
    modSave.appendModQuestions(csvHeaders,csvData);

    // Download if we have any data
    if (csvData.length > 0) {
        // Set action buttons
        if (C["modText"]) {
            modText["saved"] = true;
            modText.setButtons();
        }
        
        // Download csv
        logMsg(STRINGS["logSucc"] + "Downloading csv with '" + csvData.length +"' columns");
        modSave.downloadCsv(csvHeaders, csvData, modSave["id"] + ".csv");
    }

    setStatus("Ready", "success");
}

// Append modCapture data
modSave.appendModCapture = function (csvHeaders, csvData) {
    if (C["modSave_save"]["capture_raw"]["enabled"] ||
        C["modSave_save"]["capture_analyzed"]["enabled"]) { 
        if (C["modText"] && modText["running"]) {
            // Can't save while modText is running
            logMsg(STRINGS["logWarn"] + "Can't save capture while running, stop first");
        }
        else if (C["modText"] && (! modText["finished"])) {
            // Can't save if modText is not finished
            logMsg(STRINGS["logWarn"] + "Can't save capture, finish writing first");
        }
        else {
            // Save raw modCapture data
            if (C["modCapture"] && C["modSave_save"]["capture_raw"]["enabled"]) {
                switch (C["modSave_save"]["capture_raw"]["mode"]) {
                    case "json":
                        logMsg(STRINGS["logSucc"] + "Downloading raw 'modCapture' data");
                        if (C["modCapture_shift"]) {
                            modSave.downloadJson([modCapture["raw"], modCapture["rawshift"]], modSave["id"] + "_rawcapture");
                        }
                        else {
                            modSave.downloadJson(modCapture["raw"], modSave["id"] + "_rawcapture");
                        }
                        break;
                    default:
                        logMsg(STRINGS["logErrr"] + "Unrecognized format specified for saving raw 'modCapture' data");
                }
            }

            // Save analyzed modCapture data
            if (C["modCapture"] && C["modSave_save"]["capture_analyzed"]["enabled"]) {
                switch (C["modSave_save"]["capture_analyzed"]["mode"]) {
                    case "csv":
                        logMsg(STRINGS["logStat"] + "Saving analyzed 'modCapture' data");
                        modSave.csvCaptureAnalyzed(csvHeaders, csvData);
                        break;
                    default:
                        logMsg(STRINGS["logErrr"] + "Unrecognized format specified for saving analyzed 'modCapture' data");
                }
            }
        }
    }
}

// Save modCapture data
modSave.appendModQuestions = function (csvHeaders, csvData) {
    if (C["modQuestions"]) {
        if (modQuestions["analyzed"]) {
            // Save raw modQuestions data
            if (C["modSave_save"]["questions_raw"]["enabled"]) {
                switch (C["modSave_save"]["questions_raw"]["mode"]) {
                    case "csv":
                        logMsg(STRINGS["logStat"] + "Saving raw 'modQuestions' data");
                        modSave.csvQuestionsRaw(csvHeaders, csvData);
                        break;
                    default:
                        logMsg(STRINGS["logErrr"] + "Unrecognized format specified for saving raw 'modQuestions' data");
                }
            }

            // Save analyzed modQuestions data
            if (C["modSave_save"]["questions_analyzed"]["enabled"]) {
                switch (C["modSave_save"]["questions_raw"]["mode"]) {
                    case "csv":
                        logMsg(STRINGS["logStat"] + "Saving analyzed 'modQuestions' data");
                        modSave.csvQuestionsAnalyzed(csvHeaders, csvData);
                        break;
                    default:
                        logMsg(STRINGS["logErrr"] + "Unrecognized format specified for saving analyzed 'modQuestions' data");
                }
            }
        }
        else {
            // Can't save is questions are not answered
            logMsg(STRINGS["logWarn"] + "Can't save questions, answer questions first");
        }
    }
}

// Prepare analyzed modCapture data for csv
modSave.csvCaptureAnalyzed = function (headers, data) {
    // Helper function to push items
    function pushItem (level, name, value) {
        headers.push(level + "_" + name);
        data.push(value);
    }

    // Helper function to push n, m, sd
    function pushProperties (level, name, value) {
        var properties = (C["modSave_n"])? ["n", "m", "sd"] : ["m", "sd"];
        for (var i = 0; i < properties.length; i++) {
            var property = properties[i];
            pushItem(level, name + "_" + property, value[property]);
        }
    }

    // Helper function to push character objects
    function pushPropertiesChars (level, name, property, combinations = false) {
        for (var i = 0; i < C["chars"].length; i++) {
            if (combinations) {
                for (var j = 0; j < C["chars"].length; j++) {
                    var header = name + "_" + C["chars"][i] + ":" + C["chars"][j];
                    pushProperties(level, header, modCapture[property][i][j]);
                }
            }
            else {
                var header = name + "_" + C["chars"][i];
                pushProperties(level, header, modCapture[property][i]);
            }
        }
    } 

    // Helper function to push group objects
    function pushPropertiesGroups (level, name, property, combinations = false) {
        for (var i = 0; i < C["metagroups"].length; i++) {
            var groups = C["metagroups"][i]["groups"];
            for (var j = 0; j < groups.length; j++) {
                var group = groups[j]["title"].substr(0,3);
                if (combinations) {
                    for (var k = 0; k < groups.length; k++) {
                        var group2  = groups[k]["title"].substr(0,3);
                        var header = name + "_" + group + ":" + group2;
                        pushProperties(level, header, modCapture[property][i][j][k]);
                    }
                }
                else {
                    var header = name + "_" + group;
                    pushProperties(level, header, modCapture[property][i][j]);
                }
            }
        } 
    }

    // Meta information
    pushItem("0i", "time", modCapture["time"]);
    if (C["modText"]) {
        pushItem("0i", "chrs/m", modCapture["cpm"]);
        pushItem("0i", "err", modText["nerrors"]);
        pushItem("0i", "err/m", modCapture["epm"]);
        if (C["modText_backspace"]) {
            pushItem("0i", "corr", modText["ncorrections"]);
            pushItem("0i", "corr/m", modCapture["bpm"]);
        }
    }

    // Global dwell and flight data
    pushProperties("0i", "gfl", modCapture["aaflighto"]);
    pushProperties("0i", "gdw", modCapture["adwello"]);

    // Shift key dwell
    if (C["modCapture_shift"]) {
        pushProperties("1i", "shd", modCapture["dwelloshift"]);
    }

    // Group and character dwell data
    pushPropertiesGroups("1i", "gdw", "gdwello");
    pushPropertiesChars("2i", "dw", "dwello");

    // Group and characters flight data
    pushPropertiesGroups("1i", "gfl", "agflighto");
    pushPropertiesChars("2i", "fl", "aflighto");

    // Group to group and character to character flight data
    pushPropertiesGroups("3i", "gfl", "gflighto", true);
    pushPropertiesChars("4i", "fl", "flighto", true);
}

// Prepare raw modQuestions data for csv
modSave.csvQuestionsRaw = function (headers, data) {
    // Helper function to push items
    function pushItem (level, name, value) {
        headers.push(level + "_" + name);
        data.push(value);
    }

    // Helper function to push demographic scale 
    function pushDemo (level, name, vals) {
        var group = C["modQuestions_" + name];
        for (var i = 0; i < group.length; i++) {
            var name = group[i]["name"]; 
            var value = modQuestions[vals][name];
            pushItem(level, name, value);
        }
    }

    // Helper function to push binary or likert scales
    function pushScales (level, title, name) {
        var scales = C["modQuestions_" + name];
        for (var i = 0; i < scales.length; i++) {
            var scale = scales[i];
            if (scale["enabled"]) {
                var dimensions = scale["dimensions"];
                var items = scale["items"];
                var selected = scale["selected"];
                for (var j = 0; j < items.length; j++) {
                    var item = items[j];
                    if (dimensions[item["dimension"]]["enabled"]) {
                        var header = title + i + "_" + j;
                        pushItem(level, header, selected[j]);
                    }
                } 
            }
        }
    }

    // Binary and numerical fields
    pushDemo("1o", "binfields", "binvals");
    pushDemo("1o", "numfields", "numvals");

    // Binary and likert scales
    pushScales("4o", "s", "scales");
    pushScales("4o", "l", "lscales");
}

// Prepare analyzed modQuestions data for csv
modSave.csvQuestionsAnalyzed = function (headers, data) {
    // Helper function to push items
    function pushItem (level, name, value) {
        headers.push(level + "_" + name);
        data.push(value);
    }

    // Helper function to push binary or likert scales
    function pushScales (level, title, name) {
        var scales = C["modQuestions_" + name];
        for (var i = 0; i < scales.length; i++) {
            var scale = scales[i];
            if (scale["enabled"]) {
                var dimensions = scale["dimensions"];
                for (var key in dimensions) {
                    if (dimensions.hasOwnProperty(key)) {
                        var dimension = dimensions[key];
                        if (dimension["enabled"]) {
                            var header = title + i + "_" + key.substr(0,3);
                            pushItem(level, header, dimension["score"]);
                        }
                    }
                } 
            }
        }
    }

    // Binary and likert scales
    pushScales("1o", "s", "scales");
    pushScales("1o", "l", "lscales");
}

// Download JSON data
modSave.downloadJson = function (data, name) {
    modSave.download(JSON.stringify(data), name);
}

// Download CSV data
modSave.downloadCsv = function (headers, data, name, wrap = '"', end = ',') {
    // Check there are equal number of headers and data
    if (headers.length != data.length) {
        logMsg(STRINGS["logErrr"] + "CSV headers and data mismatch!");
        return;
    }

    // Construct CSV
    var csvData = [headers, data];
    var csv = "";
    
    for (i = 0; i < csvData.length; i++) {
        if (i != 0) csv += "\n";
        for (j = 0; j < csvData[i].length; j++) {
            if (j != 0) csv += end;
            csv += wrap + csvData[i][j] + wrap; 
        }
    }

    // Download csv
    modSave.download(csv, name);
}

// Download data
modSave.download = function (data, name) {
    data = data.replace(/'/g, "ap");
    var url = "data:text/plain;charset=utf-8," + encodeURIComponent(data);

    if (C["modSave_autodownload"]) {
        // Download file
        E["modSave_download"].href = url;
        E["modSave_download"].download = name;
        E["modSave_download"].click();
    }
    else {
        // Provide download link
        var link = STRINGS["logSucc"] + "<a href='" + url + "' download='" + name + "'>" + name + "</a>";
        logMsg(link);
    }
}

// ################################
// # Module object                #
// ################################

modCapture = {
    // Counts
    starttime: 0,
    time: 0,

    // State
    running: false,
    analyzed: false,

    // Global
    cpm: 0,
    epm: 0,
    bpm: 0,

    // Raw times
    raw: [],
    nraw: 0,
        
    // Processed times
    dwell: [[]],
    gdwell: [[[]]],
    flight: [[[]]],
    gflight: [[[[]]]],

    // Averages
    dwello: [],
    gdwello: [[]],
    flighto: [[]],
    gflighto: [[[]]],

    // Average averages
    adwello: {},
    agdwello: {},
    aflighto: [],
    agflighto: [],

    // Average average averages
    aaflighto: {},
    aagflighto: {},

    // Shift key
    rawshift: [],
    dwellshift: [],
    dwelloshift: {}
}

// ################################
// # Initialization               #
// ################################

// Initialize module
modCapture.init = function () {
    modCapture.initElements();
    if (!C["modText"]) {
        logMsg(STRINGS["logWarn"] + "Some modCapture features require modText to work");
    }
    modCapture.reset();
    modCapture.overlay();
}

// Initialize module elements
modCapture.initElements = function () {
    initContainers("modCapture", ["rside","overlay"]);
}

// ################################
// # Containers                   #
// ################################

// Summary
modCapture.summary = function () {
    var s = Math.floor(modCapture["time"] / 1000);
    var ms = modCapture["time"] % 1000;
    var summary = "Time: <strong>" + s + "</strong>s <strong>" + ms + "</strong>ms";
    if (C["modText"]) {
        summary += ", chars/min: <strong>" + modCapture["cpm"] + "</strong>" +
            ", errors/min: <strong>" + modCapture["epm"] + "</strong>";
    }
    setHtml(W["modCapture_statbox"], summary);
}

// Overlay
modCapture.overlay = function () {
    var out = "<h1>Capture analysis</h1>";
    var properties = ["n", "m", "sd"];
    
    if (modCapture["analyzed"]) {
        // Global dwell and flight n, m and sd
        out += "<h2>Global dwell and flight</h2>" +
            "<table>" +
            trTitles(["Dwell", "Flight"], 0, 3) +
            trTitles(["n", "m", "sd", "n", "m", "sd"]) +
            trListProperties([modCapture["adwello"], modCapture["aaflighto"]], properties, 0, 0) +
            "</table>";

        // Dwell for shift key
        if (C["modCapture_shift"]) {
            out += "<h3>Shift key dwell</h3>" +
                "<table>" +
                trTitles(properties) +
                trListProperties([modCapture["dwelloshift"]], properties, 0, 0) +
                "</table>";
        }

        // List of n, m, sd for dwell for each group
        out += "<h2>Group dwell means and deviations</h2>";
        for (var i = 0; i < C["metagroups"].length; i++) {
            var groups = C["metagroups"][i]["groups"];
            out += "<h3>" + C["metagroups"][i]["name"] + "</h3>" +
                "<table>" +
                trTitles(arrayProperty(groups, "title"), 1) +
                trsPropertiesList(modCapture["gdwello"][i], properties, 0, 0) +
                "</table>";
        }

        // List of n, m, sd for dwell for each character
        out += "<h2>Character dwell means and deviations</h2>" +
            "<table>" +
            trTitles(C["chars"], 1) +
            trsPropertiesList(modCapture["dwello"], properties, 0, 0) +
            "</table>";
        
        // List of n, m, sd for flight to each group
        out += "<h2>Group flight means and deviations</h2>";
        for (var i = 0; i < C["metagroups"].length; i++) {
            var groups = C["metagroups"][i]["groups"];
            out += "<h3>" + C["metagroups"][i]["name"] + "</h3>" +
                "<table>" +
                trTitles(arrayProperty(groups, "title"), 1) +
                trsPropertiesList(modCapture["agflighto"][i], properties, 0, 0) +
                "</table>";
        }

        // List of n, m, sd for flight to each character
        out += "<h2>Character flight means and deviations</h2>" +
            "<table>" +
            trTitles(C["chars"], 1) +
            trsPropertiesList(modCapture["aflighto"], properties, 0, 0) +
            "</table>";

        // List of n, m, sd for flight from each group (row) to each group (column)
        out += "<h2>Group to group flight means and deviations</h2>";
        for (var i = 0; i < C["metagroups"].length; i++) {
            var groups = C["metagroups"][i]["groups"];
            out += "<h3>" + C["metagroups"][i]["name"] + "</h3>" +
                "<table>" +
                trTitles(arrayProperty(groups, "title"), 2) +
                trsListPropertiesList(modCapture["gflighto"][i], properties, 0, 0, arrayProperty(groups, "title")) +
                "</table>";
        }

        // List of n, m, sd for flight from each character (row) to each character (column)
        out += "<h2>Character to character flight means and deviations</h2>" +
            "<table>" +
            trTitles(C["chars"], 2) +
            trsListPropertiesList(modCapture["flighto"], properties, 0, 0, C["chars"]) +
            "</table>";

        // List of dwell times for each character
        out += "<h2>All characters  dwell times</h2>" +
            "<table>";
        for (var i = 0; i < C["chars"].length; i++) {
            out += "<tr>" +
                "<td class='mark'>" + C["chars"][i] + "</td>" +
                "<td>" + modCapture["dwell"][i].join(",") + "</td>" +
                "</tr>";
        }
        out += "</table>";
    }
    else {
        out += "<p>Analysis wasn't performed yet, finish text first or call it manually.</p>";
    }

    // Output HTML
    setHtml(W["modCapture_overlay"], out);
    markActive("modCapture", modCapture["analyzed"]);
}

// ################################
// # Functions                    #
// ################################

// Start keystroke capture
modCapture.start = function () {
    if (modCapture["running"]) {
        logMsg(STRINGS["logErrr"] + "Can't start stopwatch, already running");
    }
    else {
        modCapture["running"] = true;
        modCapture["starttime"] = Date.now();
        setStatus("Capturing", "message");
    }
}

// Stop keystroke capture
modCapture.stop = function () {
    if (modCapture["running"]) {
        modCapture["running"] = false;
        modCapture["time"] += Date.now() - modCapture["starttime"];
    }
    else {
        logMsg(STRINGS["logErrr"] + "Can't stop stopwatch, it is not running");
    }
}

// Reset keystroke capture
modCapture.reset = function () {
    // Reset state
    modCapture["analyzed"] = false;
    modCapture["starttime"] = 0;
    modCapture["time"] = 0;
    modCapture["raw"] = [];

    // Prepare dwell and flight arrays
    modCapture["dwell"] = arrayConstruct([], [C["chars"].length]);
    modCapture["flight"] = arrayConstruct([], [C["chars"].length, C["chars"].length]);
    modCapture["gdwell"] = arrayConstruct([], [C["metagroups"].length]);
    modCapture["gflight"] = arrayConstruct([], [C["metagroups"].length]);

    for (var i = 0; i < C["metagroups"].length; i++) {
        var ngroups = C["metagroups"][i]["groups"].length;
        modCapture["gdwell"][i] = arrayConstruct([], [ngroups]);
        modCapture["gflight"][i] = arrayConstruct([], [ngroups, ngroups]);
    }
}

// Analyze captured keystrokes
modCapture.analyze = function () {
    if (C["modText"] && !modText["finished"]) {
        logMsg(STRINGS["logErrr"] + "Can't analyze capture, finish text or disable modText");
        return;
    }

    // Get global per minute stats
    if (C["modText"]) {
        modCapture["cpm"] = perMinute(modText["nchars"], modCapture["time"]);
        modCapture["epm"] = perMinute(modText["nerrors"], modCapture["time"]);
        modCapture["bpm"] = perMinute(modText["ncorrections"], modCapture["time"]);
    } 
    
    // Analyze keystrokes
    modCapture["nraw"] = modCapture["raw"].length;

    var minKeystrokes = (C["modText"])? modText["nchars"] * 2 : 1;
    if (modCapture["nraw"] < minKeystrokes) {
        logMsg(STRINGS["logWarn"] + "Expected more keystrokes (expected >= " + minKeystrokes + ", got " + modCapture["nraw"] + ")");
    }

    var pressTime = arrayConstruct(0, [C["chars"].length]);
    var pressed = arrayConstruct(false, [C["chars"].length]);
    var lastReleased = {key: -1, groups: [], time: 0}
    var presses = [];
    var releases = [];

    // Raw dwell times
    for (var i = 0; i < modCapture["nraw"]; i++) {
        [down, key, time] = modCapture["raw"][i]; 
        key = C["codes"].indexOf(key);
        groups = getGroups(C["chars"][key]);
        if (down) {
            presses.push([key, time, groups]);
            if (pressed[key]) {
                logMsg(STRINGS["logErrr"] + "Key " + C["chars"][key] + " pressed while down");
            }
            else {
                pressTime[key] = time;
                pressed[key] = true;
            }
        }
        else {
            releases.push([key, time, groups]);
            if (!pressed[key]) {
                logMsg(STRINGS["logErrr"] + "Key '" + C["chars"][key] + "' released while up");
            }
            else {
                dwell = time - pressTime[key];
                modCapture["dwell"][key].push(dwell);
                for (var j = 0; j < C["metagroups"].length; j++) {
                    modCapture["gdwell"][j][groups[j]].push(dwell);
                }

                lastReleased["key"] = key;
                lastReleased["groups"] = groups;
                lastReleased["time"] = time;
                pressed[key] = false;
            }
        }
    }

    // Raw flight times
    for (var i = 1; i < releases.length; i++) {
        [rkey, rtime, rgroups] = releases[i-1];
        [pkey, ptime, pgroups] = presses[i];
        var flight = ptime - rtime;

        if (flight <= C["modCapture_maxflight"]) {
            modCapture["flight"][rkey][pkey].push(flight);
            for (var j = 0; j < C["metagroups"].length; j++) {
                modCapture["gflight"][j][rgroups[j]][pgroups[j]].push(flight);
            }
        }
    }

    // Shift dwell times
    if (C["modCapture_shift"]) {
        // Dwell times
        pressed = false;
        pressTime = 0;
        for (var i = 0; i < modCapture["rawshift"].length; i++) {
            [down, time] = modCapture["rawshift"][i];
            if (down) {
                if (pressed) {
                    logMsg(STRINGS["logErrr"] + "Shift pressed while down");
                } 
                pressTime = time;
                pressed = true;
            }
            else {
                if (! pressed) {
                    logMsg(STRINGS["logErrr"] + "Shift pressed while down");
                } 
                dwell = time - pressTime;
                modCapture["dwellshift"].push(dwell);
                pressed = false;
            }  
        }

        // Dwell numerus, average, standard deviation
        modCapture["dwelloshift"] = modCapture.sumObjsFromTimes(modCapture["dwellshift"]);
    }

    // Dwell numerus, average, standard deviation and accumulated
    modCapture["dwello"] = modCapture.listSumStat(modCapture["dwell"]);
    modCapture["gdwello"] = modCapture.listSumStat(modCapture["gdwell"]);
    modCapture["adwello"] = modCapture.listSumStat(arrayReduce(modCapture["dwell"]));

    // Flight numberus, average, standard deviation and accumulated
    modCapture["flighto"] = modCapture.listSumStat(modCapture["flight"]);
    modCapture["gflighto"] = modCapture.listSumStat(modCapture["gflight"]);
   
    var reduced_flipped_flight = arrayFlip(modCapture["flight"]).map(arrayReduce);
    modCapture["aflighto"] = modCapture.listSumStat(reduced_flipped_flight);
    modCapture["aaflighto"] = modCapture.listSumStat(arrayReduce(arrayReduce(modCapture["flight"])));

    var reduced_flipped_gflight = [];
    for (var i = 0; i < C["metagroups"].length; i++) {
        reduced_flipped_gflight[i] = arrayFlip(modCapture["gflight"][i]).map(arrayReduce);
        modCapture["agflighto"][i] = modCapture.listSumStat(reduced_flipped_gflight[i]);
    }

    // Draw overlay and summary
    modCapture["analyzed"] = true;
    modCapture.overlay();
    modCapture.summary();
}

// Return numerus, average and standard deviation objects at arbitrary depth
modCapture.listSumStat  = function (list) {
    return modCapture.listSumStatRecursive(list.slice());
}

// Recursive helper for listSumStat
modCapture.listSumStatRecursive = function (list) {
    if (Array.isArray(list[0])) {
        for (var i = 0; i < list.length; i++) {
            list[i] = modCapture.listSumStatRecursive(list[i].slice());
        }
    }
    else {
        list = modCapture.sumObjsFromTimes(list);
    }
    return list;
}

// Return numerus, average and standard deviation for each list in a list
modCapture.sumObjsFromTimeLists = function (list) {
    var summaryobjs = [];
    for (var i = 0; i < list.length; i++) {
        summaryobjs.push(modCapture.sumObjsFromTimes(list[i]));
    }
    return summaryobjs;
}

// Return numerus, average and standard deviation of list
modCapture.sumObjsFromTimes = function (list) {
    var n = list.length;
    if (n > 0) {
        var m = round(arrayAverage(list));
        var sd = round(arrayStandardDeviation(list));
    }
    else {
        var m = 0;
        var sd = 0;
    }
    return {n: n, m: m, sd: sd};
}


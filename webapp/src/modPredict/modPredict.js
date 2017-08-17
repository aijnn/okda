// ################################
// # Module object                #
// ################################

modPredict = {
    // Status
    finished: false,
    nnloaded: false,
    report: []
}

// ################################
// # Initialization               #
// ################################

// Initialize module
modPredict.init = function () {
    modPredict.initElements();
    modPredict.summary();
}

// Initialize module elementa
modPredict.initElements = function () {
    initContainers("modPredict", ["rside","overlay"]);
}

// ################################
// # Containers                   #
// ################################

// Summary
modPredict.summary = function () {
    var npredicted = (modPredict["report"].length == 0)? "No predictions" : modPredict["report"].length + " predictions";
    var html = "";

    for (var i = 0; i < modPredict["report"].length; i++) {
        if (i == 0) html += "<div id='modPredict_predictions'>";

        report = modPredict["report"][i];
        html += "<div class='dimension'>" +
            rpad(report["title"].substr(0,14) + ": ", 16) +
            rpad(report["labels"][report["group"]], 8) + " " +
            "(" + report["probabilities"].map(x => lpad(x.toFixed(2),5)).join("%, ") + "%)" +
            "</div>";

        if (i == modPredict["report"].length - 1) html += "</div>";
    }

    html += "</div>" +
        "<div id='modPredict_npredicted' class='modPredict_right pointer success'>" + npredicted + "</div>" +
        "<div id='modPredict_button' class='modPredict_right pointer warning' onclick='modPredict.start();'>Predict</div>" +
        "<div class='clear'></div>";

    setHtml(W["modPredict_statbox"], html);
    modPredict.overlay();
}

// Overlay
modPredict.overlay = function () {
    var html = "<h1>Predictions</h1>";

    if (modPredict["report"].length == 0) {
        html += "No predictions."; 
    }

    for (var i = 0; i < modPredict["report"].length; i++) {
        report = modPredict["report"][i];
        html += "<h2>" + report["title"] + "</h2>";
        
        for (var j = 0; j < report["probabilities"].length; j++) {
            var prob = report["probabilities"][j];
            var name = rpad(report["labels"][j], 8);

            if (report["group"] == j) {
                var name = "<strong class='tsuccess'>" + name + "</strong>";
                var cls = "success";
            }
            else {
                var cls = "message";
            }

            html += "<div class='dimension'>" +
                "<div class='name'>" +
                "&boxur;&boxh; " + name + "&nbsp" + lpad(prob.toFixed(2),5) + " %" +
                "</div>" +
                "<div class='progress_bar failure'>" +
                "<div class='progress_score " + cls + "' style='width:" + Math.round(prob) + "%'></div>" +
                "</div>" + 
                STRINGS["clrBoth"] +
                "</div>";
        }
    }

    modPredict.finished = (modPredict["report"].length > 0);
    markActive("modPredict", modPredict["finished"]);
    setHtml(W["modPredict_overlay"], html);
}

// ################################
// # Functions                    #
// ################################

// Load weights and predict everything
modPredict.start = function () {
    if (modPredict.nnloaded) {
        modPredict.predictall();
    }
    else {
        modPredict.loadnn();
    }
}

// Load weights from external file
modPredict.loadnn = function () {
    includeJs(C["modPredict_nnfile"], function () {
        modPredict.nnloaded = true;
        modPredict.predictall()
    });
}

// Predict everything
modPredict.predictall = function () {
    // Get incput
    var input = modPredict.getData();
    if (input === false) return;

    // Helper function for predicting dimension
    function predictGroup (v, nested = false) {
        for (var i = 0; i < C["modPredict_" + v].length; i++) {
            var group = C["modPredict_" + v][i];
            if (nested) {
                for (var j = 0; j < group.length; j++) {
                    var dimension = group[j];
                    var layers = nn[v][i][dimension["name"]];
                    report.push(Object.assign(modPredict.predict(input, layers), dimension));
                }
            }
            else {
                var layers = nn[v][group["name"]];
                report.push(Object.assign(modPredict.predict(input, layers), group));
            }
        }
    }

    // Predict binfields, numfields, binary scales, likert scales
    var report = [];
    predictGroup("binfields");
    predictGroup("numfields");
    predictGroup("scales", true);
    predictGroup("lscales", true);

    modPredict.report = report;
    modPredict.summary();
}

// Predict variable based on performed or replayed input and report result
modPredict.predict = function (input, layers) {
    var result = modPredict.eval(input, layers);
    var probabilities = result.map(y => Math.round(y * 1000) / 10);
    var group = arrayMaxIndex(result);
    return {group: group, probabilities: probabilities};
}

// Evaluate neural network with given input and layers (weights, biases) and apply softmax
modPredict.eval = function (input, layers) {
    r = input.slice()
    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        var weights = layer[0];
        var biases = layer[1];

        r = matrixMultiply([r], weights);
        r = vectorSum(r[0], biases);

        if (i < layers.length - 1) {
            r = r.map(modPredict.activation);
        }
        console.log(r)
    }
    return modPredict.softmax(r);
}

// Calculate neuron activation (this is PoC, should be changed to whatever function was used for training)
modPredict.activation = function (value) {
    return Math.max(0, value);
}

// Calculate softmax of array
modPredict.softmax = function (lst) {
    // Cheating is better than NaN
    if (lst[0] > lst[1] + 1000) {
        return [1, 0];
    }
    else if (lst[0] < lst[1] - 1000) {
        return [0, 1];
    }

    // Center values around 0
    var med = lst.reduce((a,b) => a+b) / lst.length;
    lst = lst.map(a => a - med);

    // Calculate softmax
    var base = lst.map(y => Math.exp(y)).reduce((a, b) => a + b);
    return result = lst.map((a) => Math.exp(a) / base); 
}

// Get modSave data for prediction
modPredict.getData = function () {
    var headers = [];
    var data = [];

    // Load data
    switch (C["modPredict_source"]) {
        case "modSave":
            if (C["modules"].indexOf("modSave") == -1) {
                // This method requires modSave to be loaded (but not necessarily enabled)
                logMsg(STRINGS["logErrr"] + "Load 'modSave' or change 'modPredict' source");
                return false;
            }
            else if (C["modText"] && modText["running"]) {
                // Can't predict while modText is running
                logMsg(STRINGS["logWarn"] + "Can't predict while running, stop first");
                return false;
            }
            else if (C["modText"] && (! modText["finished"])) {
                // Can't predict if modText is not finished
                logMsg(STRINGS["logWarn"] + "Can't predict yet, finish writing first");
                return false;
            }
            else {
                modSave.csvCaptureAnalyzed(headers, data);
            }
            break;
        default:
            logMsg(STRINGS["logErrr"] + "Unsupported method '" + C["modPredict_source"] + "' for collecting prediction data");
            return false;
    }
    
    // Prepare fields
    var input = [];
    for (var i = 0; i < C["modPredict_headers"].length; i++) {
        var header = C["modPredict_headers"][i];
        var pos = headers.indexOf(header);

        if (pos == -1) {
            // Expected configuration header is missing in obtained data
            logMsg(STRINGS["logWarn"] + "Missing header '" + header + "'");
        }
        else {
            input.push(data[pos]); 
        }
    }
    
    // Check if all fields are loaded
    if (input.length != C["modPredict_headers"].length) {
        var missing = C["modPredict_headers"].length - input.length;
        logMsg(STRINGS["logErrr"] + missing + "/" + C["modPredict_headers"].length + " headers are missing");
        return false;
    }

    // Return fields 
    return input;
}

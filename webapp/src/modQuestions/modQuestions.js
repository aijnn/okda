// ################################ 
// # Module object                #
// ################################ 

modQuestions = {
    // Status
    finished: false,
    analyzed: false,
    
    // Variables
    binvals: {},
    numvals: {},

    // Yes / no and likert scales
    scales: [],
    lscales: [],

    // Analysis
    answered: 0,
    total: 0,
    
    // Element classes
    notanswered: "failure",
    selected: "success",
    notselected: "offline",
    goodval: "success",
    badval: "warning",

    // Elements
    eles: []
}

// ################################ 
// # Initialization               #
// ################################ 

// Initialize module
modQuestions.init = function () {
    modQuestions["scales"] = C["modQuestions_scales"];
    modQuestions["lscales"] = C["modQuestions_lscales"];
    modQuestions.initElements();
    modQuestions.reset();
}

// Initialize module elements
modQuestions.initElements = function () {
    initContainers("modQuestions", ["content","rside","overlay","progress"]);
}

// Initialize elements from queue
modQuestions.initQueue = function () {
    for (var i = 0; i < modQuestions["eles"].length; i++) {
        initElement(modQuestions["eles"][i]["name"], modQuestions["eles"][i]["type"]);
    }
    modQuestions["eles"] = [];
}

// ################################ 
// # Containers                   #
// ################################ 

// Main content
modQuestions.main = function () {
    // Prepare demographic part, true/false sccales and likert scales
    var html = modQuestions.htmlDemo() +
        modQuestions.mainScales(modQuestions["scales"], "boolean") +
        modQuestions.mainScales(modQuestions["lscales"], "likert");

    // Draw the questionnaire
    setHtml(E["modQuestions_main"], html);
}

// Main content - add scale
modQuestions.mainScales = function (scales, type = "boolean") {
    var html = "";
    for (i = 0; i < scales.length; i++) {
        if (scales[i]["enabled"]) {
            html += modQuestions.htmlScale(scales[i], i, type);
        }
    }
    return html;
}

// Summary
modQuestions.summary = function () {
    var summary = "<div class='scalesum'>" +
        "<div class='dimension'>" +
        modQuestions.dimensionBar("Answered", modQuestions["answered"], modQuestions["total"]) +
        modQuestions.progressBar(modQuestions["answered"] / modQuestions["total"]) +
        STRINGS["clrBoth"] +
        "</div>" +
        "</div>";

    if (modQuestions["analyzed"]) {
        summary += modQuestions.scalesSummaries();
    }

    setHtml(W["modQuestions_statbox"], summary);
    markDone("modQuestions", modQuestions["finished"]);
}

// Summary - summaries of scales (true/false and likert) 
modQuestions.scalesSummaries = function () {
    var html = modQuestions.scalesSummary(modQuestions["scales"]) +
        modQuestions.scalesSummary(modQuestions["lscales"]);
    return html;
}

// Summary - summary of group of scales (true/false or likert)
modQuestions.scalesSummary = function (scales) {
    var html = "";
    for (var i = 0; i < scales.length; i++) {
        if (scales[i]["enabled"]) {
            html += modQuestions.scaleSummary(scales[i]);
        }
    }
    return html;
}

// Summary - summary of a single scale
modQuestions.scaleSummary = function (scale) {
    html = "<div class='scalesum'>";
    for (var key in scale["dimensions"]) {
        if (scale["dimensions"].hasOwnProperty(key)) {
            var dimension = scale["dimensions"][key];
            if (dimension["enabled"]) {
                relativeScore = dimension["score"] - dimension["min"];
                relativeRange = dimension["max"] - dimension["min"];
                html += "<div class='dimension'>" +
                    modQuestions.dimensionBar(dimension["name"], relativeScore, relativeRange) + 
                    modQuestions.progressBar(relativeScore / relativeRange) +
                    STRINGS["clrBoth"] +
                    "</div>";
            }
        }
    }
    html += "</div>";
    return html;
}

// Summary - dimension name
modQuestions.dimensionBar = function (name, value, total, strpad = 13, valpad = 2) {
    return "<div class='name'>" +
        rpad(name, strpad) + " " + lpad(value, valpad) + "/" + lpad(total, valpad) +
        "</div>";
}

// Summary - dimension progress bar
modQuestions.progressBar = function (value) {
    var percent = Math.round(100 * value);
    return "<div class='progress_bar failure'>" + 
        "<div class='progress_score success' style='width:" + percent + "%;'> </div>" +
        "</div>";
}

// Overlay
modQuestions.overlay = function () {
    var html = "<h1>Questionnaire analysis</h1>";

    if (modQuestions["analyzed"]) {
        // Display binary scales
        html += modQuestions.overlayScales("scales");

        // Display likert scales
        html += modQuestions.overlayScales("lscales");
    }
    else {
        html += "<p>Analysis wasn't performed yet, finish questionnaire first.</p>";
    }

    // Output HTML
    setHtml(W["modQuestions_overlay"], html);
    markActive("modQuestions", modQuestions["analyzed"]);
}

modQuestions.overlayScales = function (scales) {
    function sumTr (name, content) {
        return "<tr class='mark'>" +
            "<td>#</td>" +
            "<td class='modQuestions_content'>" + name + "</td>" +
            "<td colspan='2'>" + content + "</td>" +
            "</tr>";
    }

    var html = "";

    // Go over all scales
    for (var i = 0; i < modQuestions[scales].length; i++) {
        // Check if scale is enabled
        if (modQuestions[scales][i]["enabled"]) {
            var scale = modQuestions[scales][i];
            html += "<h2>" + scale["name"] + "</h2>";
    
            // Calculate breakpoints for colors
            if (scales == "lscales") {
                var medval = scale["nanswers"] / 3;
                var bigval = medval * 2;
            }

            // Go over all dimensions
            for (key in scale["dimensions"]) {
                // Check if dimension is enabled
                if (scale["dimensions"].hasOwnProperty(key) &&
                    scale["dimensions"][key]["enabled"]) {
                    var dimension = scale["dimensions"][key];
                    var id = 0;

                    // Generate table header
                    html += "<h3>" + dimension["name"] + "</h3>" +
                        "<table>" +
                        trTitles(["#", "Question", "Answer", "Points"]);
                    
                    // Go over scale items
                    for (var j = 0; j < scale["items"].length; j++) {
                        var item = scale["items"][j];
                        if (item["dimension"] == key) {
                            var selected = scale["selected"][j];

                            // Calculate points
                            if (scales == "scales") {
                                var points = (selected - item["answer"]) == 0;
                            }
                            else if (scales == "lscales") {
                                var points = selected * item["multiplier"];
                            }

                            html += "<tr>" +
                                "<td>" + id + "</td>" +
                                "<td class='modQuestions_content'>" + item["content"] + "</td>";

                            if (scales == "scales") {
                                html += tdBool(scale["selected"][j]) +
                                    tdBool(points);
                            }
                            else if (scales == "lscales") {
                                html += tdVal(scale["selected"][j], medval, bigval, "message", "success") +
                                    tdVal(points, medval, bigval, "message", "success", true);
                            }

                            html += "</tr>";
                            id++;
                        }
                    }

                    // Generate table summary
                    if (scales == "scales") {
                        html += sumTr("Summary", dimension["score"] + " / " + dimension["max"]);
                    }
                    else if (scales == "lscales") {
                        html += sumTr("Base", dimension["base"]) +
                            sumTr("Range", dimension["min"] + " - " + dimension["max"]) +
                            sumTr("Raw score", dimension["score"]) +
                            sumTr("Adjusted score", (dimension["score"] - dimension["min"]) + " / " + (dimension["max"] - dimension["min"]))
                    }
                    html += "</table>";
                }
            }
        }
    }
    return html;
}

// ################################ 
// # Functions                    #
// ################################ 

// Reset questionnaire
modQuestions.reset = function () {
    // Reset demographic data
    for (var i = 0; i < C["modQuestions_binfields"].length; i++) {
        modQuestions["binvals"][C["modQuestions_binfields"][i]["name"]] = false;
    }
    for (var i = 0; i < C["modQuestions_numfields"].length; i++) {
        modQuestions["numvals"][C["modQuestions_numfields"][i]["name"]] = 0;
    }

    // Reset scales
    modQuestions.resetScales();

    // Reset variables
    modQuestions["answered"] = 0;
    modQuestions["finished"] = false;
    modQuestions["analyzed"] = false;

    // Calculate number of questions
    modQuestions["total"] = C["modQuestions_binfields"].length +
        C["modQuestions_numfields"].length +
        modQuestions.countScales(modQuestions["scales"]) +
        modQuestions.countScales(modQuestions["lscales"]);

    // Draw everything and initialize elements
    modQuestions.main();
    modQuestions.summary();
    modQuestions.overlay();
    modQuestions.initQueue();
}

// Count scale length
modQuestions.countScales = function (scales) {
    var total = 0;
    for (var i = 0; i < scales.length; i++) {
        if (scales[i]["enabled"]) {
            var scale = scales[i];
            for (var key in scale["dimensions"]) {
                if (scale["dimensions"].hasOwnProperty(key) && scale["dimensions"][key]["enabled"]) {
                    total += scale["dimensions"][key]["nitems"];
                }
            }
        }
    }
    return total;
}

// Reset questionnaire scales
modQuestions.resetScales = function () {
    var metascales = ["scales", "lscales"];
    for (var i = 0; i < metascales.length; i++) {
        var scales = metascales[i];
        for (var j = 0; j < modQuestions[scales].length; j++) {
            var scale = modQuestions[scales][j];

            for (key in scale["dimensions"]) {
                if (scale["dimensions"].hasOwnProperty(key)) {
                    modQuestions[scales][j]["dimensions"][key]["nitems"] = 0;
                    if (scales == "scales") {
                        modQuestions[scales][j]["dimensions"][key]["min"] = 0;
                        modQuestions[scales][j]["dimensions"][key]["max"] = 0;
                    }
                    else if (scales == "lscales") {
                        modQuestions[scales][j]["dimensions"][key]["min"] = scale["dimensions"][key]["base"];
                        modQuestions[scales][j]["dimensions"][key]["max"] = scale["dimensions"][key]["base"];
                    }
                }
            }

            modQuestions[scales][j]["selected"] = arrayConstruct(false, [scale["items"].length]);

            for (var k = 0; k < scale["items"].length; k++) {
                var item = scale["items"][k];
                var dimension = item["dimension"];

                modQuestions[scales][j]["dimensions"][dimension]["nitems"]++;

                // Calculate binary scale maximum
                if (scales == "scales") {
                    modQuestions[scales][j]["dimensions"][dimension]["max"]++;
                }

                // Calculate likert scale maximum
                else if (scales == "lscales") {
                    var multiplier = item["multiplier"];
                    if (multiplier > 0) {
                        // If multiplier is positive, add minimum answer to min and maximum answer to max
                        modQuestions[scales][j]["dimensions"][dimension]["min"] += multiplier;
                        modQuestions[scales][j]["dimensions"][dimension]["max"] += multiplier * scale["nanswers"];
                    }
                    else if (multiplier < 0) {
                        // If multiplier is negative, add maximum answer to min and minimum answer to max
                        modQuestions[scales][j]["dimensions"][dimension]["min"] += multiplier * scale["nanswers"];
                        modQuestions[scales][j]["dimensions"][dimension]["max"] += multiplier;
                    }
                }
            }
        }
    } 
}

// Generate demographic part of questionnaire
modQuestions.htmlDemo = function () {
    var html = "";

    // Binary fields
    for (var i = 0; i < C["modQuestions_binfields"].length; i++) {
        html += modQuestions.htmlBinaryQuestion(C["modQuestions_binfields"][i]);
    }
    html += "<div class='clear'></div>";

    // Numeric fields
    for (var i = 0; i < C["modQuestions_numfields"].length; i++) {
        html += modQuestions.htmlNumQuestion(C["modQuestions_numfields"][i]);
    }
    html += "<div class='clear'></div>";
    html = modQuestions.wrapQuestionGroup(html);

    return html;
}

// Generate questionnaire scale (true/false or likert)
modQuestions.htmlScale = function (scale, id, type = "boolean", autoinit = true) {
    var html = "<div class='intro nonmono'>" + scale["intro"] + "</div>";
    var count = 1;
    for (var i = 0; i < scale["items"].length; i++) {
        var item = scale["items"][i];
        if (scale["dimensions"][item["dimension"]]["enabled"]) {
            if (type == "boolean") {
                html += modQuestions.htmlScaleBooleanQuestion (id, i, count, item["content"], autoinit);
            }
            else {
                html += modQuestions.htmlScaleLikertQuestion (id, i, count, item["content"], scale["nanswers"], autoinit);
            }
            html += "<div class='clear'></div>";
            count++;
        }
    }
    return modQuestions.wrapQuestionGroup(html);
}

// Wrap question in div with class question
modQuestions.wrapQuestion = function (html) {
    return wrapHtml(html, "question");
}

// Wrap question group in div with class questiongroup
modQuestions.wrapQuestionGroup = function (html) {
    return wrapHtml(html, "questiongroup");
}

// Generate question with two answers
modQuestions.htmlBinaryQuestion = function (field, autoinit = true) {
    var html = "<div class='title elem first message'>" + field["title"] + "</div>";
    var ids = ["modQuestions_" + field["name"] + "_0", "modQuestions_" + field["name"] + "_1"];
    for (var i = 0; i < ids.length; i++) {
        if (autoinit) {
            modQuestions["eles"].push({name: ids[i], type: "element"});
        }
    }
    html += "<div id='" + ids[0] + "' class='item elem pointer " + modQuestions["notanswered"] + "' onclick='modQuestions.selectBin(\"" + field["name"] + "\", 1);'>" + field["yes"] + "</div>";
    html += "<div id='" + ids[1] + "' class='item elem pointer last " + field["cls"] + " " + modQuestions["notanswered"] + "' onclick='modQuestions.selectBin(\"" + field["name"] + "\", 0);'>" + field["no"] + "</div>";
    return modQuestions.wrapQuestion(html);
}

// Generate yes/no scale question 
modQuestions.htmlScaleBooleanQuestion = function (scale, field, count, name, autoinit = true) {
    // Init generated elements
    var ids = ["modQuestions_" + scale + "_" + field + "_0", "modQuestions_" + scale + "_" + field + "_1"];
    if (autoinit) {
        for (var i = 0; i < ids.length; i++) {
            modQuestions["eles"].push({name: ids[i], type: "element"});
        }
    }
    
    // Generate question
    var html = "<div class='desc elem nonmono first'>" + count + ". " + name + "</div>";

    // Generate answers
    html += "<div id='" + ids[0] + "' " +
        "class='yn elem pointer " + modQuestions["notanswered"] + "' " +
        "onclick='modQuestions.selectScaleBoolean(" + scale + ", " + field + ", 1);'>" +
        C["modQuestions_yes"] + "</div>";
    html += "<div id='" + ids[1] + "' " +
        "class='yn elem pointer last " + modQuestions["notanswered"] + "' " +
        "onclick='modQuestions.selectScaleBoolean(" + scale + ", " + field + ", 0);'>" +
        C["modQuestions_no"] + "</div>";

    // Return question
    return modQuestions.wrapQuestion(html);
}

// Generate likert scale question 
modQuestions.htmlScaleLikertQuestion = function (scale, field, count, name, nanswers = 5, autoinit = true) {
    // Init generated elements
    var ids = [];
    for (var i = 0; i < nanswers; i++) {
        ids.push("modQuestions_l" + scale + "_" + field + "_" + i);
        if (autoinit) {
            modQuestions["eles"].push({name: ids[i], type: "element"});
        }
    }

    // Generate question
    var width = 800 - 13 - (nanswers * 53);
    var html = "<div class='ldesc elem nonmono first' style='width:" + width + "px'>" + count + ". " + name + "</div>";

    // Generate answers
    for (var i = 0; i < ids.length; i++) {
        var cls = (i == ids.length - 1)? "last " : "";
        var ans = i + 1;
        html += "<div id='" + ids[i] + "' " +
            "class='yn elem pointer " + cls +  modQuestions["notanswered"] + "' " +
            "onclick='modQuestions.selectScaleLikert(" + scale + ", " + field + ", " + ans + ");'>" +
            ans + "</div>";
    }

    // Return question
    return modQuestions.wrapQuestion(html);
}

// Generate question with numeric input
modQuestions.htmlNumQuestion = function (field, name, placeholder = "", maxlen = 64, lastcls = "", autoinit = true) {
    var id = "modQuestions_num_" + field["name"];
    if (autoinit) {
        modQuestions["eles"].push({name: id, type: "element"});
    }
    var html = "<div class='title elem first message'>" + field["title"] + "</div>" +
        "<input id='modQuestions_num_" + field["name"] + "' " +
        "type='text' " + 
        "class='item elem last pointer " + field["cls"] + "' " +
        "maxlength='" + field["maxlen"] + "' " +
        "placeholder='" + field["placeholder"] + "' " +
        "onblur='modQuestions.updateNum(\"" + field["name"] + "\");'>";
    return modQuestions.wrapQuestion(html);
}

// ################################ 
// # Functions                    #
// ################################ 

// Analyze questionnaire answers
modQuestions.analyze = function () {
    // Binary scales
    for (var i = 0; i < modQuestions["scales"].length; i++) {
        var scale = modQuestions["scales"][i];

        // Reset scale scores
        for (var key in scale["dimensions"]) {
            if (scale["dimensions"].hasOwnProperty(key)) {
                modQuestions["scales"][i]["dimensions"][key]["score"] = 0;
            }
        }

        // Accumulate scale scores
        for (var j = 0; j < scale["items"].length; j++) {
            var item = scale["items"][j];
            var dimension = item["dimension"];
            if (scale["dimensions"][dimension]["enabled"] && scale["selected"][j] == item["answer"]) {
                modQuestions["scales"][i]["dimensions"][dimension]["score"]++;
            }
        }
    }

    // Likert scales
    for (var i = 0; i < modQuestions["lscales"].length; i++) {
        var scale = modQuestions["lscales"][i];

        // Reset scale scores
        for (var key in scale["dimensions"]) {
            if (scale["dimensions"].hasOwnProperty(key)) {
                modQuestions["lscales"][i]["dimensions"][key]["score"] = scale["dimensions"][key]["base"];
            }
        }

        // Accumulate scale scores
        for (var j = 0; j < scale["items"].length; j++) {
            var item = scale["items"][j];
            var dimension = item["dimension"];
            if (scale["dimensions"][dimension]["enabled"]) {
                modQuestions["lscales"][i]["dimensions"][dimension]["score"] += scale["selected"][j] * item["multiplier"];
            }
        }
    }

    modQuestions["analyzed"] = true;
    modQuestions.summary();
    modQuestions.overlay();
}

// Update number of answered questions
modQuestions.updateNumbers = function () {
    var answered = 0;

    // Count number of answered binary questions
    for (var i = 0; i < C["modQuestions_binfields"].length; i++) {
        if (modQuestions["binvals"][C["modQuestions_binfields"][i]["name"]] !== false) answered++;
    }
    
    // Count number of answered numeric questions
    for (var i = 0; i < C["modQuestions_numfields"].length; i++) {
        if (modQuestions["numvals"][C["modQuestions_numfields"][i]["name"]] > 0) answered++;
    }

    // Count number of yes/no scale questions
    for (var i = 0; i < modQuestions["scales"].length; i++) {
        for (var j = 0; j < modQuestions["scales"][i]["selected"].length; j++) {
            if (modQuestions["scales"][i]["selected"][j] !== false) answered++;
        }
    }

    // Count number of likert scale questions
    for (var i = 0; i < modQuestions["lscales"].length; i++) {
        for (var j = 0; j < modQuestions["lscales"][i]["selected"].length; j++) {
            if (modQuestions["lscales"][i]["selected"][j] !== false) answered++;
        }
    }

    // Analyze results if all questions have been answered
    modQuestions["answered"] = answered;
    if (modQuestions["answered"] == modQuestions["total"]) {
        modQuestions["finished"] = true;
        logMsg(STRINGS["logSucc"] + "Questionnaire finished");
        modQuestions.analyze();

        // Check if everything is finished and thank the user
        moduleCallFirst("thankyou");
    }

    modQuestions.summary();
}

// Select option of binary question
modQuestions.selectBin = function (field, value) {
    if (arrayProperty(C["modQuestions_binfields"], "name").indexOf(field) == -1) {
        logMsg(STRINGS["logErrr"] + "Setting invalid binary field '" + field + "'");
    }
    else {
        modQuestions["binvals"][field] = value;
        modQuestions.flipFieldsBinary(field, value);
        modQuestions.updateNumbers();
    }
}

// Select option of yes/no scale question
modQuestions.selectScaleBoolean = function (scale, field, value) {
    modQuestions.selectScale("scales", scale, field, value);
}

// Select option of likert scale question
modQuestions.selectScaleLikert = function (scale, field, value) {
    modQuestions.selectScale("lscales", scale, field, value);
}

// Select option of likert or yes/no scale question
modQuestions.selectScale = function (scales, scale, field, value) {
    if ((scale >= modQuestions[scales].length) || (field >= modQuestions[scales][scale]["items"].length)) {
        logMsg(STRINGS["logErrr"] + "Setting invalid scales '" + scales + "' scale '" + scale + "'field '" + field + "'");
    }
    else {
        modQuestions[scales][scale]["selected"][field] = value;
        if (scales == "scales") {
            modQuestions.flipFieldsBinary(scale + "_" + field, value);
        }
        else if (scales == "lscales") {
            modQuestions.flipFieldsLikert("l" + scale + "_" + field, value, modQuestions["lscales"][scale]["nanswers"]);
        }
        modQuestions.updateNumbers();
    }
}

// Flip selected and not selected fields of a binary or scale question
modQuestions.flipFieldsBinary = function (field, t) {
    remClass(E["modQuestions_" + field + "_" + Math.abs(t - 1)], modQuestions["notanswered"]);
    remClass(E["modQuestions_" + field + "_" + t], modQuestions["notanswered"]);
    remClass(E["modQuestions_" + field + "_" + Math.abs(t - 1)], modQuestions["notselected"]);
    remClass(E["modQuestions_" + field + "_" + t], modQuestions["selected"]);
    addClass(E["modQuestions_" + field + "_" + Math.abs(t - 1)], modQuestions["selected"]);
    addClass(E["modQuestions_" + field + "_" + t], modQuestions["notselected"]);
}

// Flip selected and not selected fields of a likert or scale question
modQuestions.flipFieldsLikert = function (field, t, len) {
    for (var i = 0; i < len; i++) {
        remClass(E["modQuestions_" + field + "_" + i], modQuestions["notanswered"]);
        if (t == i + 1) {
            remClass(E["modQuestions_" + field + "_" + i], modQuestions["notselected"]);
            addClass(E["modQuestions_" + field + "_" + i], modQuestions["selected"]);
        }
        else {
            remClass(E["modQuestions_" + field + "_" + i], modQuestions["selected"]);
            addClass(E["modQuestions_" + field + "_" + i], modQuestions["notselected"]);
        }
    }
}

// Update number question after user changes it
modQuestions.updateNum = function (field) {
    if (arrayProperty(C["modQuestions_numfields"], "name").indexOf(field) == -1) {
        logMsg(STRINGS["logErrr"] + "Setting invalid integer field '" + field + "'");
    }
    else {
        modQuestions["numvals"][field] = getInteger(E["modQuestions_num_" + field].value); 
        remClass(E["modQuestions_num_" + field], modQuestions["badval"]);
        remClass(E["modQuestions_num_" + field], modQuestions["goodval"]);
        if (modQuestions["numvals"][field] > 0) {
            addClass(E["modQuestions_num_" + field], modQuestions["goodval"]);
        }
        else {
            addClass(E["modQuestions_num_" + field], modQuestions["badval"]);
        }
        modQuestions.updateNumbers();
    }
}

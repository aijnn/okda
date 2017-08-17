// ################################
// # Global variables             #
// ################################ 

// State of application
S = {
    loadlist: [],
    nenabled:  0,
    logEmpty: true,
    rsideOn: true,
};

// Elements saved by id
E = {
    content: false,
    rside: false,
    rsidemodules: false,
    overlay: false,
    rtoggle: false,
    log: false,
    actions: false,
    progress: false,
    modQuestions_done: false,
    modText_done: false,
    modSave_done: false
}

// Text containers saved by id (prefixed by "w_")
W = {
    log: false,
    status: false,
    progress: false
};

// Static strings
STRINGS = {
    logSucc: "<span class='tsuccess'>[SUCC]</span> ",
    logStat: "<span class='tmessage'>[STAT]</span> ",
    logWarn: "<span class='twarning'>[WARN]</span> ",
    logErrr: "<span class='tfailure'>[ERRR]</span> ",
    clrBoth: "<div class='clear'></div>"
};

// ################################
// # Initialization               #
// ################################ 

// Load source files
function load () {
    // Initialize elements and chars
    initElements();
    initChars();

    // Load module source files
    logMsg(STRINGS["logStat"] + "Loading " + C["modules"].length + " modules...");
    for (var i = 0; i < C["modules"].length; i++) {
        var mod = C["modules"][i];
        if (C[mod]) {
            var srcCss = "src/" + mod + "/" + mod + ".css";
            var srcJs = "src/" + mod + "/" + mod + ".js";
            S["loadlist"].push(srcCss, srcJs);
            includeCss(srcCss, (function (s) {return function () {confirmLoad(s)}})(srcCss));
            includeJs(srcJs, (function (s) {return function () {confirmLoad(s)}})(srcJs));
        }
    }
}

// Confirm loaded file and init if everything is loaded
function confirmLoad (name) {
    var pos = S["loadlist"].indexOf(name);

    if (pos >= 0) {
        // Confirm module is loaded
        S["loadlist"].splice(pos, 1);

        // If loadlist is empty, init
        if (S["loadlist"].length == 0) {
           init(); 
        }
    }
    else {
        // Trying to confirm file that is not on the list
        logMsg(STRINGS["logWarn"] + "File '" + name + "' was loaded, but we are not waiting for it");
    }
}

// Initialize application
function init () {
    // Count enabled modules
    S["nenabled"] = C["modules"].reduce((a,b) => (C[C["modules"][b]])? ++a : a, 0);

    // Initialize modules
    logMsg(STRINGS["logStat"] + "Starting with " + S["nenabled"] + " modules...");
    for (var i = 0; i < C["modules"].length; i++) {
        var mod = C["modules"][i];
        if (C[mod]) {
            logMsg(STRINGS["logStat"] + "Starting '" + mod + "'...");
            window[mod]["init"]();
            logMsg("Done", " ");
        }
        else {
            logMsg(STRINGS["logWarn"] + "Skipping '" + mod + "'");
        }
    }

    // Handle autostarts
    for (var i = 0; i < C["modules"].length; i++) {
        var mod = C["modules"][i];
        if (C[mod] && C[mod + "_autostart"]) {
            window[mod]["start"]();
        }
    }

    setStatus("Ready", "success");
    logMsg(STRINGS["logSucc"] + "Done");
}

// Load elements saved in array
function initElementsFromArray (a, name) {
    for (var key in a) {
        if (a.hasOwnProperty(key)) initElement(key, name);
    }
}

// Load elements saved in "E" and "W" arrays
function initElements () {
    initElementsFromArray(E, "element");
    initElementsFromArray(W, "writable");
}

// Load element by id to "E" or "W" array
function initElement (name, holder) {
    switch (holder) {
        case "element":
            E[name] = document.getElementById(name);
            break;
        case "writable":
            W[name] = document.getElementById("w_" + name);
            break;
        default:
            logMsg(STRINGS["logErrr"] + "Can't place element '" + name + "' in invalid holder '" + holder + "'.");
    }
}

// Generate character lists from configuration
function initChars () {
    // Prepare characters
    C["chars"] = arraySorted(C["chars"]);
   
    // Check and prepare classifications of character groups
    for (var i = 0; i < C["metagroups"].length; i++) {
        var metagroup = C["metagroups"][i];
        var count = 0;
        for (var j = 0; j < metagroup["groups"].length; j++) {
            var group = metagroup["groups"][j];
            C["metagroups"][i]["groups"][j]["chars"] = arraySorted(group["chars"]);
            count += C["metagroups"][i]["groups"][j]["chars"].length;
        }
        if (count != C["chars"].length) {
            logMsg(STRINGS["logWarn"] + "Expected '" + metagroup["name"] + "' groups to contain '" + C["chars"].length + "' characters, '" + count + "' found.");
        }
    }
    
    // Prepare character codes
    C["codes"] = [];
    for (var i = 0; i < C["chars"].length; i++) {
        C["codes"].push(C["chars"][i].toUpperCase().charCodeAt());
    }

    // Overwrite character codes so the right character is triggered by the right code
    overwriteKeys();
}

// Place module divs into application ('elements' is list of elements a module needs)
function initContainers (mod, elements = ["content","rside","overlay","progress"]) {
    // Module requires place in main area
    if (elements.indexOf("content") >= 0) {
        var id = mod + "_main";
        var node = makeElement("div", mod + "_main", "noselect", false);
        addNode(E["content"], node);
        initElement(id, "element");
    }

    // Module requires statbox in right sidebar
    if (elements.indexOf("rside") >= 0) {
        var id = mod + "_info";
        var wid = mod + "_statbox";
        var title = mod.replace(/^mod/, '').toUpperCase();

        if (elements.indexOf("overlay") >= 0) {
            var html = "<div id='" + id + "' class='statboxInfo pointer inactive' onclick='showOverlay(\"" + mod + "\");'>INFORMATION</div>" +
                "<div class='statboxHeader noselect'>" + title + "</div>";
        }
        else {
            var html = "<div class='statboxHeader noselect statboxFloating'>" + title + "</div>";
        }
        html += "<div id='w_" + wid + "'></div>" +
            "<div class='clear'></div>";

        var node = makeElement("div", false, "statbox", html);
        addNode(E["rsidemodules"], node);
        initElement(id, "element");
        initElement(wid, "writable");
    }

    // Module requires overlay
    if (elements.indexOf("overlay") >= 0) {
        var id = mod + "_overlay";
        var html = "<div class='hideOverlays pointer noselect' onclick='hideOverlays();'>&times;</div>" +
            "<div id='w_" + id + "' class='overlayInner'></div>";

        var node = makeElement("div", id, "overlay", html);
        node.tabIndex = 0;
        addNode(E["overlay"], node);
        initElement(id, "element");
        initElement(id, "writable");
    }

    // Module requires progress indicator
    if (elements.indexOf("progress") >= 0) {
        var id = mod + "_done"; 
        var node = makeElement("div", id, "item noselect failure", C[mod + "_progressName"]);
        addNode(W["progress"], node);
        initElement(id, "element");
    }
}

// Load CSS file
function includeCss (url, callback) {
    var css = document.createElement("link");
    css.rel = "stylesheet";
    css.type = "text/css";
    css.href = url;
    css.onload = callback;
    document.getElementsByTagName("head")[0].appendChild(css);
}

// Load JS file
function includeJs (url, callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    script.onload = callback;
    document.getElementsByTagName("head")[0].appendChild(script);
}

// ################################
// # Layout manipulation          #
// ################################ 

// Show overlay by module name
function showOverlay (name) {
    var id = name + "_overlay";
    if (E.hasOwnProperty(id)) {
        if (E[id] == false) {
            logMsg(STRINGS["logErrr"] + "Module '" + name + "' is disabled");
        }
        else {
            hideOverlays();
            E[id].style.display = "block";
            E[id].focus();
        }
    }
}

// Hide all overlays
function hideOverlays () {
    for (var i = 0; i < C["modules"].length; i++) {
        var module = C["modules"][i];
        var overlay = module + "_overlay";
        if (C[module] && E.hasOwnProperty(overlay)) {
            E[overlay].style.display = "none";
        }
    }
}

// Toggle right sidebar
function toggleRside () {
    if (S["rsideOn"]) {
        E["content"].style.marginRight = "0px";
        E["rside"].style.right = "-400px";
        S["rsideOn"] = false;
        setHtml(E["rtoggle"], "&lt;");
    }
    else {
        E["content"].style.marginRight = "400px";
        E["rside"].style.right = "0";
        S["rsideOn"] = true;
        setHtml(E["rtoggle"], "&gt;");
    }
}

// Set message and color of sidebar status indicator
function setStatus (s, clr = false) {
    if (["success", "message", "warning", "failure"].indexOf(clr) >= 0) {
        setClass(W["status"], clr);
    }
    setHtml(W["status"], s); 
}

// Add message to sidebar log
function logMsg (s, del = "<br />") {
    if (S["logEmpty"]) {
        S["logEmpty"] = false;
        setHtml(W["log"], s);
    }
    else {
        msg = document.createElement("span");
        msg.innerHTML = del + s;
        addNode(W["log"], msg);
        E["log"].scrollTop = E["log"].scrollHeight;
    }
}

// ################################
// # Actions                      #
// ################################ 

// Clear sidebar log
function clearLog () {
    S["logEmpty"] = true;
    remHtml(W["log"]);
}

function start () {
    moduleCallFirst("start");
}

function stop () {
    moduleCallFirst("stop");
}

function reset () {
    moduleCallAll("reset");
}

function save () {
    moduleCallFirst("save");
}

function moduleCall (name, all) {
    for (var i = 0; i < C["modules"].length; i++) {
        var mod = C["modules"][i];
        if (C[mod] && typeof(window[mod][name]) === "function") {
            if (all) {
                window[mod][name]();
            }
            else {
                return window[mod][name]();
            }
        }
    }
}

function moduleCallFirst (name) {
    moduleCall(name, false);
}

function moduleCallAll (name) {
    moduleCall(name, true);
}

// ################################
// # Html manipulation            #
// ################################ 

// Make an element
function makeElement (type, id = false, cls = false, html = false) {
    var ele = document.createElement(type);
    if (id) ele.id = id;
    if (cls) ele.className = cls;
    if (html) ele.innerHTML = html;
    return ele;
}

// Toggle class of element in "E"
function setEClass (suffix, name, active, inactive, done = true) {
    if (done) {
        remClass(E[name + "_" + suffix], inactive);
        addClass(E[name + "_" + suffix], active);
    }
    else {
        remClass(E[name + "_" + suffix], active);
        addClass(E[name + "_" + suffix], inactive);
    }
}

// Set "_done" element in "E" from 'failure' to 'success' or vica versa
function markDone (name, done = true) {
    setEClass("done", name, "success", "failure", done);
}

// Set "_info" element in "E" from 'inactive' to 'active' or vica versa
function markActive (name, done = true) {
    setEClass("info", name, "active", "inactive", done);
}

// Set element class
function setClass (ele, cls) {
    ele.className = cls;
}

// Add a class to element
function addClass (ele, cls) {
    ele.className += " " + cls;
}

// Remove class from element
function remClass (ele, cls) {
    ele.className = ele.className.replace(new RegExp("\\b" + cls + "\\b", "g"), "").replace(/ +/g, " ");
}

// Reset element's clas (set it to empty)
function resClass (ele) {
    setClass(ele, "");
}

// Set innerHTML of element
function setHtml (ele, str) {
    ele.innerHTML = str;
}

// Append to innerHTML of element
function addHtml (ele, str, del = "<br />") {
    ele.innerHTML += del + str;
}

// Reset element's innerHTML (set it to empty)
function remHtml (ele) {
    ele.innerHTML = "";
}

// Reset element's value (set it to empty)
function remVal (ele) {
    ele.value = "";
}

// Append HTML node to element
function addNode (ele, node) {
    ele.appendChild(node);
}

// ################################
// # Returning HTML strings       #
// ################################ 

// Generate td element with class based on value
function tdVal (val, bound1, bound2, cls1 = "posval", cls2 = "bigval", abs = false) {
    var v = (abs)? Math.abs(val) : val;
    if (v > bound2) {
        return tdClass(val, cls2);
    }
    else if (v > bound1) {
        return tdClass(val, cls1);
    }
    else {
        return tdClass(val);
    }
}

// Generate td with class and value based on value
function tdBool (val, truecls = "success", falsecls = "failure") {
    return (val)? tdClass("Yes", truecls) : tdClass("No", falsecls);
}

// Generate td with specified class
function tdClass (val, cls = false) {
    return (cls != false)? "<td class='" + cls + "'>" + val + "</td>" : "<td>" + val + "</td>";
}

// Generate tr with titles based on array
function trTitles (list, nempty = 0, span = 0) {
    var colspan = (span > 0)? " colspan='" + span + "'" : "";
    var html = "<tr class='mark'>";

    // Prepend tr with empty fields
    if (nempty > 0) {
        html += "<td colspan='" + nempty + "'></td>";
    }

    // Insert values
    for (var i = 0; i < list.length; i++) {
        html += "<td" + colspan + ">" + list[i] + "</td>";
    }
    html += "</tr>";
    
    return html;
}

// Generate tr with values from a list on classes based on value
function trList (list, bound1, bound2) {
    var html = "<tr>";
    for (var i = 0; i < list.length; i++) { 
        html += tdVal(list[i], bound1, bound2);
    }
    html += "</tr>";
    return html;
}

// Generate tr which is a reduction from two dimensional array of items and their properties
function trListProperties (list, properties, bound1, bound2) {
    var html = "<tr>";
    for (var i = 0; i < list.length; i++) {
        for (var j = 0; j < properties.length; j++) {
            html += tdVal(list[i][properties[j]], bound1, bound2);
        }
    }
    html += "</tr>";
    return html;
}

// Generate trs where columns are items and rows are properties
function trsPropertiesList (list, properties, bound1, bound2, title = false) {
    var html = "";
    for (var i = 0; i < properties.length; i++) {
        html += "<tr>";
        if (title !== false && i == 0) html += "<td class='mark' rowspan='" + properties.length + "'>" + title + "</td>"; 
        html += "<td class='mark'>" + properties[i] + "</td>";
        for (var j = 0; j < list.length; j++) {
            html += tdVal(list[j][properties[i]], bound1, bound2);
        }
        html += "</tr>";
    }
    return html;
}

// Generate trs of two dimensional array where each items has additional properties represented in multiple rows
function trsListPropertiesList (list, properties, bound1, bound2, titles = false) {
    var html = "";
    for (var i = 0; i < list.length; i++) {
        html += trsPropertiesList(list[i], properties, bound1, bound2, titles[i]);
    }
    return html;
}

// Generate trs of two dimensional array
function trsListList (list, bound1, bound2, titles = false) {
    var html = "";
    for (var i = 0; i < list.length; i++) {
        html += "<tr>";
        if (titles !== false) {
            html += "<td class='mark'>" + titles[i] + "</td>";
        }
        for (var j = 0; j < list[i].length; j++) {
            html += tdVal(list[i][j], bound1, bound2);
        }
        html += "</tr>";
    }
    return html;
}

// Wrap string in div
function wrapHtml (str, cls = false) {
    if (cls) {
        return "<div class='" + cls + "'>" + str + "</div>";
    }
    else {
        return "<div>" + str + "</div>";
    }
}

// Wrap string in table
function wrapHtmlTable (str) {
    return "<table>" + str + "</table>";
}

// ################################
// # Keystroke functions          #
// ################################ 

// Record key presses
document.onkeydown = function (e) {
    k = e.keyCode;

    // Capture key press
    if (! C["modText"] || modText["running"]) {
        if (k == 8 && C["modText_backspace"]) {
            // Backspace: inrease corrections count (doesn't check how many chars were actually deleted)
            modText["ncorrections"]++;
        } 
        else if (C["hotkeys_enable"] && (k == C["hotkeys"]["hide"])) {
            // Hide hotkey: stop
            stop();
        }
        else if (C["modCapture"] && (C["codes"].indexOf(k) != -1)) {
            // Capture keystroke
            if (! modCapture["running"]) modCapture.start();
            if (k == 32) modText.evalWord();
            modCapture["raw"].push([true, k, Date.now()]);
        }
        else if (C["modCapture"] && C["modCapture_shift"] && k == 16) {
            // Capture shift if enabled
            modCapture["rawshift"].push([true, Date.now()]);
        }
        else if (C["modText_nocheating"]) {
            // Prevent user from using unspecificed keys
            logMsg(STRINGS["logWarn"] + "Key " + e.code + " (" + e.keyCode + ") is not allowed!");
            e.preventDefault();
        }
    }
    else if (C["hotkeys_enable"]) {
        // Keystrokes to control interface
        if (k == C["hotkeys"]["hide"]) {
            hideOverlays();
        }
        else if (C["hotkeys_overlay"] && k >= 97 && k <= 105) {
            // 0-9: show overlay 0-9
            var id = k - 97;
            if (id < C["modules"].length) {
                showOverlay(C["modules"][id]);
            }
        }
        else if (k == C["hotkeys"]["clear"]) {
            clearLog();
        }
        else if (k == C["hotkeys"]["reset"]) {
            reset();
        }
        else if (k == C["hotkeys"]["save"]) {
            save();
        }
        else if (k == C["hotkeys"]["toggle"]) {
            toggleRside();
        }
    }
}

// Record key releases
document.onkeyup = function (e) {
    k = e.keyCode;
    if (C["modText"] && modText["running"]) {
        if (C["modCapture"] && C["codes"].indexOf(k) != -1) {
            modCapture["raw"].push([false, k, Date.now()]);
        }
        else if (C["modCapture"] && C["modCapture_shift"] && k == 16) {
            modCapture["rawshift"].push([false, Date.now()]);
        }

        // Evaluate word on space or last character of last word
        if (modText["lastword"] && k == modText["lastchar"]) {
            modText.checkEnd();
        }
    }
    else if (C["hotkeys_enable"] && (k == C["hotkeys"]["start"])) {
        start();
    }
}

// ################################
// # Character functions          #
// ################################ 

// Get list of groups given char belongs to
function getGroups (c) {
    var c = c.toUpperCase();
    var groups = [];
    if (c.length === 1) {
        for (var i = 0; i < C["metagroups"].length; i++) {
            groups.push(getGroup(c, C["metagroups"][i]["groups"]));
        }
    }
    return groups;
}

// Get index of group to which a character belongs to
function getGroup (c, groups) {
    for (var i = 0; i < groups.length; i++) {
        if (groups[i]["chars"].indexOf(c) >= 0) {
            return i;
        }
    }
    logMsg(STRINGS["logErrr"] + "Character '" + c + "' doesn't match any group");
    return -1;
}

// Overwrite key codes of keys that trigger different codes than they should be recorded as
function overwriteKeys () {
    for (var i = 0; i < C["overwrite"].length; i++) {
        var pos = C["codes"].indexOf(C["overwrite"][i][0]);
        if (pos != -1) {
            C["codes"][pos] = C["overwrite"][i][1];
        }
    }
}

// Generate random string
function randomString (len = 8, chars = "0123456789abcdef") {
    var result = "";
    
    for (var i = 0; i < len; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
}

// ################################
// # Number functions             #
// ################################ 

// Round a number
function round (v, places = 2) {
    var multiplier = Math.pow(10, places);
    return Math.round(v * multiplier) / multiplier;
}

// Sum values in array
function arraySum (a) {
    return a.reduce((x,y) => x + y, 0);
}

// Calculate array average
function arrayAverage (a) {
    return arraySum(a) / a.length;
}

// Calculate array standard deviation
function arrayStandardDeviation (a) {
    var m = arrayAverage(a);
    var v = a.reduce((x,y) => x + Math.pow(y - m, 2), 0);
    return Math.sqrt(v / a.length);
}

// Get integer from other data types
function getInteger (v) {
    v = parseInt(v);
    return (isNaN(v))? 0 : v;
}

// Get rounded per minute value from value and milliseconds
function perMinute (v, ms, round = 2) {
    return Math.round((v / ms) * 60000 * Math.pow(10, round)) / Math.pow(10, round);
}

// ################################
// # Matrix functions             #
// ################################ 
function matrixMultiply (a, b) {
    // Check dimensions
    if (a[0].length != b.length) {
        logMsg(STRINGS["logErrr"] + "Can't multiply incompatible matrices");
    }

    // Prepare array
    x = a.length;
    y = b[0].length;
    l = b.length;
    r = arrayConstruct(0, [x, y]);
 
    // Calculate product
    for (var i = 0; i < x; i++) {
        for (var j = 0; j < y; j++) {
            for (var k = 0; k < l; k++) {
                r[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    return r; 
}

function vectorSum (a, b) {
    // Check dimensions
    if (a.length != b.length) {
        logMsg(STRINGS["logErrr"] + "Can't sum vectors with different length");
        return a;
    }

    // Calculate sum
    return a.map((x, i) => x + b[i]);
}

// ################################
// # Array functions              #
// ################################ 

// Flip columns and rows of array
function arrayFlip (a) {
    return a[0].map((x,y) => a.map(z => z[y]));
}

// Reduce two dimensional array to one dimension
function arrayReduce (a) {
    var reduced = [];
    for (var i = 0; i < a.length; i++) {
        for (var j = 0; j < a[i].length; j++) {
            reduced.push(a[i][j]);
        }
    }
    return reduced;
}

// Return index of max value
function arrayMaxIndex (a) {
    max = a.reduce((x, y) => Math.max(x, y), a[0]);
    return a.indexOf(max);
}

// Construct array with arbitrary dimensions (d: array of dimension sizes)
function arrayConstruct(val, d) {
    var list = [];

    // Zero dimensional array is a constant
    if (d.length <= 0) {
        return val;
    }

    // One dimensional array of constants
    else if (d.length == 1) {
        return listConstruct(val, d[0]);
    }

    // Recursively construct array
    else {
        for (var i = 0; i < d[0]; i++) {
            list.push(arrayConstruct(val, d.slice(1)));
        }
    }

    return list;
}

// Construct one dimensional array of constants
function listConstruct (val, a) {
    return Array.apply(null, Array(a)).map(function () {
        return (Array.isArray(val))? val.slice() : val;
    });
}

// Make sorted array from array or string
function arraySorted (vals) {
    var list = (Array.isArray(vals))? vals.slice() : vals.split("");
    list.sort();
    return list;
}

// Change array of objects to array of a single property
function arrayProperty (list, property) {
    return list.map(x => x[property]);
}

// ################################
// # Text functions               #
// ################################ 

// Left or right pad a string with given filler
function pad (str, len, filler = "&nbsp;", left = false) {
    if (str.length <= len) {
        var padding = new Array(1 + len - str.length).join(filler);
        return (left)? padding + str : str + padding;
    }
    else {
        return str.slice(0,len);
    }
}

// Left pad a string or number
function lpad (str, len, filler = "&nbsp;") {
    return pad("" + str, len, filler, true);
}

// Right pad a string or number
function rpad (str, len, filler = "&nbsp;") {
    return pad("" + str, len, filler, false);
}

// Left pad a string or number with zeroes
function zeropad (val, len) {
    return lpad("" + val, len, "0", false);
}

// ################################
// # Sound functions              #
// ################################ 

// Play beep
var beepSound = new Audio("sound/beep.wav")

function beep () {
    beepSound.play();
}

// This is okda configuration file
// You may change value of any field but it is not advised to delete them

C = {
    // ################################################################
    // # Global - character and character group configuration         #
    // ################################################################
    chars: " ,.-_'/ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",                       // Legal characters included in testing 
    ucase: /[A-Z]/g,                                                            // Chars considered uppercase (RegEx)
    lcase: /[a-z]/g,                                                            // Chars considered lowercase (RegEx)
    overwrite: [                                                                // Chars that should be triggered on a different keycode
        [46,190],                                                               // ,
        [44,188],                                                               // .
        [45,189],                                                               // -
        [39,219],                                                               // '
    ],

    metagroups: [                                                               // Classifications of groups of characters
        {                                                                       // Each classification should contain each char in exactly one group
            name: "Character type",                                             // Classification based on type of character
            groups: [
                {
                    title: "letters",                                           // Title of group
                    chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",                        // Chars in group
                },
                {
                    title: "digits",
                    chars: "0123456789"
                },
                {
                    title: "special",
                    chars: ",.-_'/"
                },
                {
                    title: "space",
                    chars: " "
                }
            ]
        },
        {
            name: "Hand",
            groups: [
                {
                    title: "left",
                    chars: "123456QWERTASDFGYXCVB /"
                },
                {
                    title: "right",
                    chars: "7890ZUIOPHJKLNM,.-_'"
                }
            ]
        },
        {
            name: "Row",
            groups: [
                {
                    title: "1",
                    chars: "1234567890'/",
                },
                {
                    title: "2",
                    chars: "QWERTZUIOP"
                },
                {
                    title: "3",
                    chars: "ASDFGHJKL"
                },
                {
                    title: "4",
                    chars: "YXCVBNM,.-_"
                },
                {
                    title: "5",
                    chars: " "
                }
            ]
        }
    ],

    // ################################################################
    // # Hotkeys - configure hotkeys for interacting with interface   #
    // ################################################################
    hotkeys_enable: true,                                                       // Enable use of hotkeys (when not entering text) 
    hotkeys_overlay: true,                                                      // Enable toggling module overlays with numpad 1-9
    hotkeys: {                                                                  // Which key code should trigger specific action (false to disable)
        hide: 27,                                                               // Hide overlays (stops capture when running), default = ESCAPE
        clear: "C".charCodeAt(),                                                // Clear log, default = C
        start: "B".charCodeAt(),                                                // Start, default = B
        reset: false && "R".charCodeAt(),                                       // Reset, default = R
        save: "S".charCodeAt(),                                                 // Hide overlays, default = S
        toggle: "T".charCodeAt(),                                               // Toggle right sidebar, default = T
    },
    
    // ################################################################
    // # Mods - toggle and configure individual modules               #
    // ################################################################
    modules: [                                                                  // List of included modules (order matters)
        "modText",                                                              // Provides text that user can write
        "modCapture",                                                           // Captures and analyzes keystroke times
        "modQuestions",                                                         // Displays questionnaire for additional data collection 
        "modPredict",                                                           // Predicts traits based on previous training
        "modReplay",                                                            // Enables you to replay saved capture data
        "modSave",                                                              // Enables you to save collected data
        "modHelp"                                                               // Provides help document and version information
    ],                

    // ################################################################
    // # modText - displays text for user to write                    #
    // ################################################################
    modText: true,                                                              // Enable module
    modText_autostart: false,                                                   // Start listening automatically
    modText_backspace: true,                                                    // Allow user to use backspace
    modText_nocheating: true,                                                   // Prevent users from using unspecified keys (such as arrows and delete)
    modText_text: "This is a placeholder text used for collecting keystroke " +
        "dynamics data. You can edit this text in 'src/config.js' file by " +
        "changing content of variable 'modText_text'.",
    modText_progressName: "Text",                                               // Name of progress status

    // ################################################################
    // # modCapture - record and analyze keystroke times              #
    // ################################################################
    modCapture: true,                                                           // Enable this module
    modCapture_maxflight: 9999,                                                 // Discard flight times above limit (in ms)
    modCapture_shift: true,                                                     // Capture dwell times for shift key

    // ################################################################
    // # modQuestions - collect user data with questionnaire          #
    // ################################################################
    modQuestions: true,                                                         // Enable this module
    modQuestions_progressName: "Questions",                                     // Name of progress status
    modQuestions_yes: "Yes",                                                    // Text of yes button on yes/no scale questions
    modQuestions_no: "No",                                                      // Text of no button on yes/no scale questions

    modQuestions_binfields:                                                     // Binary demographic fields
    [
        {
            name: "male",
            title: "Sex",
            yes: "male",
            no: "female",
            cls: "bmargin"
        },
        {
            name: "lefthanded",
            title: "Handedness",
            yes: "left-handed",
            no: "right-handed",
            cls: "" 
        }
    ],

    modQuestions_numfields:                                                     // Numeric demograpgic fields
    [
        {
            name: "age",
            title: "Age",
            placeholder: "years",
            maxlen: 3,
            cls: "smargin"

        },
        {
            name: "height",
            title: "Height",
            placeholder: "CM",
            maxlen: 3,
            cls: "smargin"
        },
        {
            name: "weight",
            title: "Weight",
            placeholder: "KG",
            maxlen: 3,
            cls: ""
        }
    ],

    modQuestions_scales: [                                                      // Yes / no scales
        {
            enabled: true,
            name: "Sample yes/no scale",
            intro: "<h2>Sample yes/no scale</h2><p>This is a sample yes/no " +
                "scale. You can modify yes/no scales in 'src/config.js' by " +
                "editing variable 'modQuestions_scales'.</p> ",
            dimensions: {
                sample_dimension: {
                    enabled: true,
                    name: "Sample yes/no",
                    score: 0
                }
            },
            selected: [],
            items: [
                {   // Item 01
                    dimension: "sample_dimension",
                    answer: 1,
                    content: "Sample positive question"
                },
                {   // Item 02
                    dimension: "sample_dimension",
                    answer: 0,
                    content: "Sample negative question"
                }
            ]
        }
    ],
    
    modQuestions_lscales:                                                       // Likert scales
    [
        {
            enabled: true,
            name: "Sample likert scale",
            nanswers: 5,
            intro: "<h2>Sample likert scale</h2><p>This is a sample likert " +
                "scale. You can modify likert scales in 'src/config.js' by " +
                "editing variable 'modQuestions_lscales'.</p> ",
            dimensions: {
                sample_dimension_1: {
                    name: "Sample dim 1",
                    enabled: true,
                    base: 4,
                },
                sample_dimension_2: {
                    name: "Sample dim 2",
                    enabled: true,
                    base: 4,
                }
                
            },
            selected: [],
            items: [
                {   // Item 01
                    dimension: "sample_dimension_1",
                    multiplier: 1,
                    content: "Dimnesion 1 positive item"
                },
                {   // Item 02
                    dimension: "sample_dimension_1",
                    multiplier: -1,
                    content: "Dimnesion 1 negative item"
                },
                {   // Item 03
                    dimension: "sample_dimension_2",
                    multiplier: 1,
                    content: "Dimnesion 2 positive item"
                },
                {   // Item 04
                    dimension: "sample_dimension_2",
                    multiplier: -1,
                    content: "Dimnesion 2 negative item"
                }
            ]
        }
    ],

    // ################################################################
    // # modPredict - predict traits based on keystroke dynamics      #
    // ################################################################
    modPredict: true,                                                           // Enable this module
    modPredict_source: "modSave",                                               // Where to obtain training data (options: 'modSave' - requires modSave to be loaded
    modPredict_headers: [                                                       // List of fields used for learning (IMPORTANT: train headers must match predict headers)
        "0i_time",
        "0i_chrs/m",
        "0i_err",
        "0i_err/m",
        "0i_corr",
        "0i_corr/m",
        "0i_gfl_m",
        "0i_gfl_sd",
        "0i_gdw_m",
        "0i_gdw_sd"
    ],
    modPredict_binfields: [],                                                   // List of binary fields to predict (must include name, title and group labels)
    modPredict_numfields: [],
    modPredict_scales: [],
    modPredict_lscales: [],
    modPredict_numfields: [],                                                   // List of numerical fields to predict
    modPredict_scales: [                                                        // Nested list of binary scale dimensions to predict
        [
            {
                name: "sample_dimension",
                title: "Sample dimension",
                labels: ["yes","no","?"]
            }
        ]
    ],
    modPredict_lscales: [],                                                     // Nested list of likert scale dimensions to predict
    modPredict_nnfile: "src/modPredict/nn.js",                                  // Location of neural network configurations
                                                                                // See 'webapp/src/modPredict/nn.js for example configuration

    // ################################################################
    // # modReplay - replay saved data to analyze again               #
    // ################################################################
    modReplay: true,                                                            // Enable this module 
    modReplay_type: "raw",                                                      // Data that should be replayed (raw: raw modCapture keystroke data)
    modReplay_format: "json",                                                   // Replay format (supported: json)

    // ################################################################
    // # modSave - save collected data to files or database           #
    // ################################################################
    modSave: true,                                                              // Enable this module
    modSave_autosave: true,                                                     // Automatically save when all data is collected
    modSave_autodownload: false,                                                // Push files to download instead of providing download links
    modSave_progressName: "Saved",                                              // Name of progress status
    modSave_rand: true,                                                         // Use random id as a part of save string
    modSave_rand_len: 8,                                                        // Length of random part of the id
    modSave_n: false,                                                           // Save numerus in addition to average and standard deviation where possible
    modSave_save: {                                                             // Determine which data you want to save and how it is marked
        capture_raw: {                                                          // Save raw modCapture data
            title: "CR",
            mode: "json",                                                       // Save format (supported: json)
            enabled: true
        },
        capture_analyzed: {                                                     // Save analyzed modCapture data
            title: "CA",
            mode: "csv",                                                        // Save format (supported: csv)
            enabled: true
        },
        questions_raw: {                                                        // Save raw modQuestions data
            title: "QR",
            mode: "csv",                                                        // Save format (supported: csv)
            enabled: true
        },
        questions_analyzed: {                                                   // Save analyzed modQuestions data
            title: "QA",
            mode: "csv",                                                        // Save format (supported: csv)
            enabled: true
        }
    },
    
    // ################################################################
    // # modHelp - include help page and program details              #
    // ################################################################
    modHelp: false,                                                              // Enable this module
    modHelp_title: "Welcome to okda!",                                          // Overlay title
    modHelp_text: "<p>This is a sample text which can be used to greet " +      // Overlay text
        "users. You can change it in 'src/config.js' by editing variable " +
        "'modHelp_text'. You can disable it by setting variable 'modHelp' " +
        "to false.</p>" +
        "<p>After you click start, application will start collecting " +
        "keystroke data and expect you to start typing. Press escape or " +
        "click 'Stop' if you just want to look around instead.",
    modHelp_button: true,                                                       // Show button that hides overlay and 'starts'
    modHelp_button_text: "Start",                                               // Button text
    modHelp_autostart: true,                                                    // Show overlay at start
    modHelp_thankyou: true,                                                     // Enable thank you overlay
    modHelp_thankyou_title: "Thank you!",                                       // Thank you overlay title
    modHelp_thankyou_text: "<div class='center'>" +                             // Thank you overlay text
            "This is optional text which is displayed after text is typed " +
            "and all questions are answered. Change it in 'src/config.js' " +
            "by editing varible 'modHelp_thankyou_text' or disable it by " +
            "setting variable 'modHelp_thankyou' to false." +
            "</div>"
}

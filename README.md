# Okda

Open Keystroke Dynamics Analyzer (okda) is a web application for performing
keystroke dynamics research. It can collect, analyze, import, export and make
predictions based on keystroke dynamics data. It was developed for a specific
research projects but is written to be configurable and extensible with goal to
be useful for possible future research.

## Dependencies

Okda web application is located in `webapp` directory and has no dependencies.
It was developed and tested using Chromium browser.

Included in the repository are also some example Python scripts I used for
analyzing data and training neural networks. These scripts are located in
directory `training` and depend on libraries:

- [numpy](http://www.numpy.org/)
- [scipy](https://www.scipy.org/)
- [tensorflow](https://www.tensorflow.org/)

Scripts are only provided as an example and should be modified before use!

## Installation

You can run okda by downloading the repository and opening `webapp/index.html`
in a web browser:

    git clone https://github.com/aijnn/okda.git
    chromium okda/webapp/index.html

## Usage

Run okda by opening `webapp/index.html` in a web browser.

Okda can be used to perform keystroke dynamics research. It currently consists
of the following modules:

- *modHelp*: shows introduction and thank you messages to participants
- *modText*: displays and analyses static text
- *modCapture*: captures key press data and extracts variables from raw data
- *modQuestions*: displays and analyses questionnaires
- *modPredict*: predicts traits using existing trained neural networks
- *modSave*: saves raw and/or analylzed data
- *modRepeat*: plays back raw capture data to the application

All modules can (and should) be configured in `webapp/src/config.js`. Modules
can be modified by editing `webapp/src/$MODULE_NAME/$MODULE_NAME.js`.

## Contributing

This software was developed for a specific research project and there are no
plans to further develop it . I will however try to fix any reported issues and
accept pull request for bug fixes or added functionality.

## License

See the [COPYING](COPYING) file for license rights and limitations (MIT).

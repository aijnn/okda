#!/usr/bin/env python

# Import libraries
import argparse
import json
import random
import re
import textwrap

# Global variables
name = "NN Trainer"
ver = "0.1"
sep = ""

# Parse command line arguments
def parseArgs ():
    parser = argparse.ArgumentParser(
            formatter_class = argparse.RawDescriptionHelpFormatter,
            description = textwrap.dedent('''\
                Reads CSV file containing headers and data. Categorises variables
                into training and prediction based on header name as specified by
                user. Assumes all prediction variables are binary (either 1 or 0)
                and trains neural networks for each. Displays results, optionally
                saves layer configurations. Entries are divided into training and
                testing (default 10 %), no validation is performed by the script.
                '''),
            epilog = textwrap.dedent('''\
                examples:
                    %(prog)s -p "1o_age,1o_height,1o_weight" entries.csv
                    %(prog)s -o neuralnetworks -v -m "[0-9]i" -p "1o_age" -t 20 entries.csv
                '''))

    parser.add_argument("file",
            metavar = "FILE",
            help = "Input CSV file")

    parser.add_argument("-o",
            "--out",
            metavar = "DIR",
            default = False,
            help = "Output directory (script will save multiple .json files)")

    parser.add_argument("-a",
            "--accumulative",
            metavar = "%",
            type = int,
            default = 0,
            choices = range(0, 65535),
            help = "Accumulate tests for whole sample with n entries being used for testing at a time")

    parser.add_argument("-l",
            "--layers",
            metavar = "LIST",
            default = "100,100",
            help = "List of comma seperated layer sizes")
    
    parser.add_argument("-m",
            "--match",
            metavar = "REGEX",
            default = "[0-9]i",
            help = "Train on fields that begin with regular expression match")

    parser.add_argument("-p",
            "--predict",
            metavar = "COLUMNS",
            default = "",
            help = "Comma seperated list of columns to train neural networks for")

    parser.add_argument("-t",
            "--test",
            metavar = "%",
            type = int,
            default = 10,
            choices = range(1,100),
            help = "Percentage of sample that should be used for testing")

    parser.add_argument("-e",
            "--epochs",
            metavar = "n",
            type = int,
            default = 0,
            choices = range(0,65536),
            help = "Number of epochs during neural network training")

    parser.add_argument("-s",
            "--step",
            metavar = "n",
            type = int,
            default = 100,
            choices = range(1,65536),
            help = "Display progress each n-th epoch")

    parser.add_argument("-v",
            "--verbose",
            action = "store_true",
            help = "Incrase output verbosity")

    return parser.parse_args()

# Print initialization data
def printInit (args):
    global sep
    intro = "--[ Starting %s (ver: %s) ]--" % (name, ver)
    sep = "-" * len(intro)

    if (args.out):
        outfile = args.out
    else:
        outfile = "stdout"

    if (args.epochs):
        epochs_str = args.epochs
    else:
        epochs_str = "auto"

    print(intro)
    print("INPUT FILE:  %s" % args.file)
    print("OUTPUT DIR:  %s" % outfile)
    print("TRAIN REGEX: %s" % args.match)
    print("PREDICT LST: %s" % args.predict)
    print("NUM EPOCHS: %s" % epochs_str)
    print("DISPLAY STEP: %s" % args.step)
    print("LAYERS: %s" % args.layers)
    print(sep)

# Load CSV file(s)
def loadData (name, verbose):
    data = []
    headers = []

    # Open file
    try:
        with open(name, 'r', encoding='utf-8') as f:
            raw = f.read()
    except:
        exit("Error reading file '%s'" % name)
    
    # Check structure
    entries = raw.split("\n")
    if (len(entries) < 2):
        exit("Missing data in '%s'" % name)

    # Get / check headers
    headers = entries[0].strip('"').split('","')

    # Get / check data
    for i in range(1,len(entries)):
        entry = entries[i].strip('"').split('","')
        if (len(entry) == 1 and entry[0] == ""):
            break
        elif (len(entry) != len(headers)):
            exit("Error: data doesn't match headers in '%s'" % name)
        data.append(entry)

    if (verbose):
        print("CSV ENTRIES: %d" % len(data))
        print("CSV COLUMNS: %d" % len(data[0]))
        
    return (headers, data)

# Prepare variables for training
def prepareVars (headers, data, exp, predict, verbose):
    regex = re.compile(exp)
    predict = predict.split(",")

    hin = []
    din = []
    hout = []
    dout = []

    for i in data:
        din.append([])
        dout.append([])
    
    # Get variables for training
    for i in range(len(headers)):
        if (regex.match(headers[i])):
           hin.append(headers[i])
           for j in range(len(data)):
               din[j].append(float(data[j][i]))

    # Get variables to predict
    for p in predict:
        if (p == ""):
            break
        try:
            i = headers.index(p)
        except:
            exit("Can't predict field '%s', because it does not exist" % p)
        
        hout.append(headers[i])
        for j in range(len(data)):
            dout[j].append(int(data[j][i]))

    # Check data length
    if (len(hin) == 0):
        exit("Can't train with 0 variables")
    if (len(hout) == 0):
        exit("Can't predict 0 variables")

    # Print output
    if (verbose):
        unused = len(headers) - len(hin) - len(hout)
        print("NUM TRAIN:   %s" % len(hin))
        print("NUM PREDICT: %s" % len(hout))
        print("NUM UNUSED:  %s" % unused)

    return (hin, din, hout, dout)

# Get column from matrix
def getColumn (data, i):
    col = []

    for entry in data:
        col.append(entry[i])

    return col

# Get randomized datasets for training and testing neural networks
def getDatasets (data, classes, n):
    m = len(data) - 1

    train_x = data[:]
    train_y = classes[:]
    test_x = []
    test_y = []

    for i in range(n["test"]):
        r = random.randint(0,m)
        test_x.append(train_x[r])
        test_y.append(train_y[r])
        del train_x[r]
        del train_y[r]
        m -= 1

    return getDatasetsFromNums(train_x, train_y, test_x, test_y, n["classes"])

# Convert dataset to appropriate data types
def getDatasetsFromNums (train_x, train_y, test_x, test_y, nclasses):
    train_x = np.matrix(train_x)
    train_y = getLabels(train_y, nclasses)

    test_x = np.matrix(test_x)
    test_y = getLabels(test_y, nclasses)

    return  {
            "train_x": train_x,
            "train_y": train_y,
            "test_x": test_x,
            "test_y": test_y
    }

# Construct layer with random weights
def getLayer (dimensions):
    return tf.Variable(tf.random_normal(dimensions))

# Get labels matrix from category vector
def getLabels (lst, n_classes):
    labels = []
    for i in range(len(lst)):
        labels.append([])
        for j in range(n_classes):
            if (lst[i] == j):
                labels[i].append(1)
            else:
                labels[i].append(0)
    return np.array(labels)

# Create NN with 2 hidden layers
def multilayer_perceptron(x, weights, biases):
    layer = x
    for i in range(len(weights)-1):
        layer = tf.nn.relu(tf.add(tf.matmul(layer, weights[i]), biases[i]))

    layer = tf.matmul(layer, weights[-1]) + biases[-1]

    return layer

def testPrediction (data, classes, layers, name, train, epochs, step, chunk, verbose):
    n = {
        "classes": 2,
        "rows": len(data),
        "input": len(data[0]),
    }

    if (chunk):
        n["test"] = 0
    else:
        n["test"] = min(max(round(train * n["rows"] / 100), 1), n["rows"] - 1)

    tdata = getDatasets(data, classes, n)

    n["train"] = len(tdata["train_x"])
    n["test"] = len(tdata["test_x"])

    # Single test
    if (not chunk):
        return trainNN(tdata, n, layers, name, train, epochs, step, verbose)
    
    # Accumulative results
    predicted = 0

    start = 0
    while (start < len(data)):
        if (start + chunk < len(data)):
            train_x = data[0:start] + data[start+chunk:]
            train_y = classes[0:start] + classes[start+chunk:]
            test_x = data[start:start+chunk]
            test_y = classes[start:start+chunk]
        else:
            train_x = data[0:start]
            train_y = classes[0:start]
            test_x = data[start:]
            test_y = classes[start:]

        n["train"] = len(tdata["train_x"])
        n["test"] = len(tdata["test_x"])

        start += chunk

        tdata = getDatasetsFromNums(train_x, train_y, test_x, test_y, n["classes"])
        results = trainNN(tdata, n, layers, name, train, epochs, step, verbose)

        predicted += results["test_acc"] * len(tdata["test_x"])

    print("Correctly predicted %0.0d of %s entries (%2.1d %%) using layers %s" % (predicted, len(data), 100 * predicted / len(data), layers))

    # Only returns last result, change if you need all
    return results

# Train neural network
def trainNN (tdata, n, layers, name, train, epochs, step, verbose):
    # Configure NN
    learning_rate = 0.001
    training_epochs = epochs 
    batch_size = 100
    display_step = step 

    # Auto epochs
    if not epochs:
        display_step = 100
        training_epochs = display_step * 2

    # Prepare variables
    batch_x = tdata["train_x"]
    batch_y = tdata["train_y"]

    x = tf.placeholder(tf.float32, [None, n["input"]])
    y = tf.placeholder(tf.float32, [None, n["classes"]])

    weights = []
    wlayers = [n["input"]] + layers + [n["classes"]]

    for i in range(1, len(wlayers)):
        weights.append(getLayer([wlayers[i-1], wlayers[i]]))

    biases = [getLayer([x]) for x in (layers + [n["classes"]])]

    # Construct model
    pred = multilayer_perceptron(x, weights, biases)
    cost = tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits(logits=pred, labels=y))
    optimizer = tf.train.AdamOptimizer(learning_rate=learning_rate).minimize(cost)
    init = tf.initialize_variables(tf.all_variables(), name="nInit")

    # Get that session started
    sess = tf.Session()
    sess.run(init)

    # Train neural network
    if (verbose):
        print("Training '%s' (%d rows, %d columns)" % (name, n["rows"] - n["test"], n["input"]))

    epoch = 1
    while epoch <= training_epochs:
        avg_cost = 0.
        total_batch = 1 # N / batch_size

        # Loop over all batches
        for i in range(total_batch):
            #batch_x, batch_y = mnist.train.next_batch(batch_size)
            _, c = sess.run([optimizer, cost], feed_dict={x: batch_x, y: batch_y})
            avg_cost += c / total_batch

        # Display logs per epoch step
        if epoch % display_step == 0:
            if verbose:
                print("Cost at epoch %05d: %.4f" % (epoch, avg_cost))
            if not epochs and (avg_cost > 0):
                training_epochs += display_step
        
        epoch += 1

    # Test model
    correct_prediction = tf.equal(tf.argmax(pred, 1), tf.argmax(y, 1))
    accuracy = tf.reduce_mean(tf.cast(correct_prediction, "float"))

    train_acc = sess.run(accuracy, feed_dict={x: tdata["train_x"], y: tdata["train_y"]})
    test_acc = sess.run(accuracy, feed_dict={x: tdata["test_x"], y: tdata["test_y"]})

    # Display results
    if (verbose):
        print("-- accuracy: %s (%d rows)" % (train_acc, n["train"]))
        print("Testing '%s' (%d rows)" % (name, n["test"]))
        print("-- accuracy: %s" % test_acc)

    return {
        "weights": sess.run(weights),
        "biases": sess.run(biases),
        "train_acc": train_acc,
        "test_acc": test_acc
    }

# Dump NN weights and biases as JSON
def dumpNN (w, b):
    layers = []

    for i in range(len(w)):
        layers.append(dumpLayer(w[i], b[i]))

    return "[\n" + ',\n'.join(layers) + "\n]"

# Dump NN layer weights and biases as JSON 
def dumpLayer (w, b):
    return "\t[\n\t\t" + npJson(w) + ",\n\t\t" + npJson(b) + "\n\t]"

# Dump numpy vector or matrix as JSON
def npJson (v):
    l = []
    for i in range(len(v)):
        if (type(v[i]) == np.float32):
            l.append(float(v[i]))
        else:
            l.append([])
            for j in range(len(v[i])):
                l[i].append(float(v[i][j]))
    return json.dumps(l)

# Show / save output
def saveData (out, outfile, verbose):
    if (verbose):
        print("Saving data to '%s'" % outfile)

    if (outfile):
        try:
            with open(outfile, 'w', encoding='utf-8') as f:
                f.write(out)
        except:
            exit("Error writing file '%s'" % outfile)
    else: 
        print(out)

# Main
def main ():
    global np, tf

    # Get arguments
    args = parseArgs()
    args.layers = [int(x) for x in args.layers.split(",")]

    # Print arguments
    if (args.verbose):
        printInit(args)
    
    # Import tensorflow
    try:
        if (args.verbose):
            print("Loading tensorflow...")
        import tensorflow as tf
        tf.logging.set_verbosity(tf.logging.ERROR)
    except ImportError:
        exit("This script requires 'tensorflow' (https://github.com/tensorflow/tensorflow) to work!")

    # Import numpy
    try:
        import numpy as np
    except ImportError:
        exit("This script requires 'numpy' (https://github.com/numpy/numpy) to work!")

    if (args.verbose):
        print(sep)

    # Load and accumulate CSV data
    (headers, data) = loadData(args.file, args.verbose)
    
    # Extract input and output data
    (hin, din, hout, dout) = prepareVars(headers, data, args.match, args.predict, args.verbose)

    if (args.verbose):
        print(sep)

    # Train neural networks
    results = []
    for i in range(len(hout)):
        column = getColumn(dout, i)
        r = testPrediction(din, column, args.layers, hout[i], args.test, args.epochs, args.step, args.accumulative, args.verbose)
        results.append(dumpNN(r["weights"], r["biases"]))

    # Save results
    for i in range(len(results)):
        if args.out:
            outfile = "%s/%s.json" % (args.out, hout[i])
        else:
            outfile = False

        saveData(results[i], outfile, args.verbose)

main()

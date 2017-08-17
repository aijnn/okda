#!/usr/bin/env python

# Import libraries
import argparse
import re
import textwrap

# Global variables
name = "CSV Accumulator"
ver = "0.1"
sep = ""

# Parse command line arguments
def parseArgs ():
    parser = argparse.ArgumentParser(
            formatter_class = argparse.RawDescriptionHelpFormatter,
            description = textwrap.dedent('''\
                Reads one or more CSV files and combines them into a single file.
                Checks that all CSV files have matching headers and column count.
                Omits columns that don't start with specified regular expression.
                Can calculate median value of specified fields and set fields to:
                    1, where value is in the upper part
                    0, where value is in the lower part 

                This script was written to accumulate keystroke and questionnaire
                analyzed data of okda project and prepare it for machine learning
                or statistical analysis. It was not tested for any other purpose.
                '''),
            epilog = textwrap.dedent('''\
                examples:
                    %(prog)s entry.csv
                    %(prog)s -o entries.csv entry1.csv entry2.csv entry3.csv
                    %(prog)s -o data.csv -v -m "[0-2]" -r "1_age,1_height,1_weight" data/*
                '''))

    parser.add_argument("files",
            metavar = "FILES",
            nargs = "+",
            help = "Input CSV file(s)")

    parser.add_argument("-o",
            "--out",
            metavar = "FILE",
            default = False,
            help = "Save output to a file")
    
    parser.add_argument("-m",
            "--match",
            metavar = "REGEX",
            default = ".",
            help = "Select fields that begin with regular expression match")

    parser.add_argument("-r",
            "--replace",
            metavar = "COLUMNS",
            default = False,
            help = "Comma seperated list of columns to replace with binary value")

    parser.add_argument("-s",
            "--skip",
            action = "store_true",
            help = "Skip variables that have value 0 for all entries")

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

    if (args.replace):
        replace = args.replace
    else:
        replace = "/"

    if (args.skip):
        skip = "Yes"
    else:
        skip = "No"

    print(intro)
    print("INPUT FILES: %d" % len(args.files))
    print("OUTPUT DEST: %s" % outfile)
    print("MATCH REGEX: %s" % args.match)
    print("REPLACE LST: %s" % replace)
    print("SKIP ZEROES:  %s" % skip)
    print(sep)

# Load CSV file(s)
def loadData (files, verbose):
    data = []
    headers = []
    for name in files:
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
        head = entries[0].strip('"').split('","')
        if (len(headers) == 0):
            headers = head
        elif (headers != head):
            exit("Error: headers mismatch in '%s'" % name)

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

# Filter data
def filterData (headers, data, exp, verbose):
    regex = re.compile(exp)
    newheaders = []
    newdata = []

    for i in data:
        newdata.append([])
    
    for i in range(len(headers)):
        if (regex.match(headers[i])):
            newheaders.append(headers[i])
            for j in range(len(data)):
                newdata[j].append(data[j][i])

    if (verbose):
        print("NUM MATCHED: %d" % len(newdata[0]))

    return (newheaders, newdata)

# Skip empty columns
def skipVars (headers, data, verbose):
    newheaders = []
    newdata = []

    for i in data:
        newdata.append([])

    for i in range(len(headers)):
        for j in range(len(data)):
            if (data[j][i] != "0"):
                newheaders.append(headers[i])
                for k in range(len(data)):
                    newdata[k].append(data[k][i])
                break

    if (verbose):
        print("NUM NONZERO: %d" % len(newdata[0]))

    return (newheaders, newdata)

# Replace fields with value based on median
def replaceVars (headers, data, replace, verbose):
    replace = replace.split(",")
    for r in replace:
        try:
            i = headers.index(r)
        except:
            exit("Can't replace field '%s', because it does not exist" % r)
        
        # Calculate median
        lst = []
        for entry in data:
            lst.append(int(entry[i]))

        lst.sort()
        l = len(lst)

        if (l % 2 == 0):
            median = (lst[int(l/2-1)] + lst[int(l/2)]) / 2
        else:
            median = lst[int((l-1)/2)]

        # Replace values based on median
        dist = [0, 0]
        for e in range(len(data)):
            if (int(data[e][i]) < median):
                data[e][i] = "0"
                dist[0] += 1
            else:
                data[e][i] = "1"
                dist[1] += 1

        if (verbose):
            print("-- REPLACED: '%s' at median %.2f (below: %d, above/equal: %d), larger group: %.2f%%" %
                (r, median, dist[0], dist[1], 100 * dist[1] / l))

    return data

# Make CSV from data
def getCsv (headers, data, verbose):
    csv = getCsvLine(headers)
    for line in data:
        csv += "\n" + getCsvLine(line)

    if (verbose):
        print("SAVING CHRS: %d" % len(csv))
        print(sep)

    return csv

# Get CSV line from list
def getCsvLine (l):
    return '"' + '","'.join(l) + '"'

# Show / save output
def saveData (out, outfile):
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
    # Get (and print) arguments
    args = parseArgs()
    if (args.verbose):
        printInit(args)
    
    # Load and accumulate CSV data
    (headers, data) = loadData(args.files, args.verbose)

    # Filter CSV data based on headers
    (headers, data) = filterData(headers, data, args.match, args.verbose)
    
    # Skip zero variables
    if (args.skip):
        (headers, data) = skipVars(headers, data, args.verbose)

    # Replace fields with median
    if (args.replace):
        data = replaceVars(headers, data, args.replace, args.verbose)

    # Save or display output
    out = getCsv(headers, data, args.verbose)
    saveData(out, args.out)

main()

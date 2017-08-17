#!/usr/bin/env python

import re
from sys import argv
from scipy.stats.stats import pearsonr

# Return arguments or exit if invalid
def getArgs():
    if (len(argv) < 4 or len(argv) > 5):
        print("Usage: {} <input_file> <regex1> <regex2> [<format>]\n\
Read CSV file <input_file> where first line is headers and all other lines \
are data. Calculate Pearson correlation coefficient between all fields, that \
match <regex1> and all fields that match <regex2>. Add <format> 'table' to \
display results as a tab delimited table.".format(argv[0]))
        exit()

    return (
            argv[1],
            [re.compile(argv[2]), re.compile(argv[3])],
            len(argv) == 5 and argv[4] == "table"
    )

# Format correlation for printing in table
def strPearson (r, p):
    r = "{:.3f}".format(r)

    if (p <= 0.05):
        r += "*"

    return r.rjust(12)

# Main
def main ():
    # Read arguments
    (infile, regex, table) = getArgs() 

    # Prepare variables
    nheaders = 0
    field_headers = [[], []]
    field_values = [[], []]

    # Open input file
    with open(infile) as f:
        # Read file line by line
        for line in f:
            line = line.strip('"\n').split('","')

            if (nheaders):
                # Check if line is of right length
                if (len(line) != nheaders):
                    break

                # Add values to list
                for i in range(len(field_headers)):
                    for j in range(len(field_headers[i])):
                        field_values[i][j].append(float(line[field_headers[i][j][1]]))

            else:
                # Read headers and determine which fields correlate
                nheaders = len(line)
                
                for i in range(len(line)):
                    for j in range(len(regex)):
                        if (regex[j].match(line[i])):
                            field_headers[j].append((line[i], i))
                            field_values[j].append([])

                # Check if any fields need to be correlated
                for fieldset in field_headers:
                    if (len(fieldset) == 0):
                        print("No correlations to be calculated!")
                        exit()

    # Print headers
    if (table):
        print("\t"*2 + "\t".join(
            ["{}".format(x[0][:12].rjust(12)) for x in field_headers[1]]))
        vals = []

    # Correlate
    for i in range(len(field_values[0])):
        for j in range(len(field_values[1])):
            r, p = pearsonr(field_values[0][i], field_values[1][j])

            if (table):
                vals.append((r, p))

            else:
                print("Correlation - {}, {}: {:.2f}, p={:.2f}".format(
                    field_headers[0][i][0], field_headers[1][j][0], r, p))

        if (table):

            print("{}:\t{}".format(
                field_headers[0][i][0][:12].rjust(12),
                "\t".join([strPearson(x[0], x[1]) for x in vals])))

            vals = []

main()

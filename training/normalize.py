#!/usr/bin/env python

import re
from sys import argv

# Return arguments or exit if invalid
def getArgs():
    if (len(argv) != 5):
        print("Usage: {} <input_file> <base_field> <factor> <regex>\n\
Read CSV file <input_file> where first line is headers and all other lines \
are data. Find all fields that start with <regex> and divide them by value of \
<base_field> field and multiply them by <factor>.".format(argv[0]))
        exit()

    return (argv[1], argv[2], int(argv[3]), re.compile(argv[4]))

# Main
def main ():
    # Read arguments
    (infile, base, factor, regex) = getArgs() 

    # Prepare variables
    headers = False
    base_field = -1
    normalize_fields = []

    # Open input file
    with open(infile) as f:
        # Read file line by line
        for line in f:
            line = line.strip('"\n').split('","')

            if (headers):
                # Normalize line
                base_value = float(line[base_field])

                for i in normalize_fields:
                    new_value = factor * float(line[i]) / base_value
                    line[i] = "{:.2f}".format(new_value)

            else:
                # Read headers and determine which fields to normalize
                headers = line
                
                for i in range(len(line)):
                    # Check if this is the base field
                    if (line[i] == base):
                        base_field = i

                    # Check if this field needs to be normalized
                    if (regex.match(line[i])):
                        normalize_fields.append(i)

                # Check if base field was found
                if (base_field == -1):
                    print("Base field was not found!")
                    exit()

                # Check if any fields need to be normalized
                if (len(normalize_fields) == 0):
                    print("No field needs to be normalized!")
                    exit()

            print('"' + '","'.join(line) + '"')

main()

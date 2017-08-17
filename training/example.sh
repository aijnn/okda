#!/bin/bash

# This script combines okda .csv files in $DATADIR and saves
# result to $OUTDIR. It creates $FULLFILE which contains all
# variables, $STATFILE which omits some flight data, to make
# analysis with a statistical software easier and a separate
# $SMLFILE, which contains vairables for supervisied machine
# learning. It then uses saved variables to train artificial
# neural networks and displays findings. This script assumes
# specific okda configuration, file locations and purpose of
# research. Because of underlying assumptions this script is
# to be used only as an example of how one can automatically
# process collected data to obtain structures for prediction

# Configuration
DATADIR="${HOME}/okda/raw_data/"
OUTDIR="${HOME}/okda/data/"
NNDIR="${HOME}/okda/nn/"
INFILES=`dir -d ${DATADIR}*.csv`

FULLFILE="${OUTDIR}full.csv"
STATFILE="${OUTDIR}stat.csv"
SMLFILE="${OUTDIR}sml"

RD='\033[0;31m'
NC='\033[0m'

CATEGORIZE="1o_age,1o_height,1o_weight"

# Save files
printf "${RD}[[[ SAVING FULL DATA ]]]${NC}\n"
./prepare.py -v -o ${FULLFILE} $INFILES

printf "${RD}[[[ SAVING STAT DATA ]]]${NC}\n"
./prepare.py -v -m "[0-3]" -o ${STATFILE} ${FULLFILE}

printf "${RD}[[[ SAVING SML DATA ]]]${NC}\n"
./prepare.py -v -m "[0-3]" -r $CATEGORIZE -o ${SMLFILE}.csv ${FULLFILE}

# Train NN
printf "${RD}[[[ TRAINING ]]]${NC}\n"
./train.py -v -m "[0-9]i" -p "1o_age" -o ${NNDIR} ${SMLFILE}

# ...

# create chatGPT input
# makes txt files in dialogue format for a given json file

# EXAMPLE CALL: 
# py format_json_for_api.py -p xyz.json

import json, argparse, sys

# define parser, add flag for filepath
# parser = argparse.ArgumentParser()
# parser.add_argument('--path','-p', help="Path to file")
# args = parser.parse_args()
# print(args)
# path = args.path
path = sys.stdin.readline()[:-1]
print(path)

	
with open(path) as cr_raw:
    # load data from json file
    cr_json = json.loads(cr_raw.read())
    
    # output in form "SPEAKER: UTTERANCE" to file with same name as json
    # cuts off .json suffix, adds .txt suffix
    outfile_name = 'output.txt'
    with open(outfile_name, 'w') as outfile:
        phrases = [phrase for phrase in [utterance['speaker'] + ': ' + ' '.join( [w['text'] for w in utterance['words']] ) for utterance in cr_json]]
        print('\n'.join(phrases), file=outfile)


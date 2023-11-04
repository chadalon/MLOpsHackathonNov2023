# tracks listening vs contributing for each person

"""
Ideal output for so_and_so.json with participants ['Bob','Braxton','Matthew']
Bob: x% contributing, y% listening
Braxton: x% contributing, y% listening
Matthew: : x% contributing, y% listening

Plan:
    get total time of meeting (last timestamp of last utterance)
    get unique speakers
    for each speaker
        get all utterances, then sum time of all utterances
        speaker's %contributing is (speaker_sum_time / total_meeting_time)
        speaker's %listening is (100% - %contributing)

"""

import json, argparse, sys

# define parser, add flag for filepath
# parser = argparse.ArgumentParser()
# parser.add_argument('--path','-p', help="Path to file")
# args = parser.parse_args()
path = sys.stdin.readline()[:-1]
	
with open(path) as cr_raw:
    # load data from json file
    cr_json = json.loads(cr_raw.read())
    
    # get meeting length in time
    # awful list comprehension that gets the 'end_timestamp' of the final word of the final utterance.
    mtg_length = round(float(cr_json[-1]['words'][-1]['end_timestamp']),1)
    #print("meeting length:", mtg_length)
    
    # get speakers
    speakers = set(utterance['speaker'] for utterance in cr_json)
    
    #print("speakers: ", speakers)
    
    # for each speaker, sum time utterances and calculate scores
    
    # in format [ [speaker_1, speaking_percent, listening_percent], [speaker_2, speaking_percent, listening_percent], ...]
    #speaker_list = []
    speaker_dict_list = []

    for speaker in speakers:
        speaker_utterances = [utterance['words'] for utterance in cr_json if utterance['speaker'] == speaker]
        #print('speaker:',speaker,sep='\n\n')
        # another awful comprehension. Gets absolute time difference of first word and last word of utterance
        speaker_utterance_times = [float(words[-1]['end_timestamp']) - float(words[0]['start_timestamp']) for words in speaker_utterances]
        speaker_contribute_time_total = round(sum(speaker_utterance_times),1)

        # update speaker_dict (output) with {speaker : total
        
        #print({ speaker : {'percent_listening' : str(round(100 * speaker_contribute_time_total / mtg_length,1)) + '%', 'percent_contributing' : str(round(100*(1 - speaker_contribute_time_total / mtg_length),1)) + '%'} })
        
        speaker_dict_list.append( { 'speaker':speaker, 'percent_listening' : str(round(100 * speaker_contribute_time_total / mtg_length,1)) + '%', 'percent_contributing' : str(round(100*(1 - speaker_contribute_time_total / mtg_length),1)) + '%'} )
        
    # print(speaker_dict_list)
    # (sd[speaker], sd[speaker][percent_listening], sd[speaker][percent_contributing])
    
    # FORMAT OF OUTPUT: name, %listening, %talking
    out_txt = 'Speaker, % Listening, % Contributing\n'
    for speaker_line in speaker_dict_list:
        out_txt = out_txt + speaker_line['speaker'] + ', ' + speaker_line['percent_listening'] + ', ' + speaker_line['percent_contributing'] + '\n'
    # print(out_txt)
    with open('speaker_contributions.txt','w') as outfile:
        print(out_txt, file=outfile)
    
        
    







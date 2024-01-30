# import questions from questions.json
import json
import random
import time

class bcolors:
    CORRECT = '\033[92m'
    INCORRECT = '\033[91m'
    NORMAL = '\033[0m'

# import questions from questions.json
print("Welcome to the quiz!")
print("You will be asked a series of multiple choice question, and you must answer them correctly. Write with downcase all the corresponding letter of the answer you think is correct")
print("For the answers that are not multiple choice, write the answer you think is correct")
# store the questions in a dictionary
questions = []
with open('questions.json', 'r', encoding='utf-8-sig') as f:
    for q in json.load(f):
        questions.append(q)

# ask user how many questions they want to answer
# if user writes all, then provide all questions
        
user_input = input("How many questions do you want to answer?(write all if you want to answer all questions): ")
nr_of_questions = len(questions)
if user_input != "all":
    nr_of_questions = int(user_input)

user_score = 0
# remember the questions that have already been asked
indexes_of_questions = [i for i in range(len(questions))]

for i in range(nr_of_questions):
    # wait 1 second before displaying next question
    time.sleep(1)
    
    # select a random question
    index_of_question = random.choice(indexes_of_questions)
    # remove the question from the list of questions that have not been asked
    indexes_of_questions.remove(index_of_question)  
    
    q = questions[index_of_question]

    print(bcolors.NORMAL + q['question'])
    # for each answer, display the answer
    if q['answers'] != []:
        # for each question that is multiple choice, display the answers, and in front of each one, display the corresponding character
        # for example, the first answer will be a, the second will be b, etc.
        for i in range(len(q['answers'])):
            print(chr(i + 97) + ") " + q['answers'][i])
    # get user input
    user_answer = input("Your answer: ")
    # check if user input is correct
    if user_answer == q['correct']:
        print(bcolors.CORRECT + "Correct!")
        user_score += 1
    else:
        print(bcolors.INCORRECT + "Incorrect!")
        print("The correct answer was " + q['correct'])
    
# convert user score to percentage
user_score = user_score / nr_of_questions * 100
print("You got " + str(user_score) + "%")
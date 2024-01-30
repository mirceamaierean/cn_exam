# Quiz Application

This is a simple Python quiz application that asks the user a series of multiple choice questions, for Computer Networks exam.

## How it works

The application starts by welcoming the user and explaining how the quiz works. The user is then asked how many questions they would like to answer. They can choose to answer all questions or specify a number.

The questions are stored in a JSON file named `questions.json`. This file is read at the start of the program and the questions are stored in a list. Feel free to add more questions to the file.

The application then enters a loop where it asks the user the specified number of questions. Before each question, the program waits for 1 second. The questions are selected randomly from the list of questions.

The user's score is kept track of throughout the quiz.

## How to run

To run the application, simply execute the `main.py` file with a Python interpreter.

```bash
python main.py
```

## Requirements

- Python 3.6 or higher

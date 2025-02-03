# Quiz Application

This is a quiz application that asks the user a series of multiple choice questions, for Computer Networks exam. Can be used either as a Python script, or a React app.

##### IMPORTANT NOTE: Some answers may not be correct, so please check them while using this application, and if you find any mistakes, please let me know.

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

## How to run the React app

To run the React app, simply execute the `npm dev` or `yarn dev` or `pnpm dev`.

```bash
npm dev
```

If you want to have Gemini explain the answers to you, you can set the `VITE_GEMINI_API_KEY` inside a `.env` file. You know how to get the key (:

```bash
VITE_GEMINI_API_KEY=your_api_key_here
```

## Requirements

- Python 3.6 or higher
- Node.js 18 or higher (for the React app)

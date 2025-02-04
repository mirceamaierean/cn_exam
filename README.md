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

To run the React app, you need to install dependencies using `npm`, `yarn` or `pnpm`

```commandline
npm install
```

Then run the React app, simply execute the `npm run dev` or `yarn dev` or `pnpm dev` (alternatively `pnpm run dev`).

```bash
npm run dev
```

If you want to have Gemini explain the answers to you, you can set the `VITE_GEMINI_API_KEY` inside a `.env` file.

```bash
VITE_GEMINI_API_KEY=your_api_key_here
```

### How to get a Google Gemini API Key

Visit [Google AI Studio](https://aistudio.google.com/) and login into your Google account

Click on Get API key

![Get API key](https://imgur.com/UKWxJ5p.jpg)

Create a new API key

![Create API key](https://imgur.com/ooVIaGT.jpg)

Continue with the form, then copy your API keys.

**[Optional]** If you want to test your API key, you can use the command below, where you will insert your generated api key. If it works, you can freely use it in the project

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=INSERTKEYHERE" \
    -H 'Content-Type: application/json' \
    -X POST \
    -d '{
      "contents": [{
        "parts":[{"text": "Write me back "1234" and a random thought."}]
        }]
       }'
```

## Requirements

- Python 3.6 or higher
- Node.js 18 or higher (for the React app)

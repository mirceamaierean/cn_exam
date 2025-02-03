import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Moon, Sun } from "lucide-react";
import "./ios.css";
import "./App.css";

interface Question {
  question: string;
  answers: string[];
  correct: string;
}

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [direction, setDirection] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<Array<[Question, string]>>(
    []
  );
  const [showReview, setShowReview] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [numberOfQuestions, setNumberOfQuestions] = useState<number | "all">(
    "all"
  );
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Load questions from your JSON file
    fetch("/questions.json")
      .then((response) => response.json())
      .then((data) => setQuestions(data));
  }, []);

  useEffect(() => {
    // Check system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleStart = (amount: number | "all") => {
    setNumberOfQuestions(amount);
    setCurrentQuestionIndex(0);
    setScore(0);
    setWrongAnswers([]);
    setShowReview(false);
    setGameOver(false);
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(answer);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer !== null && !isAnswerSubmitted) {
      setIsAnswerSubmitted(true);
      if (selectedAnswer === currentQuestion.correct) {
        setScore((prev) => prev + 1);
      } else {
        setWrongAnswers((prev) => [...prev, [currentQuestion, selectedAnswer]]);
      }
    }
  };

  const handleNext = () => {
    const maxQuestions =
      numberOfQuestions === "all"
        ? questions.length
        : Math.min(numberOfQuestions, questions.length);

    if (currentQuestionIndex < maxQuestions - 1) {
      setDirection(1);
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      setGameOver(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setDirection(-1);
      setCurrentQuestionIndex((prev) => prev - 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  // Update the className and style for all main container divs
  const containerClass =
    "min-h-screen bg-[var(--ios-background)] text-[var(--ios-text)]";
  const cardClass =
    "bg-[var(--ios-card-background)] border border-[var(--ios-border)]";

  if (!questions.length) {
    return (
      <div className={`${containerClass} flex items-center justify-center p-4`}>
        <div className="animate-pulse text-[var(--ios-text-secondary)]">
          Loading questions...
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div
        className={`${containerClass} flex flex-col items-center justify-center p-4`}
      >
        <div
          className={`w-full max-w-md ${cardClass} rounded-[18px] overflow-hidden shadow-lg`}
        >
          <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--ios-border)]">
            <div className="w-[60px]" />
            <span className="text-[17px]">Quiz</span>
            <button
              onClick={toggleDarkMode}
              className="w-[60px] flex justify-end text-[var(--ios-blue)]"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          <div className="p-6">
            <h1 className="text-[22px] mb-4">Welcome to the Quiz!</h1>
            <p className="text-[17px] text-[var(--ios-text-secondary)] mb-6">
              How many questions would you like to answer?
            </p>
            <div className="space-y-3">
              <button
                className="w-full text-left py-3.5 px-5 rounded-[14px] text-[17px] bg-[var(--ios-blue-light)] text-[var(--ios-blue)]"
                onClick={() => handleStart("all")}
              >
                All Questions
              </button>
              <button
                className="w-full text-left py-3.5 px-5 rounded-[14px] text-[17px] bg-[var(--ios-blue-light)] text-[var(--ios-blue)]"
                onClick={() => handleStart(5)}
              >
                5 Questions
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showReview) {
    return (
      <div className={`${containerClass} p-4`}>
        <div
          className={`w-full max-w-md mx-auto ${cardClass} rounded-[18px] overflow-hidden shadow-lg`}
        >
          <div className="px-4 py-3 border-b border-[var(--ios-border)]">
            <h2 className="text-[17px] font-semibold">Review Wrong Answers</h2>
          </div>
          <div className="p-6">
            {wrongAnswers.map(([question, userAnswer], index) => (
              <div key={index} className="mb-6 last:mb-0">
                <p className="text-[17px] mb-3">{question.question}</p>
                <div className="space-y-2">
                  {question.answers.map((answer, i) => (
                    <div
                      key={i}
                      className={`py-3 px-4 rounded-[14px] text-[15px] ${
                        answer === question.correct
                          ? "bg-[var(--ios-green-light)] text-[var(--ios-green)]"
                          : answer === userAnswer
                          ? "bg-[var(--ios-red-light)] text-[var(--ios-red)]"
                          : "bg-[var(--ios-background)]"
                      }`}
                    >
                      {answer}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-[#E5E5EA]">
            <button
              className="w-full py-2.5 rounded-[14px] text-[17px] bg-[var(--ios-blue-light)] text-[var(--ios-blue)]"
              onClick={() => handleStart(numberOfQuestions)}
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameOver) {
    const percentage =
      (score /
        (numberOfQuestions === "all" ? questions.length : numberOfQuestions)) *
      100;
    return (
      <div className={`${containerClass} flex flex-col items-center gap-4 p-4`}>
        <div
          className={`w-full max-w-md ${cardClass} rounded-[18px] overflow-hidden shadow-lg`}
        >
          <h2 className="text-[22px] font-semibold mb-4">Quiz Complete!</h2>
          <p className="text-[17px]">You got {percentage.toFixed(1)}%</p>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-[var(--ios-blue)] text-white rounded-[14px]"
              onClick={() => setShowReview(true)}
            >
              Review Mistakes
            </button>
            <button
              className="px-4 py-2 bg-[var(--ios-blue)] text-white rounded-[14px]"
              onClick={() => handleStart(numberOfQuestions)}
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${containerClass} flex flex-col items-center justify-center p-4`}
    >
      <div
        className={`w-full max-w-md ${cardClass} rounded-[18px] overflow-hidden shadow-lg`}
      >
        <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--ios-border)]">
          <button
            onClick={handlePrevious}
            className={`flex items-center text-[var(--ios-blue)] transition-opacity ${
              currentQuestionIndex === 0 ? "opacity-50" : "opacity-100"
            }`}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-[17px]">Back</span>
          </button>
          <span className="text-[17px]">Quiz</span>
          <button
            onClick={toggleDarkMode}
            className="w-[60px] flex justify-end text-[var(--ios-blue)]"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="p-6 overflow-hidden">
          <div className="text-[17px] text-[var(--ios-text-secondary)] mb-2">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: direction * 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: direction * -20, filter: "blur(10px)" }}
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                filter: { duration: 0.2 },
              }}
              className="relative"
            >
              <p className="text-[22px] mb-8">{currentQuestion.question}</p>

              <div className="space-y-3">
                {currentQuestion.answers.map((answer, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onClick={() => handleAnswerSelect(answer)}
                    disabled={isAnswerSubmitted}
                    className={`w-full text-left py-3.5 px-5 rounded-[14px] text-[17px] transition-all
                      ${
                        selectedAnswer === answer && !isAnswerSubmitted
                          ? "bg-[var(--ios-blue-light)] text-[var(--ios-blue)]"
                          : "bg-[var(--ios-background)]"
                      } ${
                      isAnswerSubmitted && answer === currentQuestion.correct
                        ? "bg-[var(--ios-green-light)] text-[var(--ios-green)]"
                        : ""
                    } ${
                      isAnswerSubmitted &&
                      selectedAnswer === answer &&
                      answer !== currentQuestion.correct
                        ? "bg-[var(--ios-red-light)] text-[var(--ios-red)]"
                        : ""
                    }`}
                  >
                    {answer}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-6 py-4 flex justify-between items-center border-t border-[#E5E5EA]">
          <div className="text-[17px] text-[var(--ios-text-secondary)]">
            Score: {score}/{questions.length}
          </div>
          {!isAnswerSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className={`px-7 py-2.5 rounded-[14px] text-[17px] transition-all
                ${
                  selectedAnswer === null
                    ? "bg-[var(--ios-background)] text-[var(--ios-text-secondary)]"
                    : "bg-[var(--ios-blue-light)] text-[var(--ios-blue)]"
                }`}
            >
              Submit
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-7 py-2.5 rounded-[14px] text-[17px] bg-[var(--ios-blue-light)] text-[var(--ios-blue)]"
            >
              Next Question
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

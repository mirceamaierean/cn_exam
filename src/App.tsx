import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Moon, Sun } from "lucide-react";
import "./ios.css";
import "./App.css";

interface Question {
  question: string;
  answers: string[];
  correct: string; // Can be like "a", "bc", "ad", or a direct answer
}

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
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
  const [textAnswer, setTextAnswer] = useState<string>("");
  const [focusedAnswerIndex, setFocusedAnswerIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(
    new Set()
  );

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
    setAnsweredQuestions(new Set());
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswers((prev) => {
        if (prev.includes(answer)) {
          return prev.filter((a) => a !== answer);
        } else {
          return [...prev, answer];
        }
      });
    }
  };

  const isCorrectAnswer = (
    answer: string | string[],
    question: Question
  ): boolean => {
    if (question.answers.length === 0) {
      // For text input questions
      return answer.toString().toLowerCase() === question.correct.toLowerCase();
    }

    // For multiple choice questions
    if (Array.isArray(answer)) {
      // Convert selected answers to letters (a, b, c, etc.)
      const selectedLetters = answer
        .map((ans) => String.fromCharCode(97 + question.answers.indexOf(ans)))
        .sort()
        .join("");
      // Sort the correct letters to match regardless of order
      const correctLetters = question.correct.split("").sort().join("");
      return selectedLetters === correctLetters;
    } else {
      const answerIndex = question.answers.indexOf(answer);
      const correctLetters = question.correct.split("");
      return correctLetters.includes(String.fromCharCode(97 + answerIndex));
    }
  };

  const handleSubmit = () => {
    if ((!selectedAnswers.length && !textAnswer) || isAnswerSubmitted) return;

    setIsAnswerSubmitted(true);

    if (!answeredQuestions.has(currentQuestionIndex)) {
      if (currentQuestion.answers.length === 0) {
        // Text input question
        if (isCorrectAnswer(textAnswer, currentQuestion)) {
          setScore((prev) => prev + 1);
        } else {
          setWrongAnswers((prev) => [...prev, [currentQuestion, textAnswer]]);
        }
      } else {
        // Multiple choice question
        if (isCorrectAnswer(selectedAnswers, currentQuestion)) {
          setScore((prev) => prev + 1);
        } else {
          setWrongAnswers((prev) => [
            ...prev,
            [currentQuestion, selectedAnswers.join(", ")],
          ]);
        }
      }
      setAnsweredQuestions((prev) => new Set(prev).add(currentQuestionIndex));
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
      setSelectedAnswers([]);
      setTextAnswer("");
      setIsAnswerSubmitted(false);
    } else {
      setGameOver(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setDirection(-1);
      setCurrentQuestionIndex((prev) => prev - 1);
      setSelectedAnswers([]);
      setIsAnswerSubmitted(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  // Add keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentQuestion) return;

      switch (e.key) {
        case "Enter":
          // Submit answer or go to next question
          if (isAnswerSubmitted) {
            handleNext();
          } else if (
            (currentQuestion.answers.length > 0 &&
              selectedAnswers.length > 0) ||
            (currentQuestion.answers.length === 0 && textAnswer.length > 0)
          ) {
            handleSubmit();
          }
          break;

        case " ": // Space
          if (
            currentQuestion.answers.length > 0 &&
            focusedAnswerIndex >= 0 &&
            !isAnswerSubmitted
          ) {
            e.preventDefault(); // Prevent page scroll
            handleAnswerSelect(currentQuestion.answers[focusedAnswerIndex]);
          }
          break;

        case "ArrowUp":
          if (currentQuestion.answers.length > 0) {
            e.preventDefault();
            setFocusedAnswerIndex((prev) =>
              prev <= 0 ? currentQuestion.answers.length - 1 : prev - 1
            );
          }
          break;

        case "ArrowDown":
          if (currentQuestion.answers.length > 0) {
            e.preventDefault();
            setFocusedAnswerIndex((prev) =>
              prev >= currentQuestion.answers.length - 1 ? 0 : prev + 1
            );
          }
          break;

        case "Tab":
          if (currentQuestion.answers.length > 0) {
            e.preventDefault();
            if (e.shiftKey) {
              setFocusedAnswerIndex((prev) =>
                prev <= 0 ? currentQuestion.answers.length - 1 : prev - 1
              );
            } else {
              setFocusedAnswerIndex((prev) =>
                prev >= currentQuestion.answers.length - 1 ? 0 : prev + 1
              );
            }
          }
          break;

        // Number keys 1-9 for quick answer selection
        default:
          const num = parseInt(e.key);
          if (
            !isAnswerSubmitted &&
            currentQuestion.answers.length > 0 &&
            num >= 1 &&
            num <= currentQuestion.answers.length
          ) {
            handleAnswerSelect(currentQuestion.answers[num - 1]);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentQuestion,
    focusedAnswerIndex,
    isAnswerSubmitted,
    selectedAnswers,
    textAnswer,
  ]);

  // Reset focused answer when question changes
  useEffect(() => {
    setFocusedAnswerIndex(-1);
  }, [currentQuestionIndex]);

  // Add a new useEffect to focus the input when the question changes
  useEffect(() => {
    if (currentQuestion && currentQuestion.answers.length === 0) {
      inputRef.current?.focus();
    }
  }, [currentQuestion]);

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
                {currentQuestion.answers.length > 0 ? (
                  // Multiple choice answers
                  currentQuestion.answers.map((answer, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      onClick={() => handleAnswerSelect(answer)}
                      onFocus={() => setFocusedAnswerIndex(index)}
                      disabled={isAnswerSubmitted}
                      className={`w-full text-left py-3.5 px-5 rounded-[14px] text-[17px] transition-all outline-none
                        ${
                          selectedAnswers.includes(answer) && !isAnswerSubmitted
                            ? "bg-[var(--ios-blue-light)] text-[var(--ios-blue)]"
                            : "bg-[var(--ios-background)]"
                        } ${
                        isAnswerSubmitted &&
                        isCorrectAnswer(answer, currentQuestion)
                          ? "bg-[var(--ios-green-light)] text-[var(--ios-green)]"
                          : ""
                      } ${
                        isAnswerSubmitted &&
                        selectedAnswers.includes(answer) &&
                        !isCorrectAnswer(answer, currentQuestion)
                          ? "bg-[var(--ios-red-light)] text-[var(--ios-red)]"
                          : ""
                      } ${
                        focusedAnswerIndex === index
                          ? "ring-2 ring-[var(--ios-blue)] ring-offset-2"
                          : ""
                      }`}
                    >
                      {String.fromCharCode(97 + index)}) {answer}
                    </motion.button>
                  ))
                ) : (
                  // Text input for questions without answers
                  <div className="space-y-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          !isAnswerSubmitted &&
                          textAnswer.length > 0
                        ) {
                          e.preventDefault(); // Prevent form submission
                          handleSubmit();
                          // Add delay before moving to next question
                          if (currentQuestionIndex < questions.length - 1) {
                            setTimeout(() => {
                              handleNext();
                            }, 1500); // 1.5 second delay
                          }
                        }
                      }}
                      autoFocus
                      disabled={isAnswerSubmitted}
                      placeholder="Type your answer here..."
                      className={`w-full py-3.5 px-5 rounded-[14px] text-[17px] transition-all
                        border border-[var(--ios-border)] bg-[var(--ios-background)]
                        ${
                          isAnswerSubmitted &&
                          isCorrectAnswer(textAnswer, currentQuestion)
                            ? "bg-[var(--ios-green-light)] text-[var(--ios-green)] border-[var(--ios-green)]"
                            : isAnswerSubmitted
                            ? "bg-[var(--ios-red-light)] text-[var(--ios-red)] border-[var(--ios-red)]"
                            : ""
                        }`}
                    />
                    {isAnswerSubmitted &&
                      !isCorrectAnswer(textAnswer, currentQuestion) && (
                        <p className="text-[var(--ios-red)] text-[15px]">
                          Correct answer: {currentQuestion.correct}
                        </p>
                      )}
                  </div>
                )}
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
              disabled={
                currentQuestion.answers.length > 0
                  ? selectedAnswers.length === 0
                  : !textAnswer
              }
              className={`px-7 py-2.5 rounded-[14px] text-[17px] transition-all
                ${
                  (
                    currentQuestion.answers.length > 0
                      ? selectedAnswers.length === 0
                      : !textAnswer
                  )
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

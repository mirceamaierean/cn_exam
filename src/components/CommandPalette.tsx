import * as Dialog from "@radix-ui/react-dialog";
import { Search, Command } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  question: string;
  answers: string[];
  correct: string;
}

interface CommandPaletteProps {
  questions: Question[];
  onQuestionSelect: (index: number) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({
  questions,
  onQuestionSelect,
  isOpen,
  onOpenChange,
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset search when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredQuestions = useMemo(() => {
    const searchLower = search.toLowerCase().trim();

    // Handle "q123" or just "123" format
    const questionNumberMatch = searchLower.match(/^q?(\d+)$/);
    if (questionNumberMatch) {
      const number = parseInt(questionNumberMatch[1]) - 1;
      if (number >= 0 && number < questions.length) {
        return [{ question: questions[number], index: number }];
      }
    }

    return questions
      .map((question, index) => ({ question, index }))
      .filter(({ question, index }) => {
        return (
          // Match question number
          (index + 1).toString().includes(searchLower) ||
          // Match question text
          question.question.toLowerCase().includes(searchLower)
        );
      });
  }, [search, questions]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev >= filteredQuestions.length - 1 ? 0 : prev + 1
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev <= 0 ? filteredQuestions.length - 1 : prev - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredQuestions[selectedIndex]) {
            onQuestionSelect(filteredQuestions[selectedIndex].index);
            onOpenChange(false);
          }
          break;
        case "Escape":
          e.preventDefault();
          onOpenChange(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    selectedIndex,
    filteredQuestions,
    onQuestionSelect,
    onOpenChange,
  ]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          style={{
            animation: "overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
        <Dialog.Content className="fixed top-[20%] left-1/2 -translate-x-1/2 w-[90%] max-w-[500px] p-4 rounded-[18px] bg-[var(--ios-card-background)] border border-[var(--ios-border)] shadow-lg">
          <div className="flex items-center gap-2 px-3 py-2 mb-4 rounded-[10px] bg-[var(--ios-background)]">
            <Search className="w-5 h-5 text-[var(--ios-text-secondary)]" />
            <Dialog.Title asChild>
              <input
                className="flex-1 bg-transparent border-none outline-none text-[17px] text-[var(--ios-text)] placeholder-[var(--ios-text-secondary)]"
                placeholder="Search questions (e.g. 'q123' or search text)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </Dialog.Title>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[6px] bg-[var(--ios-border)] text-[var(--ios-text-secondary)]">
              <Command className="w-3 h-3" />
              <span className="text-[11px]">K</span>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            <AnimatePresence initial={false} mode="popLayout">
              {filteredQuestions.length > 0 ? (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {filteredQuestions.map(({ question, index }, arrayIndex) => (
                    <motion.button
                      key={`${index}-${question.question}`}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        duration: 0.15,
                        layout: { duration: 0.15 },
                      }}
                      className={`w-full text-left p-3 rounded-[14px] transition-colors ${
                        selectedIndex === arrayIndex
                          ? "bg-[var(--ios-blue-light)] text-[var(--ios-blue)]"
                          : "hover:bg-[var(--ios-background)] text-[var(--ios-text)]"
                      }`}
                      onClick={() => {
                        onQuestionSelect(index);
                        onOpenChange(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(arrayIndex)}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-[15px] font-medium text-[var(--ios-text)]">
                          Q{index + 1}
                        </span>
                        <span className="text-[15px]">{question.question}</span>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8 text-[var(--ios-text-secondary)]"
                >
                  No questions found
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

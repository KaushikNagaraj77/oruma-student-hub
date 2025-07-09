import { useState, ChangeEvent, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface CaptionEditorProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
}

const TAG_REGEX = /(#[a-zA-Z0-9_]+)/g;
const MENTION_REGEX = /(@[a-zA-Z0-9_]+)/g;

// Dummy suggestions - replace with API call in future
const dummyHashtagSuggestions = ["studytips", "campuslife", "projectinspiration", "finalscram", "universityevents"];
const dummyMentionSuggestions = ["studybuddies", "professorsmith", "campusnews", "eventscommittee"];


const CaptionEditor = ({
  value,
  onChange,
  maxLength = 500,
  placeholder = "Write a caption..."
}: CaptionEditorProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [currentWord, setCurrentWord] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);

      // Basic suggestion logic
      const cursorPos = event.target.selectionStart;
      const textUpToCursor = newValue.substring(0, cursorPos);
      const words = textUpToCursor.split(/\s+/);
      const currentTyping = words[words.length - 1];
      setCurrentWord(currentTyping);

      if (currentTyping.startsWith("#") && currentTyping.length > 1) {
        setSuggestions(dummyHashtagSuggestions.filter(s => s.toLowerCase().includes(currentTyping.substring(1).toLowerCase())));
        setShowSuggestions(true);
      } else if (currentTyping.startsWith("@") && currentTyping.length > 1) {
        setSuggestions(dummyMentionSuggestions.filter(s => s.toLowerCase().includes(currentTyping.substring(1).toLowerCase())));
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
        setSuggestions([]);
      }
    }
  };

  const applySuggestion = (suggestionText: string) => {
    const text = value;
    const cursorPos = textareaRef.current?.selectionStart ?? text.length;
    const textUpToCursor = text.substring(0, cursorPos);
    const lastWordIndex = textUpToCursor.lastIndexOf(currentWord);

    let prefix = currentWord.startsWith("#") ? "#" : "@";

    const newValue =
      text.substring(0, lastWordIndex) +
      prefix + suggestionText +
      text.substring(cursorPos);

    onChange(newValue);
    setShowSuggestions(false);
    setSuggestions([]);

    // Focus and set cursor position after suggestion
    setTimeout(() => {
      textareaRef.current?.focus();
      const newCursorPos = lastWordIndex + prefix.length + suggestionText.length +1;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const renderHighlightedText = (text: string) => {
    const parts = text.split(/(\s+)/); // Split by space, keeping spaces
    return parts.map((part, index) => {
      if (TAG_REGEX.test(part)) {
        return <span key={index} className="text-primary">{part}</span>;
      }
      if (MENTION_REGEX.test(part)) {
        return <span key={index} className="text-secondary">{part}</span>;
      }
      return part;
    });
  };

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <div className="relative w-full" ref={editorRef}>
      <div
        className={cn(
          "w-full p-3 border rounded-lg transition-all bg-background",
          isFocused ? "border-primary ring-2 ring-primary/30" : "border-input hover:border-muted-foreground/50",
          value.length > maxLength * 0.9 && value.length < maxLength ? "border-yellow-500" : "",
          value.length === maxLength ? "border-destructive" : ""
        )}
      >
        {/* Hidden div for text rendering and height calculation - can be complex to sync perfectly */}
        {/* For simplicity, direct textarea styling is often preferred unless rich-text features are critical */}
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            // Don't hide suggestions immediately on blur if a suggestion is clicked
            // setTimeout(() => setShowSuggestions(false), 150);
          }}
          placeholder={placeholder}
          className="w-full min-h-[120px] p-0 border-none focus:ring-0 resize-none bg-transparent text-foreground placeholder:text-muted-foreground"
          maxLength={maxLength} // Native maxLength for enforcement
        />
         {/* Custom highlighting overlay - can be tricky with cursor position and editing:
         <div
            className="absolute inset-0 p-3 pointer-events-none whitespace-pre-wrap break-words min-h-[120px] text-transparent"
            aria-hidden="true"
          >
            {renderHighlightedText(value + " ")}
          </div>
        */}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-40 overflow-y-auto custom-scrollbar">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => applySuggestion(suggestion)}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-muted/50 text-foreground"
            >
              {currentWord.startsWith("#") ? "#" : "@"}{suggestion}
            </button>
          ))}
        </div>
      )}

      <div className="text-xs text-right mt-1.5 pr-1">
        <span className={cn(
          value.length > maxLength * 0.9 && value.length < maxLength ? "text-yellow-600" : "text-muted-foreground",
          value.length === maxLength ? "text-destructive font-medium" : ""
        )}>
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  );
};

export default CaptionEditor;

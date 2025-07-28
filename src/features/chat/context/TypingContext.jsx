import { createContext, useContext } from "react";

const TypingContext = createContext(null);

export function useTypingContext() {
  const ctx = useContext(TypingContext);
  if (!ctx) {
    throw new Error("useTypingContext must be used within a TypingProvider");
  }
  return ctx;
}

export default TypingContext;

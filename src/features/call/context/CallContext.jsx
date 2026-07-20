import { createContext, useContext } from "react";

const CallContext = createContext(null);

export default CallContext;

export function useCallContext() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCallContext must be used inside CallProvider");
  return ctx;
}

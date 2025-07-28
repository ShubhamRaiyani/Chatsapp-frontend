import { createContext, useContext } from "react";

const SubscriptionContext = createContext(null);

export function useSubscriptionContext() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscriptionContext must be used within a SubscriptionProvider"
    );
  }
  return context;
}

export default SubscriptionContext;

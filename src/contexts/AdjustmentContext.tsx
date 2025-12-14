import React, { createContext, useContext } from "react";

interface AdjustmentContextType {
  openDialogWithRequest: (requestId: string) => Promise<void>;
}

const AdjustmentContext = createContext<AdjustmentContextType | undefined>(
  undefined
);

export const useAdjustment = () => {
  const context = useContext(AdjustmentContext);
  if (!context) {
    throw new Error("useAdjustment phải được dùng trong AdjustmentProvider");
  }
  return context;
};

interface AdjustmentProviderProps {
  openDialogWithRequest: (requestId: string) => Promise<void>;
  children: React.ReactNode;
}

export const AdjustmentProvider: React.FC<AdjustmentProviderProps> = ({
  openDialogWithRequest,
  children,
}) => {
  return (
    <AdjustmentContext.Provider value={{ openDialogWithRequest }}>
      {children}
    </AdjustmentContext.Provider>
  );
};

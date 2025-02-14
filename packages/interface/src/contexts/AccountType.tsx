import React, { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type AccountType = "none" | "extension" | "embedded";

interface AccountTypeContextType {
  accountType: AccountType;
  storeAccountType: (accountType: AccountType) => void;
}

interface AccountTypeProviderProps {
  children: ReactNode;
}

export const AccountTypeContext = createContext<AccountTypeContextType | undefined>(undefined);

export const AccountTypeProvider: React.FC<AccountTypeProviderProps> = ({ children }: AccountTypeProviderProps) => {
  const [accountType, setAccountType] = useState<AccountType>("none");

  useEffect(() => {
    const cachedAccountType = localStorage.getItem("accountType");
    if (
      cachedAccountType &&
      (cachedAccountType === "none" || cachedAccountType === "extension" || cachedAccountType === "embedded")
    ) {
      setAccountType(cachedAccountType);
    }
  }, []);

  const storeAccountType = (account: AccountType) => {
    localStorage.setItem("accountType", account);
    setAccountType(account);
  };

  const value = useMemo(
    () => ({
      accountType,
      storeAccountType,
    }),
    [accountType, storeAccountType],
  );

  return <AccountTypeContext.Provider value={value as AccountTypeContextType}>{children}</AccountTypeContext.Provider>;
};

export const useAccountType = (): AccountTypeContextType => {
  const accountTypeContext = useContext(AccountTypeContext);

  if (!accountTypeContext) {
    throw new Error("Should use context inside provider.");
  }

  return accountTypeContext;
};

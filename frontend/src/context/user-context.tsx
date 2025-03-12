import { createContext, ReactNode, useState } from "react";
import { LoginUserResponse } from "../api/auth-api";

interface UserContextType {
  user: LoginUserResponse | null;
  setUser: (user: LoginUserResponse | null) => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export function UserContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginUserResponse | null>(null);

  // TODO - add cookie to avoid sign in on refresh

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

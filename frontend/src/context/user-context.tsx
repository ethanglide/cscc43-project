import { createContext, ReactNode, useEffect, useState } from "react";
import { AuthApi, LoginUserResponse } from "../api/auth-api";
import { useCookies } from "react-cookie";

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
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);

  function setUserWithCookie(user: LoginUserResponse | null) {
    setUser(user);

    if (user) {
      setCookie("user", JSON.stringify(user), { path: "/" });
    } else {
      removeCookie("user");
    }
  }

  // Load user from cookies on initial render
  async function loadUserFromCookies() {
    if (!cookies.user) {
      return;
    }

    const userFromCookie = cookies.user as LoginUserResponse;

    const response = await AuthApi.tokenTest(userFromCookie.accessToken);
    if ("error" in response) {
      setUser(null);
      removeCookie("user");
      return;
    }

    setUser(userFromCookie);
  }

  useEffect(() => {
    loadUserFromCookies();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser: setUserWithCookie }}>
      {children}
    </UserContext.Provider>
  );
}


import { createContext, useContext, useState, type ReactNode, type FC } from "react";
export type User = {
  name: string;
  email: string;
  role: "admin" | "customer";
};

interface AuthContextType {
  user: User | null; // current logged-in user, null if not logged in
  login: (userData: User, token: string) => void; // function to log in user
  logout: () => void; // function to log out user
}

// eslint-disable-next-line react-refresh/only-export-components
export const authContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // FC<{ children: ReactNode }> → This component can wrap any React elements as children

  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("pos-user");
    return storedUser ? JSON.parse(storedUser) : null;
  });


  const login = (userData: User, token: string) => {
    setUser(userData); // update state
    localStorage.setItem("pos-user", JSON.stringify(userData)); 
    localStorage.setItem("token", token);
  };


  const logout = () => {
    setUser(null); // clear state
    localStorage.removeItem("pos-user"); // remove stored user
    localStorage.removeItem("token"); // remove stored token
  };

  return (
    <authContext.Provider value={{ user, login, logout }}>
      {children}
      {/* Any component inside AuthProvider can access `user`, `login`, `logout` */}
    </authContext.Provider>
  );
};

// 5. Custom hook to use the auth context

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(authContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context; 
};

// context/UserContext.tsx
"use client";
import { createContext, useContext } from "react";

interface UserContextType {
  userId: string | null;
}

export const UserContext = createContext<UserContextType>({ userId: null }); // ✅ named export

export const useUser = () => useContext(UserContext); // ✅ named export
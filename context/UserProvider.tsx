// context/UserProvider.tsx
"use client";

import { UserContext } from "@/context/UserContext";

export default function UserProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string | null;
}) {
  return (
    <UserContext.Provider value={{ userId }}>
      {children}
    </UserContext.Provider>
  );
}
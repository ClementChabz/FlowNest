import React, { createContext, useState, useContext } from 'react';

type AuthContextType = {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const safeChildren = React.Children.toArray(children).filter(child =>
    typeof child !== 'string'  //empeche les strings : super important pour que react soit content !!
  );

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {safeChildren}
    </AuthContext.Provider>
  );
};



export const useAuth = () => {
  const context = useContext(AuthContext);
  console.log("Je suis dans l'écran auth 2")
  if (!context) throw new Error('useAuth must be used within an AuthProvider');

  return context;
};
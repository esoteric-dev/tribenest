"use client";

import axios from "axios";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TOKEN_KEY = "creator_portal_token";

export type CreatorAccount = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type CreatorProfile = {
  id: string;
  subdomain: string;
  name: string;
};

export type CreatorAuthorization = {
  id: string;
  profileId: string;
  isOwner: boolean;
  profile: CreatorProfile;
};

type CreatorAuthContextType = {
  account: CreatorAccount | null;
  authorizations: CreatorAuthorization[];
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<CreatorAuthorization[]>;
  logout: () => void;
  signup: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<{ account: CreatorAccount; token: string }>;
  createProfile: (data: { subdomain: string; name: string }) => Promise<CreatorProfile>;
};

const CreatorAuthContext = createContext<CreatorAuthContextType>({} as CreatorAuthContextType);

export function CreatorAuthProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<CreatorAccount | null>(null);
  const [authorizations, setAuthorizations] = useState<CreatorAuthorization[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = useCallback(async (authToken: string): Promise<CreatorAuthorization[]> => {
    const client = axios.create({
      baseURL: API_URL,
      headers: { authorization: `Bearer ${authToken}` },
    });
    const [meRes, authRes] = await Promise.all([
      client.get("/accounts/me"),
      client.get("/accounts/authorizations"),
    ]);
    setAccount(meRes.data);
    setAuthorizations(authRes.data);
    return authRes.data;
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (!saved) {
      setIsLoading(false);
      return;
    }
    setToken(saved);
    fetchSession(saved)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, [fetchSession]);

  const login = async (email: string, password: string): Promise<CreatorAuthorization[]> => {
    const res = await axios.post(`${API_URL}/sessions`, { email, password });
    const newToken: string = res.data.token;
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    return fetchSession(newToken);
  };

  const signup = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ account: CreatorAccount; token: string }> => {
    const res = await axios.post(`${API_URL}/accounts`, data);
    const { account: acc, token: newToken } = res.data;
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setAccount(acc);
    return { account: acc, token: newToken };
  };

  const createProfile = async (data: { subdomain: string; name: string }): Promise<CreatorProfile> => {
    const client = axios.create({
      baseURL: API_URL,
      headers: { authorization: `Bearer ${token}` },
    });
    const res = await client.post("/profiles", data);
    const profile: CreatorProfile = res.data;
    setAuthorizations((prev) => [
      ...prev,
      { id: crypto.randomUUID(), profileId: profile.id, isOwner: true, profile },
    ]);
    return profile;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setAccount(null);
    setAuthorizations([]);
  };

  return (
    <CreatorAuthContext.Provider
      value={{
        account,
        authorizations,
        token,
        isLoading,
        isAuthenticated: !!account,
        login,
        logout,
        signup,
        createProfile,
      }}
    >
      {children}
    </CreatorAuthContext.Provider>
  );
}

export const useCreatorAuth = () => useContext(CreatorAuthContext);

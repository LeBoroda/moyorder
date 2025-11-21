import type { UserProfile } from "../types/auth";
import type { PriceLevel } from "../types/pricing";
import { readEnv } from "../utils/env";

type Listener = () => void;

const PRICE_LEVEL_BY_EMAIL: Record<string, PriceLevel> = {
  "small@beer.ru": "basic",
  "big@beer.ru": "level1",
};

const SESSION_STORAGE_KEY = "ms-user-session";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function resolvePriceLevel(email: string): PriceLevel | null {
  return PRICE_LEVEL_BY_EMAIL[normalizeEmail(email)] ?? null;
}

function hasCredentials() {
  return Boolean(readEnv("MOYSKLAD_PASSWORD"));
}

function saveUserToStorage(user: UserProfile): void {
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.warn("Failed to save user session to localStorage", error);
  }
}

function loadUserFromStorage(): UserProfile | null {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const user = JSON.parse(raw) as UserProfile;
    if (user && user.email && user.priceLevel) {
      const currentPriceLevel = resolvePriceLevel(user.email);
      if (currentPriceLevel === user.priceLevel) {
        return user;
      }
    }
    clearUserFromStorage();
    return null;
  } catch (error) {
    console.warn("Failed to load user session from localStorage", error);
    clearUserFromStorage();
    return null;
  }
}

function clearUserFromStorage(): void {
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear user session from localStorage", error);
  }
}

interface AuthState {
  user: UserProfile | null;
}

class AuthModel {
  private state: AuthState;

  private listeners = new Set<Listener>();

  constructor() {
    const savedUser = loadUserFromStorage();
    this.state = { user: savedUser };
  }

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.state;

  setUser = (user: UserProfile) => {
    this.state = { user };
    saveUserToStorage(user);
    this.emit();
  };

  clearUser = () => {
    if (!this.state.user) return;
    this.state = { user: null };
    clearUserFromStorage();
    this.emit();
  };

  hasCredentials = () => hasCredentials();

  resolvePriceLevel = resolvePriceLevel;

  private emit() {
    this.listeners.forEach((listener) => listener());
  }
}

export const authModel = new AuthModel();

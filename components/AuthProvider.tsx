"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Branch, Year } from "@/lib/types";
import { supabase, type UsersRow } from "@/lib/supabase";

/** A credential record as persisted in `localStorage`. */
export interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  department: Branch;
  year: Year;
  prn: string;
}

/** The active session: the same record minus the secret. */
export type Student = Omit<StoredUser, "password">;

export interface RegistrationDraft {
  name: string;
  email: string;
  department: Branch;
  year: Year;
  prn: string;
  password: string;
}

export const USERS_KEY = "met_campus_users";
export const SESSION_KEY = "active_student_session";
/** Marks the one-time demo seed so signing out stays signed out after reload. */
const SEEDED_KEY = "met_campus_seeded";

/**
 * Accepted mailbox domains: the official MET campus domain plus personal Gmail.
 * Held as data so the UI copy and the validator can never drift apart.
 */
export const ALLOWED_EMAIL_DOMAINS = ["@met.edu.in", "@gmail.com"] as const;

/** Primary domain, used by the seeded demo credentials. */
export const MET_EMAIL_DOMAIN = ALLOWED_EMAIL_DOMAINS[0];

/** Single message shown whenever an address falls outside both domains. */
export const INVALID_EMAIL_MESSAGE =
  "Please enter a valid @met.edu.in or @gmail.com address.";

/** Matches a local part followed by either allowed domain, case-insensitively. */
const EMAIL_PATTERN = /^[^\s@]+@(met\.edu\.in|gmail\.com)$/i;

/** Shown for any credential mismatch — never leak which field was wrong. */
export const INVALID_CREDENTIALS = "Invalid MET email or password. Please try again.";
/** Shown by the reset flow when the address has no account. */
export const UNKNOWN_ACCOUNT = "No account registered with this email address.";

export const DEPARTMENTS: Branch[] = ["Computer", "IT", "AIDS", "Mechanical", "Civil"];
export const ACADEMIC_YEARS: Year[] = ["FE", "SE", "TE", "BE"];

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

/**
 * Canonical form applied to every query and insert, so `Roll@Gmail.com` and
 * `roll@gmail.com` resolve to the same record — the client-side equivalent of
 * querying a lower-cased / citext unique index on the users table.
 */
export function normaliseEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Seeded credentials. Judges get a working account on first load, and the
 * visible profile is already signed in so the dashboard is never a blank wall.
 */
export const DEMO_USERS: StoredUser[] = [
  {
    id: "stu-2417",
    name: "Prathamesh Thorwat",
    email: "prathamesh.thorwat@met.edu.in",
    password: "campus123",
    department: "Computer",
    year: "SE",
    prn: "72183041",
  },
  {
    id: "stu-2588",
    name: "Aishwarya Kulkarni",
    email: "aishwarya.kulkarni@met.edu.in",
    password: "campus123",
    department: "IT",
    year: "TE",
    prn: "72184490",
  },
];

/** Projects a credential record down to the session shape (drops the secret). */
function toSession(user: StoredUser): Student {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    department: user.department,
    year: user.year,
    prn: user.prn,
  };
}

/* ── localStorage helpers ─────────────────────────────────────────── */

function ls(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null; // Private mode / storage disabled.
  }
}

function readJson<T>(key: string): T | undefined {
  const store = ls();
  if (!store) return undefined;
  try {
    const raw = store.getItem(key);
    return raw === null ? undefined : (JSON.parse(raw) as T);
  } catch {
    return undefined;
  }
}

function writeJson(key: string, value: unknown): void {
  const store = ls();
  if (!store) return;
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    // Non-fatal: the in-memory state still drives the UI.
  }
}

function removeKey(key: string): void {
  const store = ls();
  if (!store) return;
  try {
    store.removeItem(key);
  } catch {
    /* ignore */
  }
}

/**
 * Guarantees `met_campus_users` holds at least the demo accounts. Called from
 * both the mount effect and every credential mutation so sign-in works even if
 * the very first interaction beats the effect.
 */
export function ensureSeededUsers(): StoredUser[] {
  const existing = readJson<StoredUser[]>(USERS_KEY);
  if (existing && Array.isArray(existing) && existing.length > 0) return existing;
  writeJson(USERS_KEY, DEMO_USERS);
  return DEMO_USERS;
}

export function findUserByEmail(email: string): StoredUser | undefined {
  const target = normaliseEmail(email);
  return ensureSeededUsers().find((user) => normaliseEmail(user.email) === target);
}

/* ── Supabase access ──────────────────────────────────────────────── */

/**
 * Looks the account up in Postgres. Returns `null` when Supabase is not
 * configured or the row is missing, which routes the caller to the local store.
 * The email is always lower-cased before the comparison so logins stay
 * case-insensitive regardless of how the address was typed.
 */
async function remoteUserByEmail(email: string): Promise<UsersRow | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", normaliseEmail(email))
    .maybeSingle();
  if (error || !data) return null;
  return data as UsersRow;
}

function remoteToStored(row: UsersRow): StoredUser {
  return {
    id: row.id,
    name: row.full_name,
    email: normaliseEmail(row.email),
    password: row.password,
    department: row.department as Branch,
    year: row.year as Year,
    prn: row.prn,
  };
}

/* ── Context ──────────────────────────────────────────────────────── */

interface AuthContextValue {
  user: Student | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (draft: RegistrationDraft) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Visitors start signed out. A session only exists once it is written by
  // `signIn`/`register`, so the first paint never shows a fake identity.
  const [user, setUser] = useState<Student | null>(null);

  useEffect(() => {
    const store = ls();
    if (!store) return;

    // Seeds the two demo credential records only — no session is created, so
    // the absence of `active_student_session` always means "signed out".
    ensureSeededUsers();

    if (!readJson<string>(SEEDED_KEY)) {
      writeJson(SEEDED_KEY, new Date().toISOString());
      return;
    }

    const stored = readJson<Student>(SESSION_KEY);
    setUser(stored ?? null);
  }, []);

  const signIn = useCallback<AuthContextValue["signIn"]>(async (email, password) => {
    // Cloud first, then the local store — so an account created on one device
    // signs in on another.
    const remote = await remoteUserByEmail(email);
    const record = remote ? remoteToStored(remote) : findUserByEmail(email);

    // Single generic failure for "no such account" and "wrong password" so the
    // form cannot be used to enumerate registered addresses.
    if (!record || record.password !== password) {
      throw new Error(INVALID_CREDENTIALS);
    }

    const session = toSession(record);
    writeJson(SESSION_KEY, session);
    setUser(session);
  }, []);

  const register = useCallback<AuthContextValue["register"]>(async (draft) => {
    const email = normaliseEmail(draft.email);

    if ((await remoteUserByEmail(email)) !== null) {
      throw new Error("An account already exists with this email address.");
    }

    const record: StoredUser = {
      id: `stu-${Date.now().toString(36)}`,
      name: draft.name.trim(),
      email,
      password: draft.password,
      department: draft.department,
      year: draft.year,
      prn: draft.prn.trim(),
    };

    if (supabase) {
      const { error } = await supabase.from("users").insert({
        id: record.id,
        full_name: record.name,
        email: record.email,
        password: record.password,
        department: record.department,
        year: record.year,
        prn: record.prn,
      });
      if (error) throw new Error(error.message);
    }

    // Mirror locally so the demo keeps working if Supabase is later removed.
    const users = ensureSeededUsers();
    writeJson(USERS_KEY, [
      ...users.filter((user) => normaliseEmail(user.email) !== email),
      record,
    ]);

    const session = toSession(record);
    writeJson(SESSION_KEY, session);
    setUser(session);
  }, []);

  const signOut = useCallback(() => {
    removeKey(SESSION_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, signIn, register, signOut }),
    [register, signIn, signOut, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}

export { initials };
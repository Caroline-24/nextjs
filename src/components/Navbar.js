"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import styles from "./Navbar.module.css"; // //Your stylesheet


export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className={`${styles.navbar} section`}>
      {/* ... other nav content ... */}
      <div className={styles.authSection}>
        {status === "loading" ? (
          <span>Loading...</span>
        ) : session ? (
          <>
            <span className={styles.userEmail}>{session.user.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className={styles.signOutBtn}
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link href="/auth/signin" className={styles.signInLink}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
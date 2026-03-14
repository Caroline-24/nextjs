"use client";

import { memo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Filters.module.css";
import Link from "next/link";

const Filters = memo(({ titles, title, search }) => {
  const router = useRouter();

  const [selectedTitle, setSelectedTitle] = useState(title || "");
  const [searchName, setSearchName] = useState(search || "");

  const handleClick = () => {
    const params = new URLSearchParams();

    if (selectedTitle) params.set("title", selectedTitle);
    if (searchName) params.set("search", searchName);

    router.push(`/?${params.toString()}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.dropdown}>
        <label htmlFor="title" className={styles.label}>
          Select a title:
        </label>

        <select
          id="title"
          value={selectedTitle}
          onChange={(e) => setSelectedTitle(e.target.value)}
          className={styles.select}
        >
          <option value="">All</option>

          {titles.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.search}>
        <label htmlFor="search" className={styles.label}>
          Search a name:
        </label>

        <input
          id="search"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className={styles.input}
        />
      </div>

      <button className={styles.button} onClick={handleClick}>
        Apply
      </button>

      <Link href="/">Clear</Link>
    </div>
  );
});

export default Filters;
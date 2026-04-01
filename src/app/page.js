import styles from "./page.module.css";
import Filters from "../components/Filters";
import Card from "../components/Card";
import prisma from './lib/prisma' 

export const metadata = {
  title: "Profile Directory",
  description: "Profile Directory App",
};

export default async function Home({ searchParams }) {
  const params = await searchParams;

  const selectedTitle = params?.title || "";
  const selectedSearch = params?.search || "";

  const profiles = await prisma.profiles.findMany({
    where: {
      ...(selectedTitle && {
        title: { contains: selectedTitle, mode: "insensitive" },
      }),
      ...(selectedSearch && {
        name: { contains: selectedSearch, mode: "insensitive" },
      }),
    },
  });

  const titles = [
    ...new Set(profiles.map((profile) => profile.title)),
  ];

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Profile Directory</h1>

        <Filters
          titles={titles}
          title={selectedTitle}
          search={selectedSearch}
        />

        <div className={styles.grid}>
          {profiles.map((profile) => (
            <Card key={profile.id} profile={profile} />
          ))}
        </div>
      </main>
    </div>
  );
}


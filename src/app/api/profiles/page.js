import Link from "next/link";
import prisma from "@/app/lib/prisma";
import styles from "./page.module.css";

export const metadata = {
  title: "Profile Directory",
  description: "Profile Directory App",
};

export default async function ProfileDetailPage({ params }) {
  const { id } = params;
  const profile = await prisma.profiles.findUnique({
    where: { id: parseInt(id) },
  });

  if (!profile) {
    return <p>Profile not found.</p>;
  }

  return (
    <div className={styles.page} style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>{profile.name}</h1>
      <p style={{ textAlign: "center" }}>Title: {profile.title}</p>
      <p style={{ textAlign: "center" }}>Email: {profile.email}</p>
      <figure style={{ display: "flex", justifyContent: "center" }}>
        <img
          src={profile.image_url}
          alt={profile.name}
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </figure>

      {/* Link to edit this profile */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Link
          href={`/profiles/edit/${profile.id}`}
          style={{
            backgroundColor: "blue",
            color: "white",
            padding: "10px 20px",
            borderRadius: "5px",
            textDecoration: "none",
          }}
        >
          Edit Profile
        </Link>
      </div>
    </div>
  );
}
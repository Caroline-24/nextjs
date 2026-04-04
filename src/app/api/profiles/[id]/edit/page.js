import prisma from "@/app/lib/prisma";
import AddProfileForm from "@/components/AddProfileForm";
import DeleteButton from "@/components/DeleteButton";

async function fetchProfile(id) {
  const data = await prisma.profiles.findUnique({
    where: { id: parseInt(id) },
  });
  return data ? data : null;
}

export async function generateMetadata({ params }) {
  const { id } = params;
  return {
    title: `Edit Profile ${id}`,
    description: `Edit details of profile with ID ${id}`,
  };
}

export default async function ProfilePage({ params }) {
  const { id } = params;
  const profile = await fetchProfile(id);

  if (!profile) {
    return <p>Profile not found.</p>;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1>Edit Profile {profile.name}</h1>

      {/* Reusable form component for editing */}
      <AddProfileForm profile={profile} profileId={profile.id} />

      <DeleteButton profileId={profile.id} />
    </div>
  );
}
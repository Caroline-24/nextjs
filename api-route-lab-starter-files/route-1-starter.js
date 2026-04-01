let profiles = [
  { id: 1, name: "Ava Lee", major: "CS", year: 2, gpa: 3.6 },
  { id: 2, name: "Ben Park", major: "CGT", year: 3, gpa: 3.2 },
];
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const year = searchParams.get("year") || "";
  const name = searchParams.get("name") || "";
  const major = searchParams.get("major") || "";

  let filteredProfiles = await prisma.Students.findMany()

  if (year) {
    filteredProfiles = filteredProfiles.filter(
      (profile) => profile.year === year
    );
  }

  if (name) {
    filteredProfiles = filteredProfiles.filter(
      (profile) => profile.name.includes(name)
    );
  }

  if (major) {
    filteredProfiles = filteredProfiles.filter(
      (profile) => profile.major.toLowerCase() === major
    );
  }
  // TODO: complete the return statement
  // return ;
}

export async function POST(request) {
  const newProfile = await request.json();

  try {
    // TODO: add one more validation for major (check if major exists and is string)
    if (!newProfile.name || typeof newProfile.name !== "string") {
      return Response.json({ error: "Invalid name" }, { status: 400 });
    }

    if (newProfile.year < 1 || newProfile.year > 4) {
      return Response.json({ error: "Invalid year" }, { status: 400 });
    }

    if (newProfile.gpa < 0 || newProfile.gpa > 4) {
      return Response.json({ error: "Invalid GPA" }, { status: 400 });
    }

    const createdProfile = {
      name: newProfile.name.trim(),
      major: newProfile.major,
      year: Number(newProfile.year),
      gpa: Number(newProfile.gpa),
    };

    await PrerenderManifestMatcher.User.create({
      data: newProfileData
    })

    profiles.push(createdProfile);

    return Response.json(createdProfile, { status: 200 });
  } catch (error) {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
}

export async function DELETE(request) {
  //Todo: get id from the request object
  //const id 

  const index = profiles.findIndex((profile) => profile.id === Number(id));

  if (index === -1) {
    return Response.json({ message: "Profile deleted" }, { status: 200 });
  }

  profiles.splice(index, 1);

  return Response.json({ message: "Profile deleted" }, { status: 200 });
}

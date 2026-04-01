import prisma from '@/app/lib/prisma'
import { put } from '@vercel/blob'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    const title = searchParams.get("title") || "";
    const search = searchParams.get("search") || "";

    const profiles = await prisma.profiles.findMany({
      ...(title ? { where: { title: { contains: title, mode: 'insensitive' } } } : {}),
      ...(search ? { where: { name: { contains: search, mode: 'insensitive' } } } : {})
    });
  
  return Response.json({ data: profiles }, { status: 200 });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    console.log("Form Data Received");
    
    const name = formData.get("name");
    const title = formData.get("title");
    const email = formData.get("email");
    const bio = formData.get("bio");
    const imgFile = formData.get("img");

    // Validate required fields
    if (!name || name.trim() === "") {
      return Response.json({ error: "Name is required" }, { status: 400 });
    } else if (!title || title.trim() === "") {
      return Response.json({ error: "Title is required" }, { status: 400 });
    } else if (!email || email.trim() === "") {
      return Response.json({ error: "Email is required" }, { status: 400 });
    } else if (!bio || bio.trim() === "") {
      return Response.json({ error: "Bio is required" }, { status: 400 });
    }  else if (!imgFile || imgFile.size > 1024 * 1024) {
      return Response.json({ error: "Image is required and must be less than 1MB" }, { status: 400 });
    }

    // Upload image to Vercel Blob
    const blob = await put(imgFile.name, imgFile, {
      access: 'public',
      allowOverwrite: true
    });

    // Save profile to database with Blob URL
    const created = await prisma.profiles.create({
      data: {
        name: name.trim(),
        title: title.trim(),
        email: email.trim(),
        bio: bio.trim(),
        image_url: blob.url,
      },
    });
    
    return Response.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Error creating profile:", error);
    if (error.code === 'P2002') {
      return Response.json({ error: "Email already exists" }, { status: 400 });
    }
    return Response.json({ error: "Failed to create profile" }, { status: 500 });
  }
} 

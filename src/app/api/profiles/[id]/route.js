import prisma from '@/app/lib/prisma';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request, { params } = {}) {
    try {
        if (params && params.id) {
            const profileId = parseInt(params.id);
            if (isNaN(profileId)) {
                return Response.json({ error: 'Invalid profile ID' }, { status: 400 });
            }

            const profile = await prisma.profiles.findUnique({
                where: { id: profileId },
            });

            if (!profile) {
                return Response.json({ error: 'Profile not found' }, { status: 404 });
            }

            return Response.json({ data: profile }, { status: 200 });
        }

        const searchParams = request.nextUrl.searchParams;
        const title = searchParams.get("title") || "";
        const search = searchParams.get("search") || "";

        const profiles = await prisma.profiles.findMany({
            where: {
                AND: [
                    title ? { title: { contains: title, mode: 'insensitive' } } : {},
                    search ? { name: { contains: search, mode: 'insensitive' } } : {},
                ],
            },
        });

        return Response.json({ data: profiles }, { status: 200 });
    } catch (error) {
        console.error('Error fetching profile(s):', error);
        return Response.json({ error: 'Failed to fetch profile(s)' }, { status: 500 });
    }
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

        if (!name || !title || !email || !bio || !imgFile || imgFile.size > 1024 * 1024) {
            return Response.json({ error: "All fields are required and image must be <1MB" }, { status: 400 });
        }

        const blob = await put(imgFile.name, imgFile, {
            access: 'public',
            allowOverwrite: true,
        });

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

export async function PUT(request, { params }) {
    try {
        const profileId = parseInt(params.id);
        if (isNaN(profileId)) {
            return Response.json({ error: 'Invalid profile ID' }, { status: 400 });
        }

        const formData = await request.formData();
        const name = formData.get('name');
        const title = formData.get('title');
        const email = formData.get('email');
        const bio = formData.get('bio');
        const imgFile = formData.get('img');

        if (!name || !title || !email || !bio) {
            return Response.json({ error: 'All fields except image are required' }, { status: 400 });
        }

        const existingProfile = await prisma.profiles.findUnique({ where: { id: profileId } });
        if (!existingProfile) {
            return Response.json({ error: 'Profile not found' }, { status: 404 });
        }

        let imageUrl = existingProfile.image_url;
        if (imgFile && imgFile.size > 0) {
            if (imgFile.size > 1024 * 1024) {
                return Response.json({ error: 'Image must be less than 1MB' }, { status: 400 });
            }
            const blob = await put(imgFile.name, imgFile, { access: 'public' });
            imageUrl = blob.url;
        }

        const updated = await prisma.profiles.update({
            where: { id: profileId },
            data: {
                name: name.trim(),
                title: title.trim(),
                email: email.trim(),
                bio: bio.trim(),
                image_url: imageUrl,
            },
        });

        return Response.json({ data: updated }, { status: 200 });
    } catch (error) {
        console.error('Error updating profile:', error);
        if (error.code === 'P2002') return Response.json({ error: 'Email already exists' }, { status: 400 });
        if (error.code === 'P2025') return Response.json({ error: 'Profile not found' }, { status: 404 });
        return Response.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const profileId = parseInt(params.id);
        if (isNaN(profileId)) return Response.json({ error: 'Invalid profile ID' }, { status: 400 });

        await prisma.profiles.delete({ where: { id: profileId } });
        return Response.json({ message: 'Profile deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting profile:', error);
        if (error.code === 'P2025') return Response.json({ error: 'Profile not found' }, { status: 404 });
        return Response.json({ error: 'Failed to delete profile' }, { status: 500 });
    }
}
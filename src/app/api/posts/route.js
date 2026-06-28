import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// Helper to make a url-friendly slug
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// GET all posts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get('authorId');

    const where = {};
    if (authorId) {
      where.authorId = authorId;
    } else {
      where.published = true;
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        _count: {
          select: { comments: true, likes: true },
        },
      },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST create a new post
export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, coverImage, published = true } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Generate unique slug
    let baseSlug = slugify(title);
    if (!baseSlug) baseSlug = 'untitled-post';
    
    let slug = baseSlug;
    let count = 0;
    
    // Simple loop to find unique slug
    while (true) {
      const existing = await prisma.post.findUnique({
        where: { slug },
      });
      if (!existing) break;
      count++;
      slug = `${baseSlug}-${count}-${Math.floor(Math.random() * 1000)}`;
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        coverImage: coverImage || null,
        published: Boolean(published),
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ message: 'Post created successfully', post }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

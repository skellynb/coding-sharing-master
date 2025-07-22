import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const snippet = await prisma.snippet.findUnique({
      where: { id },
      select: {
        code: true,
        language: true,
        theme: true,
        createdAt: true,
      },
    });

    if (!snippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
    }

    return NextResponse.json({
      code: snippet.code,
      language: snippet.language,
      theme: snippet.theme,
      createdAt: snippet.createdAt,
    });
  } catch (error) {
    console.error("Error fetching snippet:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

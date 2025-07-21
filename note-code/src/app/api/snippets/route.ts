// Import Prisma Client to interact with your PostgreSQL database
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";






// Instantiate Prisma Client (connects to your DB)
const prisma = new PrismaClient();

// Define the POST handler for the API route: POST /api/snippets
export async function POST(req: NextRequest) {
  const {code, language, theme } = await req.json();

// Validate that all required fields are provided
  if (!code || !language || !theme) {
    return NextResponse.json({error: 'Missing fields' }, {status:400});
  }

  try {
    // Create a new snippet in the database using Prisma
    const snippet = await prisma.snippet.create({
      data: {
      id: uuidv4(), // Generate a unique UUID for this snippet
      code, 
      language,
      theme

      }
      
    });

    // Return the ID of the newly created snippet
    return NextResponse.json({id: snippet.id }, {status: 201 });

  } catch (error) {
    
   // Handle any server or database errors 
    console.error('Create error:', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500 });
  }
}

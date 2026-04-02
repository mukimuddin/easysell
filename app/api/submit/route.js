import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Public submissions are currently closed.' }, 
    { status: 403 }
  );
}

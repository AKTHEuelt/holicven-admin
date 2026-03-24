import { NextResponse } from 'next/server';
import { getEvents, createEvent } from '@/lib/db';

export async function GET() {
  try {
    const events = await getEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = await createEvent({
      title: body.title,
      description: body.description || '',
      date: body.date,
      time: body.time || '',
      location: body.location || '',
      image_url: body.image_url || '',
      active: body.active !== false
    });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

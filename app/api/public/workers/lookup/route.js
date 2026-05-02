import { NextResponse } from 'next/server';
import { normalizeWhatsappForLookup } from '@/lib/whatsappNormalize';
import { findWorkerByWhatsappInput } from '@/lib/workerLookup';

export async function POST(request) {
  try {
    const { whatsapp } = await request.json();
    const canon = normalizeWhatsappForLookup(whatsapp);
    if (!/^01\d{9}$/.test(canon)) {
      return NextResponse.json({ error: 'সঠিক WhatsApp নম্বর দিন (+৮৮০ / ৮৮০ / ০১)।' }, { status: 400 });
    }

    const found = await findWorkerByWhatsappInput(whatsapp);

    return NextResponse.json({
      canonical: canon,
      found: Boolean(found),
      worker: found
        ? { id: found.id, name: found.name || '', whatsapp: found.whatsapp }
        : null,
    });
  } catch (e) {
    console.error('public/workers/lookup', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

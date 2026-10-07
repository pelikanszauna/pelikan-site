'use server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase';

export async function requestMembership(formData) {
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const note = String(formData.get('note') || '').trim();
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) redirect('/membership?error=' + encodeURIComponent('Enter your name and a valid email.'));

  const sb = db();
  const { data: existing } = await sb.from('members').select('id,status').eq('email', email).maybeSingle();
  if (existing) {
    const msg = existing.status === 'active' ? 'You are already a member.' : 'We already have a request from this email.';
    redirect('/membership?error=' + encodeURIComponent(msg));
  }
  await sb.from('members').insert({ email, name, note: note || null, status: 'pending' });
  redirect('/membership?sent=1');
}

export async function submitFriends(formData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const f1 = String(formData.get('friend_1') || '').trim();
  const f2 = String(formData.get('friend_2') || '').trim();
  if (!/^\S+@\S+\.\S+$/.test(email) || !f1 || !f2) {
    redirect('/membership/friends?error=' + encodeURIComponent('Enter your email and both friends.'));
  }
  await db().from('friend_nominations').insert({ applicant_email: email, friend_1: f1, friend_2: f2 });
  redirect('/membership/friends?sent=1');
}

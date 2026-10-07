-- Run this once in Supabase: SQL Editor > New query > paste > Run.

create table if not exists slots (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  title text,
  audience text not null default 'open' check (audience in ('open','women','members')),
  is_private boolean not null default false,
  capacity int not null default 7 check (capacity > 0),
  price_member int not null default 3000,
  price_nonmember int not null default 4000,
  notes text,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  status text not null default 'pending' check (status in ('pending','active','lapsed','rejected')),
  note text,
  joined_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists friend_nominations (
  id uuid primary key default gen_random_uuid(),
  applicant_email text not null,
  friend_1 text not null,
  friend_2 text not null,
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references slots(id) on delete restrict,
  email text not null,
  name text not null,
  quantity int not null check (quantity > 0),
  unit_price int not null,
  total_price int not null,
  is_member_rate boolean not null default false,
  status text not null default 'pending' check (status in ('pending','paid','cancelled','refunded','expired')),
  payment_method text not null default 'stripe',
  stripe_session_id text,
  stripe_payment_intent text,
  cancel_token text unique not null,
  refund_override boolean not null default false,
  invoice_number text,
  hold_expires_at timestamptz,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  cancelled_at timestamptz
);
create index if not exists bookings_slot_idx on bookings(slot_id);
create index if not exists bookings_email_idx on bookings(email);

-- Only the server (service role key) touches data. Deny everything else.
alter table slots enable row level security;
alter table members enable row level security;
alter table friend_nominations enable row level security;
alter table bookings enable row level security;

-- Slots with how many places are taken (paid + unexpired holds).
create or replace view slot_availability as
select s.*,
  coalesce((
    select sum(b.quantity) from bookings b
    where b.slot_id = s.id
      and (b.status = 'paid' or (b.status = 'pending' and b.hold_expires_at > now()))
  ), 0)::int as taken
from slots s;

-- Atomically reserve places (locks the slot so two people can't take the last place).
create or replace function reserve_booking(
  p_slot uuid, p_email text, p_name text, p_qty int, p_hold_minutes int default 33
) returns bookings
language plpgsql as $$
declare
  s slots; taken int; is_mem boolean; qty int; total int; b bookings;
begin
  select * into s from slots where id = p_slot and is_published for update;
  if not found then raise exception 'This session is not available.'; end if;
  if s.starts_at <= now() then raise exception 'This session has already started.'; end if;

  select coalesce(sum(quantity), 0) into taken from bookings
   where slot_id = p_slot
     and (status = 'paid' or (status = 'pending' and hold_expires_at > now()));

  select exists(
    select 1 from members
     where email = lower(p_email) and status = 'active'
       and (expires_at is null or expires_at > now())
  ) into is_mem;

  if s.audience = 'members' and not is_mem then
    raise exception 'This session is for members only.';
  end if;

  if s.is_private then
    if taken > 0 then raise exception 'This private session is already booked.'; end if;
    qty := s.capacity;
    total := s.price_nonmember;            -- flat price for the whole session
    is_mem := false;
  else
    qty := greatest(coalesce(p_qty, 1), 1);
    if taken + qty > s.capacity then
      raise exception 'Only % place(s) left in this session.', greatest(s.capacity - taken, 0);
    end if;
    -- Member price applies to the member's own place; extra guests pay the standard price.
    total := case when is_mem then s.price_member + (qty - 1) * s.price_nonmember
                  else qty * s.price_nonmember end;
  end if;

  insert into bookings (slot_id, email, name, quantity, unit_price, total_price,
                        is_member_rate, status, cancel_token, hold_expires_at)
  values (p_slot, lower(p_email), p_name, qty, round(total::numeric / qty), total,
          is_mem, 'pending',
          replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
          now() + make_interval(mins => p_hold_minutes))
  returning * into b;
  return b;
end $$;

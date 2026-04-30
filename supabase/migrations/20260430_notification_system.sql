-- Create notifications table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('follow', 'like', 'comment', 'reply')),
  content_id uuid references public.content(id) on delete cascade,
  comment_id uuid references public.content_comments(id) on delete cascade,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indices for faster lookups
create index if not exists notifications_receiver_id_idx on public.notifications(receiver_id);
create index if not exists notifications_is_read_idx on public.notifications(is_read);

-- Enable RLS
alter table public.notifications enable row level security;

-- RLS Policies
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = receiver_id);

create policy "Users can update their own notifications (mark as read)"
  on public.notifications for update
  using (auth.uid() = receiver_id);

-- Automate notifications using triggers

-- 1. Notification for new follow
create or replace function public.handle_new_follow_notification()
returns trigger as $$
begin
  insert into public.notifications (receiver_id, actor_id, type)
  values (new.following_id, new.follower_id, 'follow');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_new_follow
  after insert on public.follows
  for each row execute function public.handle_new_follow_notification();

-- 2. Notification for new content like
create or replace function public.handle_new_like_notification()
returns trigger as $$
declare
  _receiver_id uuid;
begin
  select creator_id into _receiver_id from public.content where id = new.content_id;
  
  -- Don't notify if liking own content
  if _receiver_id != new.user_id then
    insert into public.notifications (receiver_id, actor_id, type, content_id)
    values (_receiver_id, new.user_id, 'like', new.content_id);
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_new_like
  after insert on public.content_likes
  for each row execute function public.handle_new_like_notification();

-- 3. Notification for new comment or reply
create or replace function public.handle_new_comment_notification()
returns trigger as $$
declare
  _receiver_id uuid;
begin
  if new.parent_id is not null then
    -- It's a reply
    select user_id into _receiver_id from public.content_comments where id = new.parent_id;
    
    if _receiver_id != new.user_id then
      insert into public.notifications (receiver_id, actor_id, type, content_id, comment_id)
      values (_receiver_id, new.user_id, 'reply', new.content_id, new.id);
    end if;
  else
    -- It's a top-level comment
    select creator_id into _receiver_id from public.content where id = new.content_id;
    
    if _receiver_id != new.user_id then
      insert into public.notifications (receiver_id, actor_id, type, content_id, comment_id)
      values (_receiver_id, new.user_id, 'comment', new.content_id, new.id);
    end if;
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_new_comment
  after insert on public.content_comments
  for each row execute function public.handle_new_comment_notification();

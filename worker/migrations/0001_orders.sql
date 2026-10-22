create table orders (
    id integer primary key,
    user_id integer not null,
    product text not null,
    title text not null,
    amount integer not null,
    status text not null check (status in ('new', 'paid', 'refunded')),
    charge_id text,
    created_at real not null,
    paid_at real
);
create index ix_orders_user on orders(user_id, id);

-- Customers table
create table glass_customers (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  patente text,
  telefono text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Installations table
create table glass_installations (
  id uuid default gen_random_uuid() primary key,
  tipo_vidrio text not null,
  posicion text not null,
  monto decimal(12,2) not null,
  metodo_pago text not null,
  fecha timestamp with time zone not null,
  cliente_nombre text,
  cliente_patente text,
  cliente_telefono text,
  customer_id uuid references glass_customers(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table glass_customers enable row level security;
alter table glass_installations enable row level security;

-- Open policies
create policy "Allow all customers" on glass_customers for all using (true) with check (true);
create policy "Allow all installations" on glass_installations for all using (true) with check (true);

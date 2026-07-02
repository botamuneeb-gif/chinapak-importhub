create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_code text not null unique,
  document_id text not null unique,
  project_id uuid not null references public.import_projects(id) on delete restrict,
  customer_user_id uuid not null references auth.users(id) on delete restrict,
  status public.invoice_status not null default 'draft',
  issued_at timestamptz not null default now(),
  due_at timestamptz,
  paid_at timestamptz,
  subtotal_pkr integer not null default 0,
  discount_pkr integer not null default 0,
  tax_pkr integer not null default 0,
  total_pkr integer not null default 0,
  payment_method text,
  transaction_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index invoices_project_id_idx on public.invoices(project_id);
create index invoices_customer_user_id_idx on public.invoices(customer_user_id);
create trigger set_invoices_updated_at before update on public.invoices for each row execute function public.set_updated_at();

create table public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  package_id uuid references public.packages(id) on delete set null,
  addon_id uuid references public.addons(id) on delete set null,
  item_type text not null,
  description text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price_pkr integer not null default 0,
  total_pkr integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index invoice_line_items_invoice_id_idx on public.invoice_line_items(invoice_id);
create trigger set_invoice_line_items_updated_at before update on public.invoice_line_items for each row execute function public.set_updated_at();

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.import_projects(id) on delete restrict,
  invoice_id uuid references public.invoices(id) on delete set null,
  payment_status public.payment_status not null default 'awaiting_payment',
  amount_pkr integer not null check (amount_pkr >= 0),
  method text,
  provider text,
  provider_reference text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index payments_project_id_idx on public.payments(project_id);
create index payments_invoice_id_idx on public.payments(invoice_id);
create index payments_payment_status_idx on public.payments(payment_status);
create trigger set_payments_updated_at before update on public.payments for each row execute function public.set_updated_at();

create table public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  attempt_status public.payment_status not null default 'awaiting_payment',
  provider_response_code text,
  failure_reason text,
  attempted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);
create index payment_attempts_payment_id_idx on public.payment_attempts(payment_id);

create table public.manual_payment_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.import_projects(id) on delete set null,
  lead_id uuid references public.unpaid_leads(id) on delete set null,
  requester_name text,
  phone_whatsapp text,
  city text,
  preferred_method text,
  problem_description text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index manual_payment_requests_project_id_idx on public.manual_payment_requests(project_id);
create index manual_payment_requests_lead_id_idx on public.manual_payment_requests(lead_id);
create trigger set_manual_payment_requests_updated_at before update on public.manual_payment_requests for each row execute function public.set_updated_at();

create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  refund_code text not null unique,
  project_id uuid not null references public.import_projects(id) on delete restrict,
  invoice_id uuid references public.invoices(id) on delete set null,
  requested_by uuid references auth.users(id) on delete set null,
  refund_status public.refund_status not null default 'requested',
  reason text not null,
  requested_amount_pkr integer,
  approved_amount_pkr integer,
  fms_assigned_at_request boolean not null default false,
  milestone_review_required boolean not null default false,
  reassignment_offered boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index refunds_project_id_idx on public.refunds(project_id);
create index refunds_invoice_id_idx on public.refunds(invoice_id);
create index refunds_refund_status_idx on public.refunds(refund_status);
create trigger set_refunds_updated_at before update on public.refunds for each row execute function public.set_updated_at();

create table public.refund_decisions (
  id uuid primary key default gen_random_uuid(),
  refund_id uuid not null references public.refunds(id) on delete cascade,
  decision text not null,
  decision_by_admin_profile_id uuid references public.admin_profiles(id) on delete set null,
  milestone_review_summary text,
  reassignment_offered boolean not null default false,
  decided_at timestamptz,
  customer_visible_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index refund_decisions_refund_id_idx on public.refund_decisions(refund_id);
create trigger set_refund_decisions_updated_at before update on public.refund_decisions for each row execute function public.set_updated_at();

create table public.refund_evidence (
  id uuid primary key default gen_random_uuid(),
  refund_id uuid not null references public.refunds(id) on delete cascade,
  file_asset_id uuid,
  evidence_type text,
  visibility text not null default 'admin_only',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index refund_evidence_refund_id_idx on public.refund_evidence(refund_id);
create trigger set_refund_evidence_updated_at before update on public.refund_evidence for each row execute function public.set_updated_at();

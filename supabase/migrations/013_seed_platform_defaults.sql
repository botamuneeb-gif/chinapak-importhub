-- Applies locked ChinaPak ImportHub platform defaults for packages, add-ons,
-- refund rules, FMS payout tiers, and basic platform settings.
-- This migration is idempotent and uses upserts only.

insert into public.packages (
  package_code,
  name,
  price_pkr,
  best_for_budget,
  factory_option_count,
  delivery_days_min,
  delivery_days_max,
  is_recommended,
  status,
  metadata
) values
  (
    'factory-discovery',
    'Factory Discovery',
    18000,
    'PKR 100,000-300,000',
    'Up to 3',
    5,
    7,
    false,
    'active',
    '{"summary":"Best for first-time and smaller import budgets."}'::jsonb
  ),
  (
    'factory-match-plus',
    'Factory Match Plus',
    35000,
    'PKR 300,000-700,000',
    '5',
    7,
    10,
    true,
    'active',
    '{"summary":"Recommended for established shopkeepers and repeat buyers."}'::jsonb
  ),
  (
    'import-partner',
    'Import Partner',
    75000,
    'Best for serious importers',
    '8-10',
    10,
    15,
    false,
    'active',
    '{"summary":"Best for larger or more complex sourcing decisions."}'::jsonb
  )
on conflict (package_code) do update set
  name = excluded.name,
  price_pkr = excluded.price_pkr,
  best_for_budget = excluded.best_for_budget,
  factory_option_count = excluded.factory_option_count,
  delivery_days_min = excluded.delivery_days_min,
  delivery_days_max = excluded.delivery_days_max,
  is_recommended = excluded.is_recommended,
  status = excluded.status,
  metadata = excluded.metadata,
  updated_at = now();

insert into public.package_features (package_id, feature_key, label, value, sort_order)
select p.id, feature_key, label, value, sort_order
from public.packages p
join (
  values
    ('factory-discovery', 'factory_options', 'Factory options', 'Up to 3', 10),
    ('factory-discovery', 'comparison', 'Comparison', 'Basic comparison', 20),
    ('factory-discovery', 'report', 'Report', 'Admin-reviewed report', 30),
    ('factory-match-plus', 'factory_options', 'Factory options', '5', 10),
    ('factory-match-plus', 'comparison', 'Comparison', 'Better comparison', 20),
    ('factory-match-plus', 'negotiation', 'Negotiation support', 'Basic negotiation support', 30),
    ('factory-match-plus', 'reliability', 'Factory reliability notes', 'Included', 40),
    ('import-partner', 'factory_options', 'Factory options', '8-10', 10),
    ('import-partner', 'dedicated_fms', 'Dedicated FMS', 'Included', 20),
    ('import-partner', 'negotiation', 'Negotiation support', 'Included', 30),
    ('import-partner', 'sample_guidance', 'Sample coordination guidance', 'Included', 40),
    ('import-partner', 'priority_support', 'Priority admin support', 'Included', 50)
) as f(package_code, feature_key, label, value, sort_order)
  on f.package_code = p.package_code
on conflict (package_id, feature_key) do update set
  label = excluded.label,
  value = excluded.value,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.addons (
  addon_code,
  name,
  price_type,
  price_min_pkr,
  price_max_pkr,
  percentage_rate,
  status,
  requires_human_review,
  metadata
) values
  ('ai-trade-translation', 'AI Trade Translation', 'fixed', 5000, 5000, null, 'active', true, '{"unit":"project"}'::jsonb),
  ('voice-note-translation', 'Voice Note Translation', 'range', 8000, 12000, null, 'active', true, '{"unit":"project"}'::jsonb),
  ('document-translation', 'Document Translation', 'range', 2000, 5000, null, 'active', true, '{"unit":"document"}'::jsonb),
  ('live-factory-call-translation', 'Live Factory Call Translation', 'range', 15000, 30000, null, 'active', true, '{"unit":"session"}'::jsonb),
  ('supplier-background-check', 'Supplier Background Check', 'fixed', 12000, 12000, null, 'active', true, '{}'::jsonb),
  ('video-factory-tour-coordination', 'Video Factory Tour Coordination', 'range', 20000, 35000, null, 'active', true, '{}'::jsonb),
  ('sample-coordination', 'Sample Coordination', 'fixed', 15000, 15000, null, 'active', false, '{}'::jsonb),
  ('shipping-coordination-support', 'Shipping Coordination Support', 'fixed', 15000, 15000, null, 'active', false, '{}'::jsonb),
  ('urgent-processing', 'Urgent Processing', 'percentage', null, null, 0.4000, 'active', false, '{"display":"+40%"}'::jsonb)
on conflict (addon_code) do update set
  name = excluded.name,
  price_type = excluded.price_type,
  price_min_pkr = excluded.price_min_pkr,
  price_max_pkr = excluded.price_max_pkr,
  percentage_rate = excluded.percentage_rate,
  status = excluded.status,
  requires_human_review = excluded.requires_human_review,
  metadata = excluded.metadata,
  updated_at = now();

insert into public.refund_rules (
  rule_code,
  title,
  description,
  applies_before_fms_assignment,
  applies_after_fms_assignment,
  status
) values
  (
    'full-refund-before-fms-assignment',
    'Full refund before FMS assignment',
    'Full refund is available before an FMS is assigned to the Import Project.',
    true,
    false,
    'active'
  ),
  (
    'admin-reviewed-refund-after-fms-assignment',
    'Admin-reviewed refund after FMS assignment',
    'After FMS assignment, refund requests are reviewed by admin based on completed milestones.',
    false,
    true,
    'active'
  ),
  (
    'reassignment-before-refund',
    'FMS reassignment before refund',
    'Admin may offer or perform FMS reassignment before issuing a refund.',
    false,
    true,
    'active'
  ),
  (
    'timeframe-service-not-delivered',
    'Package timeframe service protection',
    'If promised service is not delivered within package timeframe, full refund may apply subject to documented exceptions.',
    true,
    true,
    'active'
  )
on conflict (rule_code) do update set
  title = excluded.title,
  description = excluded.description,
  applies_before_fms_assignment = excluded.applies_before_fms_assignment,
  applies_after_fms_assignment = excluded.applies_after_fms_assignment,
  status = excluded.status,
  updated_at = now();

insert into public.payout_rules (
  rule_code,
  tier,
  min_payout_pkr,
  max_payout_pkr,
  min_payout_cny,
  max_payout_cny,
  status,
  quality_adjustment_rules
) values
  ('fms-bronze-v1', 'bronze', 5000, 7000, 120, 170, 'active', '{"basis":"milestone_completion_quality_and_assignment_difficulty"}'::jsonb),
  ('fms-silver-v1', 'silver', 9000, 12000, 220, 290, 'active', '{"basis":"milestone_completion_quality_and_assignment_difficulty"}'::jsonb),
  ('fms-gold-v1', 'gold', 15000, 25000, 370, 610, 'active', '{"basis":"milestone_completion_quality_and_assignment_difficulty"}'::jsonb)
on conflict (rule_code) do update set
  tier = excluded.tier,
  min_payout_pkr = excluded.min_payout_pkr,
  max_payout_pkr = excluded.max_payout_pkr,
  min_payout_cny = excluded.min_payout_cny,
  max_payout_cny = excluded.max_payout_cny,
  status = excluded.status,
  quality_adjustment_rules = excluded.quality_adjustment_rules,
  updated_at = now();

insert into public.platform_settings (setting_key, setting_value, value_type, environment, is_sensitive) values
  ('factory_portal_status', '{"status":"hidden_future_activation"}'::jsonb, 'json', 'all', false),
  ('importer_fms_direct_contact_allowed', 'false'::jsonb, 'boolean', 'all', false),
  ('unpaid_lead_fms_assignment_allowed', 'false'::jsonb, 'boolean', 'all', false),
  ('default_locale', '"ur"'::jsonb, 'string', 'all', false),
  ('supported_locales', '["ur","en","zh-CN"]'::jsonb, 'json', 'all', false),
  ('service_role_key_policy', '{"warning":"Never expose SUPABASE_SERVICE_ROLE_KEY client-side."}'::jsonb, 'json', 'all', true)
on conflict (setting_key) do update set
  setting_value = excluded.setting_value,
  value_type = excluded.value_type,
  environment = excluded.environment,
  is_sensitive = excluded.is_sensitive,
  updated_at = now();

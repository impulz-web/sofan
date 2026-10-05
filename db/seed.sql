INSERT INTO admins (name, email)
VALUES ('Demo Administrator', 'admin@example.test')
ON CONFLICT (email) DO NOTHING;

INSERT INTO finance_transactions
  (type, amount, currency, payment_method, reference, donor_name, notes, transaction_date)
SELECT seed.type, seed.amount, 'KES', seed.payment_method, seed.reference,
       'Demo donor', 'Demo seed data', CURRENT_DATE
FROM (VALUES
  ('tithe', 5000.00::NUMERIC, 'M-Pesa', 'DEMO-TITHE-001'),
  ('offering', 2500.00::NUMERIC, 'Cash', 'DEMO-OFFERING-001'),
  ('donation', 10000.00::NUMERIC, 'Bank', 'DEMO-DONATION-001')
) AS seed(type, amount, payment_method, reference)
WHERE NOT EXISTS (
  SELECT 1 FROM finance_transactions WHERE reference = seed.reference
);

INSERT INTO news (title, content, published)
SELECT seed.title, seed.content, seed.published
FROM (VALUES
  ('[DEMO] Sunday worship update', 'Demo article content. Replace with verified SOFAN news before publishing.', TRUE),
  ('[DEMO] Community outreach notice', 'Demo article content. Replace with verified SOFAN news before publishing.', TRUE),
  ('[DEMO] Bible study announcement', 'Demo draft content. Replace with verified SOFAN news before publishing.', FALSE)
) AS seed(title, content, published)
WHERE NOT EXISTS (SELECT 1 FROM news WHERE title = seed.title);

INSERT INTO events
  (title, description, event_date, start_time, end_time, location, published)
SELECT seed.title, seed.description, CURRENT_DATE + seed.days_after,
       seed.start_time::TIME, seed.end_time::TIME, 'Juba, South Sudan', seed.published
FROM (VALUES
  ('[DEMO] Sunday Service', 'Demo event. Confirm details before publishing.', 7, '09:00', '11:00', TRUE),
  ('[DEMO] Wednesday Bible Study', 'Demo event. Confirm details before publishing.', 10, '18:00', '19:30', TRUE),
  ('[DEMO] Friday Prayer', 'Demo event. Confirm details before publishing.', 12, '19:00', '20:00', FALSE)
) AS seed(title, description, days_after, start_time, end_time, published)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = seed.title);

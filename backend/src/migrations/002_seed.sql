-- employee-internal-transfer.T01 — seed data
-- 6 employees, incl. a manager -> report chain, across 2 departments/locations,
-- so tests can exercise both "dept/role changed" and "location-only changed"
-- scenarios (spec AC7).

INSERT INTO employees (id, name, department, location, role, manager_id) VALUES
  ('EMP1002', 'Rohan Verma', 'Engineering', 'Bengaluru', 'Engineering Manager', NULL),
  ('EMP1004', 'Karan Mehta', 'Sales',       'Mumbai',    'Sales Manager',       NULL),
  ('EMP1001', 'Aditi Sharma', 'Engineering', 'Bengaluru', 'Software Engineer',  'EMP1002'),
  ('EMP1003', 'Neha Gupta',   'Sales',       'Mumbai',    'Sales Executive',    'EMP1004'),
  ('EMP1005', 'Priya Nair',   'HR',          'Bengaluru', 'HR Business Partner', 'EMP1002'),
  ('EMP1006', 'Suresh Iyer',  'IT',          'Bengaluru', 'IT Support',          'EMP1002')
ON CONFLICT (id) DO NOTHING;

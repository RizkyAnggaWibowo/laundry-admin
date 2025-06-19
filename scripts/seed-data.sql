-- Insert sample services
INSERT INTO services (name, description, price_per_kg, category) VALUES
('Cuci Kering', 'Layanan cuci dan kering pakaian reguler', 8000, 'Regular'),
('Cuci Setrika', 'Layanan cuci, kering, dan setrika', 12000, 'Premium'),
('Dry Clean', 'Layanan dry cleaning untuk pakaian khusus', 25000, 'Premium'),
('Express', 'Layanan cuci setrika dalam 24 jam', 15000, 'Express'),
('Sepatu', 'Layanan cuci sepatu', 20000, 'Special');

-- Insert sample customers
INSERT INTO customers (name, email, phone, address, city, postal_code) VALUES
('Budi Santoso', 'budi@email.com', '081234567890', 'Jl. Merdeka No. 123', 'Jakarta', '12345'),
('Siti Aminah', 'siti@email.com', '081234567891', 'Jl. Sudirman No. 456', 'Jakarta', '12346'),
('Ahmad Wijaya', 'ahmad@email.com', '081234567892', 'Jl. Thamrin No. 789', 'Jakarta', '12347'),
('Maya Sari', 'maya@email.com', '081234567893', 'Jl. Gatot Subroto No. 101', 'Jakarta', '12348');

-- Insert sample admin user
INSERT INTO admin_users (email, name, role) VALUES
('admin@laundrybiner.com', 'Admin Laundry', 'super_admin');

-- Insert sample orders
INSERT INTO orders (customer_id, service_type, estimated_weight, estimated_amount, pickup_date, items) 
SELECT 
    c.id,
    'Cuci Kering',
    3.5,
    28000,
    CURRENT_DATE,
    ARRAY['Kemeja', 'Celana', 'Kaos']
FROM customers c WHERE c.email = 'budi@email.com';

INSERT INTO orders (customer_id, service_type, estimated_weight, estimated_amount, pickup_date, items, status) 
SELECT 
    c.id,
    'Cuci Setrika',
    2.8,
    33600,
    CURRENT_DATE,
    ARRAY['Dress', 'Blouse'],
    'Diproses'
FROM customers c WHERE c.email = 'siti@email.com';

INSERT INTO orders (customer_id, service_type, estimated_weight, estimated_amount, pickup_date, items, status, actual_weight, final_amount) 
SELECT 
    c.id,
    'Dry Clean',
    1.5,
    37500,
    CURRENT_DATE - INTERVAL '1 day',
    ARRAY['Jas', 'Kemeja'],
    'Dalam Pengiriman',
    1.5,
    37500
FROM customers c WHERE c.email = 'ahmad@email.com';

-- Insert sample payments
INSERT INTO payments (order_id, amount, method, status)
SELECT o.id, o.estimated_amount, 'COD', 'Pending'
FROM orders o 
JOIN customers c ON o.customer_id = c.id 
WHERE c.email = 'budi@email.com';

INSERT INTO payments (order_id, amount, method, status)
SELECT o.id, o.estimated_amount, 'Transfer', 'Verified'
FROM orders o 
JOIN customers c ON o.customer_id = c.id 
WHERE c.email = 'siti@email.com';

INSERT INTO payments (order_id, amount, method, status)
SELECT o.id, o.final_amount, 'Transfer', 'Verified'
FROM orders o 
JOIN customers c ON o.customer_id = c.id 
WHERE c.email = 'ahmad@email.com';

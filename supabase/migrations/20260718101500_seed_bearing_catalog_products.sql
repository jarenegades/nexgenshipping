-- Make the interim bearing catalogue real database products so carts, wishlists,
-- orders, and the admin catalogue all refer to the same records.
WITH catalog(category, category_id, product_name, description, image_url, category_index) AS (
  VALUES
    ('pharmaceutical', 'deep-groove-ball-bearings', 'Deep Groove Ball Bearing', 'Versatile radial bearing for motors, pumps and general machinery.', 'https://cdn11.bigcommerce.com/s-m2tbfwjufh/images/stencil/500x659/products/4150/25589/6203-2rs__72644.1695320215.jpg?c=1', 0),
    ('pharmaceutical', 'angular-contact-ball-bearings', 'Angular Contact Ball Bearing', 'Precision bearing for combined radial and axial loads.', 'https://cdn11.bigcommerce.com/s-m2tbfwjufh/images/stencil/500x659/products/4133/19644/6203-zz-1__01034.1677283224.jpg?c=1', 1),
    ('pharmaceutical', 'self-aligning-ball-bearings', 'Self-Aligning Ball Bearing', 'Double-row bearing that accommodates shaft deflection and misalignment.', 'https://cdn11.bigcommerce.com/s-m2tbfwjufh/images/stencil/500x659/products/5397/36083/1304__54760.1671220969.1280.1280__23977.1682463342.jpg?c=1', 2),
    ('pharmaceutical', 'spherical-roller-bearings', 'Spherical Roller Bearing', 'Heavy-duty self-aligning bearing for high radial load applications.', 'https://cdn11.bigcommerce.com/s-m2tbfwjufh/images/stencil/original/j/7589e2dbb48a160dcbb51bdb85f76de7__33473.original.png', 3),
    ('pharmaceutical', 'cylindrical-roller-bearings', 'Cylindrical Roller Bearing', 'High-capacity radial bearing for gearboxes, motors and process equipment.', 'https://cdn11.bigcommerce.com/s-m2tbfwjufh/images/stencil/original/a/e059d5129091b6e99b0d1b3006b34e60__71782.original.png', 4),
    ('pharmaceutical', 'tapered-roller-bearings', 'Tapered Roller Bearing', 'Robust bearing for combined radial and axial loads in hubs and transmissions.', 'https://cdn11.bigcommerce.com/s-m2tbfwjufh/images/stencil/500x659/products/114/30600/Tapered_Roller_Set__23870.1674060816.jpg?c=1', 5),
    ('pharmaceutical', 'needle-roller-bearings', 'Needle Roller Bearing', 'Compact bearing solution for space-constrained, high-load assemblies.', 'https://cdn11.bigcommerce.com/s-m2tbfwjufh/images/stencil/original/k/i44a1485-2-2__18295.original.jpg', 6),
    ('pharmaceutical', 'thrust-bearings', 'Thrust Bearing', 'Axial-load bearing solution for turntables, vertical shafts and gear assemblies.', 'https://cdn11.bigcommerce.com/s-m2tbfwjufh/images/stencil/original/u/4b4819bb30cca703154428b090b846a3__85593.original.png', 7),
    ('baby', 'mounted-bearing-units', 'Mounted Bearing Unit', 'Ready-to-mount housing and insert bearing for dependable shaft support.', 'https://cdn11.bigcommerce.com/s-m2tbfwjufh/images/stencil/original/k/i44a1511-1-2__97333.original.jpg', 8),
    ('baby', 'linear-motion', 'Linear Motion Bearing', 'Precision component for smooth, low-friction automation and handling motion.', 'https://cdn11.bigcommerce.com/s-m2tbfwjufh/images/stencil/original/c/26e4218eedda4154edb4e12124196e88__47275.original.jpg', 9),
    ('baby', 'bearing-housings-seals', 'Bearing Housing & Seal', 'Protective housing and seal solution for reliable bearing operation.', 'https://cdn11.bigcommerce.com/s-m2tbfwjufh/images/stencil/original/o/i44a1485-2-2__18295.original.jpg', 10)
), sizes(position, label) AS (
  VALUES (1, 'Compact'), (2, 'Standard'), (3, 'Medium Duty'), (4, 'Heavy Duty'), (5, 'Industrial')
)
INSERT INTO public.products (
  id, name, description, category, category_id, price, original_price, currency,
  rating, review_count, image_url, in_stock, stock_count, sold_count, badge, is_active
)
SELECT
  format('max-%s-%s', catalog.category_id, sizes.position),
  concat(sizes.label, ' ', catalog.product_name),
  concat(catalog.description, ' Available in a range of standard industrial sizes.'),
  catalog.category,
  catalog.category_id,
  round((28 + catalog.category_index * 14 + (sizes.position - 1) * 8.75)::numeric, 2),
  CASE WHEN sizes.position = 1 THEN round((38 + catalog.category_index * 14)::numeric, 2) END,
  'USD',
  round((4.6 + ((sizes.position - 1) % 3) * 0.1)::numeric, 1),
  12 + catalog.category_index * 3 + (sizes.position - 1) * 4,
  catalog.image_url,
  true,
  16 + (sizes.position - 1) * 9,
  44 + catalog.category_index * 11 + (sizes.position - 1) * 7,
  CASE WHEN sizes.position = 1 THEN 'Best Seller' END,
  true
FROM catalog
CROSS JOIN sizes
ON CONFLICT (id) DO NOTHING;

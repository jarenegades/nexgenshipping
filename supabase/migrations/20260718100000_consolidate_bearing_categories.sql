-- Archive only the legacy categories left over from the original non-bearing storefront.
UPDATE public.categories
SET is_active = false, updated_at = now()
WHERE id IN ('baby-clothing', 'baby-accessories', 'cold-cough-allergy-sinus', 'pain-relief', 'vitamins-supplements');

-- Ejecutar en Supabase → SQL Editor (una sola vez).
-- Habilita búsqueda insensible a tildes en catálogo y admin.

CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION public.product_ids_matching_search(search_term text)
RETURNS TABLE(id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT p.id
  FROM productos p
  LEFT JOIN categorias c ON c.id = p.categoria_id
  LEFT JOIN producto_categorias pc ON pc.producto_id = p.id
  LEFT JOIN categorias c2 ON c2.id = pc.categoria_id
  WHERE search_term IS NOT NULL
    AND btrim(search_term) <> ''
    AND (
      unaccent(p.nombre) ILIKE unaccent('%' || search_term || '%')
      OR unaccent(COALESCE(p.sku, '')) ILIKE unaccent('%' || search_term || '%')
      OR unaccent(COALESCE(p.marca, '')) ILIKE unaccent('%' || search_term || '%')
      OR unaccent(COALESCE(c.nombre, '')) ILIKE unaccent('%' || search_term || '%')
      OR unaccent(COALESCE(c2.nombre, '')) ILIKE unaccent('%' || search_term || '%')
    );
$$;

GRANT EXECUTE ON FUNCTION public.product_ids_matching_search(text) TO anon, authenticated, service_role;

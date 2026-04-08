-- Internal-only cohort monitoring for benchmark_data (no PII in outputs).
-- Run in Supabase SQL editor or via migration tooling.
-- Enables accurate GROUP BY rollups without scanning all rows through the app server.

CREATE OR REPLACE FUNCTION public.benchmark_cohort_monitoring_snapshot()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'totalRows',
    (SELECT COUNT(*)::int FROM benchmark_data),
    'byAudience',
    COALESCE(
      (SELECT jsonb_object_agg(COALESCE(audience_type::text, '(unknown)'), c)
       FROM (
         SELECT audience_type, COUNT(*)::int AS c
         FROM benchmark_data
         GROUP BY audience_type
       ) s),
      '{}'::jsonb
    ),
    'byRevenue',
    COALESCE(
      (SELECT jsonb_object_agg(COALESCE(revenue_range::text, '(unknown)'), c)
       FROM (
         SELECT revenue_range, COUNT(*)::int AS c
         FROM benchmark_data
         GROUP BY revenue_range
       ) s),
      '{}'::jsonb
    ),
    'byGeo',
    COALESCE(
      (SELECT jsonb_object_agg(COALESCE(geographic_scope::text, '(unknown)'), c)
       FROM (
         SELECT geographic_scope, COUNT(*)::int AS c
         FROM benchmark_data
         GROUP BY geographic_scope
       ) s),
      '{}'::jsonb
    ),
    'byAudienceRevenue',
    COALESCE(
      (SELECT jsonb_object_agg(
         COALESCE(audience_type::text, '(unknown)') || ' · ' || COALESCE(revenue_range::text, '(unknown)'),
         c
       )
       FROM (
         SELECT audience_type, revenue_range, COUNT(*)::int AS c
         FROM benchmark_data
         GROUP BY audience_type, revenue_range
       ) s),
      '{}'::jsonb
    ),
    'tripleSegments',
    COALESCE(
      (SELECT jsonb_agg(
         jsonb_build_object(
           'key',
           COALESCE(audience_type::text, '(unknown)') || ' · ' ||
           COALESCE(revenue_range::text, '(unknown)') || ' · ' ||
           COALESCE(geographic_scope::text, '(unknown)'),
           'n',
           c,
           'publicReady',
           c >= 20
         )
         ORDER BY c DESC
       )
       FROM (
         SELECT audience_type, revenue_range, geographic_scope, COUNT(*)::int AS c
         FROM benchmark_data
         GROUP BY audience_type, revenue_range, geographic_scope
       ) seg),
      '[]'::jsonb
    ),
    'tripleSummary',
    (
      SELECT jsonb_build_object(
        'segmentCount', COUNT(*)::int,
        'readyForPublicPeerStats', COUNT(*) FILTER (WHERE c >= 20)::int,
        'thinCohorts', COUNT(*) FILTER (WHERE c < 20)::int
      )
      FROM (
        SELECT COUNT(*)::int AS c
        FROM benchmark_data
        GROUP BY audience_type, revenue_range, geographic_scope
      ) x
    ),
    'industryTop',
    COALESCE(
      (SELECT jsonb_agg(to_jsonb(t) ORDER BY t.n DESC)
       FROM (
         SELECT
           COALESCE(NULLIF(trim(industry), ''), '(blank)') AS industry,
           COUNT(*)::int AS n
         FROM benchmark_data
         GROUP BY COALESCE(NULLIF(trim(industry), ''), '(blank)')
         ORDER BY n DESC
         LIMIT 50
       ) t),
      '[]'::jsonb
    )
  );
$$;

REVOKE ALL ON FUNCTION public.benchmark_cohort_monitoring_snapshot() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.benchmark_cohort_monitoring_snapshot() TO service_role;

COMMENT ON FUNCTION public.benchmark_cohort_monitoring_snapshot() IS
  'Internal admin: anonymized cohort counts from benchmark_data. Callable only with service role.';

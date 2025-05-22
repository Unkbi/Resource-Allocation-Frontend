export const allowedQueries: Record<string, string> = {
  resourceCoverage: `
    WITH params AS (
        SELECT
            DATE '2025-01-01'  AS start_date,
            DATE '2025-06-30'  AS end_date,
            'week'::text       AS bucket,
            'Contractor - PT'  AS excluded_type
    ),
    calendar AS (
        SELECT
            gs AS period_start,
            CASE p.bucket
                 WHEN 'week' THEN gs + INTERVAL '1 week' - INTERVAL '1 day'
                 WHEN 'month' THEN gs + INTERVAL '1 month' - INTERVAL '1 day'
                 WHEN 'quarter' THEN gs + INTERVAL '3 months' - INTERVAL '1 day'
            END AS period_end,
            CEIL( (DATE_PART('day',
                 CASE p.bucket
                      WHEN 'week' THEN gs + INTERVAL '1 week' - INTERVAL '1 day'
                      WHEN 'month' THEN gs + INTERVAL '1 month' - INTERVAL '1 day'
                      WHEN 'quarter' THEN gs + INTERVAL '3 months' - INTERVAL '1 day'
                 END
                 - gs) + 1) / 7.0 )::int AS weeks_in_bucket
        FROM params p
        JOIN LATERAL generate_series(
                date_trunc(p.bucket, p.start_date),
                date_trunc(p.bucket, p.end_date),
                CASE p.bucket
                     WHEN 'week' THEN INTERVAL '1 week'
                     WHEN 'month' THEN INTERVAL '1 month'
                     WHEN 'quarter' THEN INTERVAL '3 months'
                END
             ) AS gs ON TRUE
    ),
    allocations AS (
        SELECT
            a.___parent__ AS resource_id,
            to_date(a._period, 'YYYY-MM-DD') AS period_date,
            a._allocationentered AS alloc_fte
        FROM resourceallocation_core__allocation_0_0_1 a
        JOIN params p
          ON to_date(a._period, 'YYYY-MM-DD')
             BETWEEN p.start_date AND p.end_date
    ),
    eligible_resources AS (
        SELECT
            r.___path__ AS resource_id,
            to_date(r._startdate, 'YYYY-MM-DD') AS start_date
        FROM resourceallocation_core__resource_0_0_1 r
        JOIN params p ON r._type <> p.excluded_type
    ),
    team_map AS (
        SELECT
            tr._resource AS resource_id,
            tr._team AS team_id
        FROM resourceallocation_core__teamresource_0_0_1 tr
    ),
    team_capacity AS (
        SELECT
            cal.period_start,
            cal.weeks_in_bucket,
            tm.team_id,
            COUNT(DISTINCT tm.resource_id) AS headcount
        FROM calendar cal
        JOIN team_map tm ON TRUE
        JOIN eligible_resources er ON er.resource_id = tm.resource_id AND er.start_date <= cal.period_end
        GROUP BY cal.period_start, cal.weeks_in_bucket, tm.team_id
    ),
    alloc_by_team_period AS (
        SELECT
            tm.team_id,
            date_trunc(p.bucket, alloc.period_date) AS period_start,
            SUM(alloc.alloc_fte) AS sum_alloc_fte
        FROM allocations alloc
        JOIN params p ON TRUE
        JOIN team_map tm ON tm.resource_id = alloc.resource_id
        JOIN eligible_resources er ON er.resource_id = alloc.resource_id
        GROUP BY tm.team_id, date_trunc(p.bucket, alloc.period_date)
    )
    SELECT
        t._name AS team_name,
        cal.period_start,
        ROUND(
            (COALESCE(abp.sum_alloc_fte, 0)
             / NULLIF(tc.headcount * cal.weeks_in_bucket, 0) * 100
            )::numeric, 2
        ) AS coverage_pct
    FROM calendar cal
    JOIN team_capacity tc ON tc.period_start = cal.period_start
    LEFT JOIN alloc_by_team_period abp
           ON abp.period_start = cal.period_start AND abp.team_id = tc.team_id
    JOIN resourceallocation_core__team_0_0_1 t ON t.___path__ = tc.team_id
    ORDER BY t._name, cal.period_start;
  `
,

  revenueTrend: `
    SELECT TO_CHAR(month, 'Mon') as label, SUM(amount) as value
    FROM transactions
    GROUP BY month
    ORDER BY month;
  `
};

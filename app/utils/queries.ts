// Helper to safely convert JS arrays to SQL array literals or NULL
const toSqlArray = (arr: string[] | null | undefined): string => {
    if (!arr || arr.length === 0) return 'NULL';
    const escaped = arr.map(v => `'${String(v).replace(/'/g, "''")}'`);
    return `ARRAY[${escaped.join(',')}]`;
};

export const allowedQueries: Record<string, (...args: any[]) => string> = {
    //002 - Fractional units breakdown of resources allocation by duration trend based on project types.
    projectFTE: (startDate,
        endDate,
        bucket,
        teamFilter = null,
        teamAllocMgrFilter = null,
        orgFilter = null,
        projectTypeFilter = null,
        projectTypeGroupFilter = null,
        portfolioFilter = null) => `WITH params AS (
    SELECT
        DATE '${startDate}' AS as_of_date,
        ${toSqlArray(teamFilter)}::text[]                 AS team_filter,
        ${toSqlArray(teamAllocMgrFilter)}::text[]         AS team_alloc_mgr_filter,
        ${toSqlArray(orgFilter)}::text[]                  AS org_filter,
        ${toSqlArray(projectTypeFilter)}::text[]          AS project_type_filter,
        ${toSqlArray(projectTypeGroupFilter)}::text[]     AS project_type_group_filter,
        ${toSqlArray(portfolioFilter)}::uuid[]            AS portfolio_filter
),

/* ========= Filter CTEs ========== */
filtered_project_types AS (
    SELECT
        pt."Id"::text AS type_id  
    FROM resource_projecttype pt
    LEFT JOIN resource_projecttypegroup ptg
           ON pt."Group"::uuid = ptg."Id"
    JOIN params p ON TRUE
    WHERE pt.__is_deleted__ = false
      AND (p.project_type_group_filter IS NULL OR ptg."Name" = ANY(p.project_type_group_filter))
      AND (p.project_type_filter IS NULL OR pt."Name" = ANY(p.project_type_filter))
),

filtered_projects AS (
    SELECT
        proj."Id" AS project_id
    FROM resource_project proj
    JOIN params p ON TRUE
    WHERE proj.__is_deleted__ = false
      AND (p.portfolio_filter IS NULL OR proj."PortfolioId" = ANY(p.portfolio_filter))
      AND (
          
          (p.project_type_filter IS NULL AND p.project_type_group_filter IS NULL)
          OR EXISTS (
              SELECT 1 
              FROM filtered_project_types fpt 
              WHERE fpt.type_id = proj."Type"  
          )
      )
),

filtered_teams AS (
    SELECT
        t.__path__ AS team_id,
        t."Name" AS team_name,
        t."AllocationManager" AS allocation_manager
    FROM resource_team t
    JOIN params p ON TRUE
    WHERE (p.team_filter IS NULL OR t.__path__ = ANY(p.team_filter))
      AND (p.team_alloc_mgr_filter IS NULL OR t."AllocationManager" = ANY(p.team_alloc_mgr_filter))
),

team_filtered_resources AS (
    SELECT DISTINCT
        tr."Resource" AS resource_id
    FROM resource_teamresource tr
    WHERE EXISTS (
        SELECT 1 
        FROM filtered_teams ft 
        WHERE ft.team_id = tr."Team"
    )
),

org_filtered_resources AS (
    SELECT DISTINCT
        orgr."Resource" AS resource_id
    FROM resource_organizationresource orgr
    JOIN params p ON TRUE
    WHERE p.org_filter IS NOT NULL
      AND orgr."Organization" = ANY(p.org_filter)
),

eligible_resources AS (
    SELECT
        r.__path__                           AS resource_id,
        to_date(r."StartDate", 'YYYY-MM-DD') AS start_date
    FROM public.resource_resource r
    JOIN params p ON TRUE
    WHERE r.__is_deleted__ = false
      AND r."Type" <> 'Contractor - PT'
      AND (
          p.org_filter IS NULL
          OR EXISTS (
              SELECT 1
              FROM org_filtered_resources ofr
              WHERE ofr.resource_id = r.__path__
          )
      )
      AND (
          (p.team_filter IS NULL AND p.team_alloc_mgr_filter IS NULL)
          OR EXISTS (
              SELECT 1
              FROM team_filtered_resources tfr
              WHERE tfr.resource_id = r.__path__
          )
      )
),

/* ========= 2. Compute 7-week window (3 past + current + 3 future) ========== */
date_window AS (
    SELECT
        date_trunc('week', as_of_date - interval '3 week') AS start_date,
        date_trunc('week', as_of_date + interval '3 week') + interval '6 day' AS end_date
    FROM params
),

/* ========= 3. Weekly calendar buckets ========== */
calendar AS (
    SELECT gs::date AS week_start
    FROM date_window w
    JOIN LATERAL generate_series(
        w.start_date,
        w.end_date,
        interval '1 week'
    ) gs ON TRUE
),

/* ========= 4. Raw allocations (planned + actual) ========== */
allocations AS (
    SELECT
        a.__parent__           AS resource_id,
        a."Project"::uuid      AS project_id,
        a."Period"             AS period_date,
        COALESCE(a."AllocationEntered", 0) AS planned_fte,
        COALESCE(a."ActualsEntered", 0)    AS actual_fte
    FROM public.resource_allocation a
    JOIN date_window w
      ON a."Period" BETWEEN w.start_date AND w.end_date
    JOIN eligible_resources er ON er.resource_id = a.__parent__
    JOIN params p ON TRUE
    WHERE a.__is_deleted__ = false
      AND (
          (p.project_type_filter IS NULL AND p.project_type_group_filter IS NULL AND p.portfolio_filter IS NULL)
          OR EXISTS (
              SELECT 1
              FROM filtered_projects fp
              WHERE fp.project_id = a."Project"::uuid
          )
      )
),

/* ========= 6. Project lookup (project → type → typegroup) ========== */
project_lu AS (
    SELECT
        pr."Id"       AS project_id,
        ptg."Name"    AS project_type_group
    FROM public.resource_project pr
    JOIN public.resource_projecttype pt
      ON pr."Type"::uuid = pt."Id"
    JOIN public.resource_projecttypegroup ptg
      ON pt."Group"::uuid = ptg."Id"
    WHERE EXISTS (
        SELECT 1
        FROM filtered_projects fp
        WHERE fp.project_id = pr."Id"
    )
),

/* ========= 7. Aggregate planned + actual per week × project_type_group ========== */
alloc_by_group_period AS (
    SELECT
        lu.project_type_group,
        date_trunc('week', alloc.period_date)::date AS week_start,
        SUM(alloc.planned_fte) AS planned_fte,
        SUM(alloc.actual_fte)  AS actual_fte
    FROM allocations alloc
    JOIN project_lu         lu ON lu.project_id = alloc.project_id
    GROUP BY lu.project_type_group, date_trunc('week', alloc.period_date)
),

/* ========= 8. Add totals per week ========== */
weekly_totals AS (
    SELECT
        week_start,
        SUM(planned_fte) AS total_planned,
        SUM(actual_fte)  AS total_actual
    FROM alloc_by_group_period
    GROUP BY week_start
)

/* ========= 9. Final output with percentages ========== */
SELECT
    cal.week_start::text,
    abgp.project_type_group,
    COALESCE(abgp.planned_fte, 0) AS planned_fte,
    COALESCE(abgp.actual_fte,  0) AS actual_fte,
    ROUND(
        (COALESCE(abgp.planned_fte, 0) * 100.0 / NULLIF(wt.total_planned, 0))::numeric,
        2
    ) AS planned_pct,
    ROUND(
        (COALESCE(abgp.actual_fte, 0) * 100.0 / NULLIF(wt.total_actual, 0))::numeric,
        2
    ) AS actual_pct
FROM calendar cal
LEFT JOIN alloc_by_group_period abgp
       ON abgp.week_start = cal.week_start
LEFT JOIN weekly_totals wt
       ON wt.week_start = cal.week_start
ORDER BY cal.week_start, abgp.project_type_group;`,
    //003 - What is my capacity available by Teams vs the Capacity allocated by duration trend?
    capacityAvailability: (
        startDate,
        endDate,
        bucket,
        teamFilter = null,
        teamAllocMgrFilter = null,
        orgFilter = null,
        projectTypeFilter = null,
        projectTypeGroupFilter = null,
        portfolioFilter = null
    ) => `-- ENHANCED QUERY: Team Capacity vs Allocation Trend with Dynamic Filters
-- Description: Shows team capacity available, capacity allocated, and utilization percentage with dropdown filters
-- 
-- REQUIRED Parameters:
--   ${startDate}  - Start date (format: 'YYYY-MM-DD')
--   ${endDate}    - End date (format: 'YYYY-MM-DD')
--   ${bucket}     - Time bucket ('week', 'month', or 'quarter')
--
-- OPTIONAL Filter Parameters (pass NULL or empty array to skip filtering):
--   Resource/Team Filters:
--   ${teamFilter}          - Array of team __path__ values, e.g., ARRAY['team_path_1'] or NULL
--   ${teamAllocMgrFilter}  - Array of team allocation manager __path__ values or NULL
--   ${orgFilter}           - Array of organization __path__ values or NULL
--
--   Project Filters (filter which allocations are counted):
--   ${projectTypeFilter}      - Array of project type names, e.g., ARRAY['RTB', 'Ongoing'] or NULL
--   ${projectTypeGroupFilter} - Array of project type group names or NULL
--   ${portfolioFilter}        - Array of portfolio Id (UUID) values or NULL

WITH params AS (
    SELECT
        DATE '${startDate}'                   AS start_date,
        DATE '${endDate}'                     AS end_date,
        '${bucket}'::text                     AS bucket,
        'Contractor - PT'                     AS excluded_type,
        -- Resource/Team filter parameters (NULL means no filtering)
    ${toSqlArray(teamFilter)}::text[]                 AS team_filter,
    ${toSqlArray(teamAllocMgrFilter)}::text[]         AS team_alloc_mgr_filter,
    ${toSqlArray(orgFilter)}::text[]                  AS org_filter,
        -- Project filter parameters (NULL means no filtering)
    ${toSqlArray(projectTypeFilter)}::text[]          AS project_type_filter,
    ${toSqlArray(projectTypeGroupFilter)}::text[]     AS project_type_group_filter,
    ${toSqlArray(portfolioFilter)}::uuid[]            AS portfolio_filter
),

/* ========= 2. Calendar buckets ========== */
calendar AS (
    SELECT
        gs                                   AS period_start,
        CASE p.bucket
             WHEN 'week'    THEN gs + INTERVAL '1 week'   - INTERVAL '1 day'
             WHEN 'month'   THEN gs + INTERVAL '1 month'  - INTERVAL '1 day'
             WHEN 'quarter' THEN gs + INTERVAL '3 months' - INTERVAL '1 day'
        END                                  AS period_end,
        CEIL( (DATE_PART('day',
                 CASE p.bucket
                      WHEN 'week'    THEN gs + INTERVAL '1 week'   - INTERVAL '1 day'
                      WHEN 'month'   THEN gs + INTERVAL '1 month'  - INTERVAL '1 day'
                      WHEN 'quarter' THEN gs + INTERVAL '3 months' - INTERVAL '1 day'
                 END
                 - gs) + 1) / 7.0 )::int     AS weeks_in_bucket
    FROM params p
    JOIN LATERAL generate_series(
            date_trunc(p.bucket, p.start_date),
            date_trunc(p.bucket, p.end_date),
            CASE p.bucket
                 WHEN 'week'    THEN INTERVAL '1 week'
                 WHEN 'month'   THEN INTERVAL '1 month'
                 WHEN 'quarter' THEN INTERVAL '3 months'
            END
         ) AS gs ON TRUE
),

/* ========= 3. Project Filters ========== */
-- Filter project types by project type group if specified
filtered_project_types AS (
    SELECT
        pt."Id"::text AS type_id  -- UUID to match project.Type
    FROM resource_projecttype pt
    JOIN resource_projecttypegroup ptg ON pt."Group"::uuid = ptg."Id"
    JOIN params p ON TRUE
    WHERE pt.__is_deleted__ = false
      AND (p.project_type_group_filter IS NULL OR ptg."Name" = ANY(p.project_type_group_filter))
      AND (p.project_type_filter IS NULL OR pt."Name" = ANY(p.project_type_filter))
),

-- Filter projects by type, type group, and portfolio
filtered_projects AS (
    SELECT
        proj."Id" AS project_id
    FROM resource_project proj
    JOIN params p ON TRUE
    WHERE proj.__is_deleted__ = false
      AND (p.portfolio_filter IS NULL OR proj."PortfolioId" = ANY(p.portfolio_filter))
      AND (
          -- If project type filters are null, include all projects
          (p.project_type_filter IS NULL AND p.project_type_group_filter IS NULL)
          OR EXISTS (
              SELECT 1 
              FROM filtered_project_types fpt 
              WHERE fpt.type_id = proj."Type"  -- Compare UUID to UUID
          )
      )
),

/* ========= 4. Raw allocations (weekly entries) - FILTERED ========== */
allocations AS (
    SELECT
        a.__parent__                        AS resource_id,
        a."Period"                          AS period_date,
        a."AllocationEntered"               AS alloc_fte
    FROM resource_allocation a
    JOIN params p
      ON a."Period" BETWEEN p.start_date AND p.end_date
    -- Apply project filters to allocations
    WHERE EXISTS (
        SELECT 1 
        FROM filtered_projects fp 
        WHERE fp.project_id = a."Project"
    )
),

/* ========= 5. Organization Filter ========== */
-- Filter resources by organization if org_filter is provided
org_filtered_resources AS (
    SELECT DISTINCT
        orgr."Resource" AS resource_id
    FROM resource_organizationresource orgr
    JOIN params p ON TRUE
    WHERE p.org_filter IS NULL 
       OR orgr."Organization" = ANY(p.org_filter)
),

/* ========= 6. Eligible resources (non-contractor, with start date) - FILTERED ========== */
eligible_resources AS (
    SELECT
        r.__path__                          AS resource_id,
        to_date(r."StartDate", 'YYYY-MM-DD')  AS start_date
    FROM resource_resource r
    JOIN params p ON r."Type" <> p.excluded_type
    -- Apply organization filter
    WHERE EXISTS (
        SELECT 1 
        FROM org_filtered_resources ofr 
        WHERE ofr.resource_id = r.__path__
    )
),

/* ========= 7. Team Filters ========== */
-- Filter teams by allocation manager if team_alloc_mgr_filter is provided
filtered_teams AS (
    SELECT
        t.__path__ AS team_id,
        t."Name" AS team_name,
        t."AllocationManager" AS allocation_manager
    FROM resource_team t
    JOIN params p ON TRUE
    WHERE (p.team_filter IS NULL OR t.__path__ = ANY(p.team_filter))
      AND (p.team_alloc_mgr_filter IS NULL OR t."AllocationManager" = ANY(p.team_alloc_mgr_filter))
),

/* ========= 8. Resource → Team link (static) - FILTERED ========== */
team_map AS (
    SELECT
        tr."Resource" AS resource_id,
        tr."Team"     AS team_id
    FROM resource_teamresource tr
    -- Only include teams that pass the team filters
    WHERE EXISTS (
        SELECT 1 
        FROM filtered_teams ft 
        WHERE ft.team_id = tr."Team"
    )
),

/* ========= 9. Dynamic team capacity for each bucket ========== */
team_capacity AS (
    SELECT
        cal.period_start,
        cal.weeks_in_bucket,
        tm.team_id,
        COUNT(DISTINCT tm.resource_id)              AS headcount
    FROM calendar cal
    JOIN team_map tm           ON TRUE                    -- cross-join buckets
    JOIN eligible_resources er ON er.resource_id = tm.resource_id
                               AND er.start_date <= cal.period_end
    GROUP BY cal.period_start, cal.weeks_in_bucket, tm.team_id
),

/* ========= 10. Allocation totals per bucket ========== */
alloc_by_team_period AS (
    SELECT
        tm.team_id,
        date_trunc(p.bucket, alloc.period_date)     AS period_start,
        SUM(alloc.alloc_fte)                        AS sum_alloc_fte
    FROM allocations alloc
    JOIN params p                ON TRUE
    JOIN team_map tm             ON tm.resource_id   = alloc.resource_id
    JOIN eligible_resources er   ON er.resource_id   = alloc.resource_id
    GROUP BY tm.team_id, date_trunc(p.bucket, alloc.period_date)
)

/* ========= 11. Capacity vs Allocation trend ========= */
SELECT
    ft.team_name,
    cal.period_start::text,
    /* ── capacity ───────────────────────────────────── */
    (tc.headcount * cal.weeks_in_bucket)::numeric          AS capacity_available_fte,
    /* ── allocation ─────────────────────────────────── */
    COALESCE(abp.sum_alloc_fte, 0)::numeric                AS capacity_allocated_fte,
    /* optional helper % */
    ROUND(
        COALESCE(abp.sum_alloc_fte, 0)::numeric
        / NULLIF(tc.headcount * cal.weeks_in_bucket, 0)::numeric
        * 100, 
        2
    ) AS utilization_pct
FROM calendar cal
JOIN team_capacity tc
     ON tc.period_start = cal.period_start
LEFT JOIN alloc_by_team_period abp
       ON  abp.period_start = cal.period_start
       AND abp.team_id      = tc.team_id
JOIN filtered_teams ft
     ON ft.team_id = tc.team_id
ORDER BY ft.team_name, cal.period_start;
`,
    //004/005 - Which teams are over-allocated and under-allocated? (2 separate reporting charts over a period of time)
    resourceUtilization: (
        startDate,
        endDate,
        bucket,
        teamFilter = null,
        teamAllocMgrFilter = null,
        orgFilter = null,
        projectTypeFilter = null,
        projectTypeGroupFilter = null,
        portfolioFilter = null
    ) => `-- ENHANCED QUERY: Resource Utilization with Classification and Dynamic Filters
-- Description: Shows team capacity with utilization classification (over-allocated, under-allocated, balanced)
--              Enhanced with dropdown filters for team and project filtering
-- 
-- REQUIRED Parameters:
--   ${startDate}  - Start date (format: 'YYYY-MM-DD')
--   ${endDate}    - End date (format: 'YYYY-MM-DD')
--   ${bucket}     - Time bucket ('week', 'month', or 'quarter')
--
-- OPTIONAL Filter Parameters (pass NULL or empty array to skip filtering):
--   Resource/Team Filters:
--   ${teamFilter}          - Array of team __path__ values or NULL
--   ${teamAllocMgrFilter}  - Array of team allocation manager __path__ values or NULL
--   ${orgFilter}           - Array of organization __path__ values or NULL
--
--   Project Filters (filter which allocations are counted):
--   ${projectTypeFilter}      - Array of project type names or NULL
--   ${projectTypeGroupFilter} - Array of project type group names or NULL
--   ${portfolioFilter}        - Array of portfolio Id (UUID) values or NULL
--
-- Classification Thresholds:
--   > 100% = over-allocated
--   < 80%  = under-allocated
--   80-100% = balanced

WITH limits AS (
    SELECT
        100::numeric AS over_pct,
        80::numeric  AS under_pct
),
/* ========= 1. Parameter block ========== */
params AS (
    SELECT
        DATE '${startDate}'                   AS start_date,
        DATE '${endDate}'                     AS end_date,
        '${bucket}'::text                     AS bucket,
        'Contractor - PT'                     AS excluded_type,
        -- Resource/Team filter parameters (NULL means no filtering)
    ${toSqlArray(teamFilter)}::text[]                 AS team_filter,
    ${toSqlArray(teamAllocMgrFilter)}::text[]         AS team_alloc_mgr_filter,
    ${toSqlArray(orgFilter)}::text[]                  AS org_filter,
        -- Project filter parameters (NULL means no filtering)
    ${toSqlArray(projectTypeFilter)}::text[]          AS project_type_filter,
    ${toSqlArray(projectTypeGroupFilter)}::text[]     AS project_type_group_filter,
    ${toSqlArray(portfolioFilter)}::uuid[]            AS portfolio_filter
),

/* ========= 2. Calendar buckets ========== */
calendar AS (
    SELECT
        gs                                   AS period_start,
        CASE p.bucket
             WHEN 'week'    THEN gs + INTERVAL '1 week'   - INTERVAL '1 day'
             WHEN 'month'   THEN gs + INTERVAL '1 month'  - INTERVAL '1 day'
             WHEN 'quarter' THEN gs + INTERVAL '3 months' - INTERVAL '1 day'
        END                                  AS period_end,
        CEIL( (DATE_PART('day',
                 CASE p.bucket
                      WHEN 'week'    THEN gs + INTERVAL '1 week'   - INTERVAL '1 day'
                      WHEN 'month'   THEN gs + INTERVAL '1 month'  - INTERVAL '1 day'
                      WHEN 'quarter' THEN gs + INTERVAL '3 months' - INTERVAL '1 day'
                 END
                 - gs) + 1) / 7.0 )::int     AS weeks_in_bucket
    FROM params p
    JOIN LATERAL generate_series(
            date_trunc(p.bucket, p.start_date),
            date_trunc(p.bucket, p.end_date),
            CASE p.bucket
                 WHEN 'week'    THEN INTERVAL '1 week'
                 WHEN 'month'   THEN INTERVAL '1 month'
                 WHEN 'quarter' THEN INTERVAL '3 months'
            END
         ) AS gs ON TRUE
),

/* ========= 3. Project Filters ========== */
-- Filter project types by project type group if specified
filtered_project_types AS (
    SELECT
        pt."Id"::text AS type_id  -- UUID to match project.Type
    FROM resource_projecttype pt
    JOIN resource_projecttypegroup ptg ON pt."Group"::uuid = ptg."Id"
    JOIN params p ON TRUE
    WHERE pt.__is_deleted__ = false
      AND (p.project_type_group_filter IS NULL OR ptg."Name" = ANY(p.project_type_group_filter))
      AND (p.project_type_filter IS NULL OR pt."Name" = ANY(p.project_type_filter))
),

-- Filter projects by type, type group, and portfolio
filtered_projects AS (
    SELECT
        proj."Id" AS project_id
    FROM resource_project proj
    JOIN params p ON TRUE
    WHERE proj.__is_deleted__ = false
      AND (p.portfolio_filter IS NULL OR proj."PortfolioId" = ANY(p.portfolio_filter))
      AND (
          -- If project type filters are null, include all projects
          (p.project_type_filter IS NULL AND p.project_type_group_filter IS NULL)
          OR EXISTS (
              SELECT 1 
              FROM filtered_project_types fpt 
              WHERE fpt.type_id = proj."Type"  -- Compare UUID to UUID
          )
      )
),

/* ========= 4. Raw allocations (weekly entries) - FILTERED ========== */
allocations AS (
    SELECT
        a.__parent__                        AS resource_id,
        a."Period"                          AS period_date,
        a."AllocationEntered"               AS alloc_fte
    FROM resource_allocation a
    JOIN params p
      ON a."Period" BETWEEN p.start_date AND p.end_date
    -- Apply project filters to allocations
    WHERE EXISTS (
        SELECT 1 
        FROM filtered_projects fp 
        WHERE fp.project_id = a."Project"
    )
),

/* ========= 5. Organization Filter ========== */
-- Filter resources by organization if org_filter is provided
org_filtered_resources AS (
    SELECT DISTINCT
        orgr."Resource" AS resource_id
    FROM resource_organizationresource orgr
    JOIN params p ON TRUE
    WHERE p.org_filter IS NULL 
       OR orgr."Organization" = ANY(p.org_filter)
),

/* ========= 6. Eligible resources (non-contractor, with start date) - FILTERED ========== */
eligible_resources AS (
    SELECT
        r.__path__                          AS resource_id,
        to_date(r."StartDate", 'YYYY-MM-DD')  AS start_date
    FROM resource_resource r
    JOIN params p ON r."Type" <> p.excluded_type
    -- Apply organization filter
    WHERE EXISTS (
        SELECT 1 
        FROM org_filtered_resources ofr 
        WHERE ofr.resource_id = r.__path__
    )
),

/* ========= 7. Team Filters ========== */
-- Filter teams by allocation manager if team_alloc_mgr_filter is provided
filtered_teams AS (
    SELECT
        t.__path__ AS team_id,
        t."Name" AS team_name,
        t."AllocationManager" AS allocation_manager
    FROM resource_team t
    JOIN params p ON TRUE
    WHERE (p.team_filter IS NULL OR t.__path__ = ANY(p.team_filter))
      AND (p.team_alloc_mgr_filter IS NULL OR t."AllocationManager" = ANY(p.team_alloc_mgr_filter))
),

/* ========= 8. Resource → Team link (static) - FILTERED ========== */
team_map AS (
    SELECT
        tr."Resource"  AS resource_id,
        tr."Team"      AS team_id
    FROM resource_teamresource tr
    -- Only include teams that pass the team filters
    WHERE EXISTS (
        SELECT 1 
        FROM filtered_teams ft 
        WHERE ft.team_id = tr."Team"
    )
),

/* ========= 9. Dynamic team capacity for each bucket ========== */
team_capacity AS (
    SELECT
        cal.period_start,
        cal.weeks_in_bucket,
        tm.team_id,
        COUNT(DISTINCT tm.resource_id)              AS headcount
    FROM calendar cal
    JOIN team_map tm           ON TRUE
    JOIN eligible_resources er ON er.resource_id = tm.resource_id
                               AND er.start_date <= cal.period_end
    GROUP BY cal.period_start, cal.weeks_in_bucket, tm.team_id
),

/* ========= 10. Allocation totals per bucket ========== */
alloc_by_team_period AS (
    SELECT
        tm.team_id,
        date_trunc(p.bucket, alloc.period_date)     AS period_start,
        SUM(alloc.alloc_fte)                        AS sum_alloc_fte
    FROM allocations alloc
    JOIN params p                ON TRUE
    JOIN team_map tm             ON tm.resource_id   = alloc.resource_id
    JOIN eligible_resources er   ON er.resource_id   = alloc.resource_id
    GROUP BY tm.team_id, date_trunc(p.bucket, alloc.period_date)
)

, baseline AS (
    SELECT
        ft.team_name,
        cal.period_start::text,
        (tc.headcount * cal.weeks_in_bucket)::numeric          AS capacity_available_fte,
        COALESCE(abp.sum_alloc_fte, 0)::numeric                AS capacity_allocated_fte,
        COALESCE(abp.sum_alloc_fte, 0)
        / NULLIF(tc.headcount * cal.weeks_in_bucket, 0)
        * 100                                                  AS utilization_pct
    FROM calendar             cal
    JOIN team_capacity        tc  ON tc.period_start = cal.period_start
    LEFT JOIN alloc_by_team_period abp
         ON  abp.period_start = cal.period_start
         AND abp.team_id      = tc.team_id
    JOIN filtered_teams ft
         ON ft.team_id = tc.team_id
)

/* ========= 11. Classify each row ========== */
SELECT
    b.*,
    CASE
        WHEN b.utilization_pct >  l.over_pct  THEN 'over-allocated'
        WHEN b.utilization_pct <  l.under_pct THEN 'under-allocated'
        ELSE                                      'balanced'
    END AS allocation_status
FROM baseline b
CROSS JOIN limits l
ORDER BY b.team_name, b.period_start;
`,
    //006 -Projects budget vs Planned vs Actuals to date
    budgetVsPlanVsActual: (
        startDate,
        endDate,
        bucket,
        teamFilter = null,
        teamAllocMgrFilter = null,
        orgFilter = null,
        projectTypeFilter = null,
        projectTypeGroupFilter = null,
        portfolioFilter = null
    ) => `-- ENHANCED QUERY: Budget vs Plan vs Actual with Dynamic Filters
-- Description: Compares project budget against planned costs and actual costs to date
--              Enhanced with Project and Resource entity filters
-- 
-- REQUIRED Parameters:
--   ${startDate}  - Start date (format: 'YYYY-MM-DD')
--   ${endDate}    - End date (format: 'YYYY-MM-DD')
--
-- OPTIONAL Filter Parameters (pass NULL or empty array to skip filtering):
--   Project Filters:
--   ${projectTypeFilter}      - Array of project type names, e.g., ARRAY['RTB', 'Ongoing'] or NULL
--   ${projectTypeGroupFilter} - Array of project type group names or NULL
--   ${portfolioFilter}        - Array of portfolio Id (UUID) values or NULL
--
--   Resource/Team Filters (filter which resources' costs are counted):
--   ${teamFilter}          - Array of team __path__ values or NULL
--   ${teamAllocMgrFilter}  - Array of team allocation manager __path__ values or NULL
--   ${orgFilter}           - Array of organization __path__ values or NULL
--
-- Output:
--   project_id: UUID of the project
--   project_name: Name of the project
--   currency: Currency code
--   budget_total: Total project budget
--   planned_to_date: Sum of planned costs in the date range (from filtered resources)
--   actuals_to_date: Sum of actual costs in the date range (from filtered resources)

WITH params AS (
    SELECT
        DATE '${startDate}'                   AS start_date,
        DATE '${endDate}'                     AS end_date,
    -- Project filter parameters
    ${toSqlArray(projectTypeFilter)}::text[]          AS project_type_filter,
    ${toSqlArray(projectTypeGroupFilter)}::text[]     AS project_type_group_filter,
    ${toSqlArray(portfolioFilter)}::uuid[]            AS portfolio_filter,
    -- Resource/Team filter parameters
    ${toSqlArray(teamFilter)}::text[]                 AS team_filter,
    ${toSqlArray(teamAllocMgrFilter)}::text[]         AS team_alloc_mgr_filter,
    ${toSqlArray(orgFilter)}::text[]                  AS org_filter
),

/* ======== 2. PROJECT TYPE FILTERS ================================== */
-- Filter project types by project type group and name
filtered_project_types AS (
    SELECT
        pt."Id"::text AS type_id
    FROM resource_projecttype pt
    JOIN resource_projecttypegroup ptg ON pt."Group"::uuid = ptg."Id"
    JOIN params p ON TRUE
    WHERE pt.__is_deleted__ = false
      AND (p.project_type_group_filter IS NULL OR ptg."Name" = ANY(p.project_type_group_filter))
      AND (p.project_type_filter IS NULL OR pt."Name" = ANY(p.project_type_filter))
),

/* ======== 3. PROJECT FILTERS ======================================= */
-- Filter projects by type, type group, and portfolio
filtered_projects AS (
    SELECT
        proj."Id" AS project_id
    FROM resource_project proj
    JOIN params p ON TRUE
    WHERE proj.__is_deleted__ = false
      AND (p.portfolio_filter IS NULL OR proj."PortfolioId" = ANY(p.portfolio_filter))
      AND (
          -- If project type filters are null, include all projects
          (p.project_type_filter IS NULL AND p.project_type_group_filter IS NULL)
          OR EXISTS (
              SELECT 1 
              FROM filtered_project_types fpt 
              WHERE fpt.type_id = proj."Type"
          )
      )
),

/* ======== 4. RESOURCE/TEAM FILTERS ================================= */
-- Filter resources by organization if org_filter is provided
org_filtered_resources AS (
    SELECT DISTINCT
        orgr."Resource" AS resource_id
    FROM resource_organizationresource orgr
    JOIN params p ON TRUE
    WHERE p.org_filter IS NULL 
       OR orgr."Organization" = ANY(p.org_filter)
),

-- Filter teams by allocation manager if team_alloc_mgr_filter is provided
filtered_teams AS (
    SELECT
        t.__path__ AS team_id
    FROM resource_team t
    JOIN params p ON TRUE
    WHERE (p.team_filter IS NULL OR t.__path__ = ANY(p.team_filter))
      AND (p.team_alloc_mgr_filter IS NULL OR t."AllocationManager" = ANY(p.team_alloc_mgr_filter))
),

-- Team-resource mapping (filtered)
team_filtered_resources AS (
    SELECT DISTINCT
        tr."Resource" AS resource_id
    FROM resource_teamresource tr
    WHERE EXISTS (
        SELECT 1 
        FROM filtered_teams ft 
        WHERE ft.team_id = tr."Team"
    )
),

-- Eligible resources (with org and team filters)
eligible_resources AS (
    SELECT
        r.__path__ AS resource_id
    FROM resource_resource r
    WHERE r.__is_deleted__ = FALSE
      -- Apply organization filter
      AND EXISTS (
          SELECT 1 
          FROM org_filtered_resources ofr 
          WHERE ofr.resource_id = r.__path__
      )
      -- Apply team filter
      AND EXISTS (
          SELECT 1
          FROM team_filtered_resources tfr
          WHERE tfr.resource_id = r.__path__
      )
),

/* ======== 5. ALLOCATION-COST ROWS (FILTERED) ======================= */
alloc_cost AS (
    SELECT
        ac."Project"::uuid                       AS project_id,
        ac."CostCurrency"                        AS currency,
        COALESCE(ac."PlannedCost", 0)            AS planned_cost,
        COALESCE(ac."ActualsCost", 0)            AS actual_cost
    FROM public.resource_allocationcost ac
    JOIN params p
      ON to_date(ac."Period", 'YYYY-MM-DD')
         BETWEEN p.start_date AND p.end_date
    WHERE ac.__is_deleted__ IS FALSE
      -- Apply project filters
      AND EXISTS (
          SELECT 1 
          FROM filtered_projects fp 
          WHERE fp.project_id = ac."Project"::uuid
      )
      -- Apply resource filters (only count costs from filtered resources)
      AND EXISTS (
          SELECT 1
          FROM eligible_resources er
          WHERE er.resource_id = ac."ResourceRef"
      )
),

/* ======== 6. SUM PLAN / ACTUAL TO-DATE PER PROJECT ================= */
cost_by_project AS (
    SELECT
        project_id,
        currency,
        SUM(planned_cost)  AS planned_to_date,
        SUM(actual_cost)   AS actual_to_date
    FROM alloc_cost
    GROUP BY project_id, currency
),

/* ======== 7. PROJECT MASTER WITH BUDGET (FILTERED) ================= */
project_budget AS (
    SELECT
        pr."Id"             AS project_id,
        pr."Name"           AS project_name,
        pr."Budget"         AS budget,
        pr."BudgetCurrency" AS currency
    FROM public.resource_project pr
    WHERE pr.__is_deleted__ IS FALSE
      -- Apply project filters
      AND EXISTS (
          SELECT 1 
          FROM filtered_projects fp 
          WHERE fp.project_id = pr."Id"
      )
)

/* ======== 8. FINAL REPORT ========================================== */
SELECT
    pb.project_id,
    pb.project_name,
    pb.currency,
    pb.budget                                        AS budget_total,
    cbp.planned_to_date                              AS planned_to_date,
    cbp.actual_to_date                               AS actuals_to_date
FROM project_budget pb
LEFT JOIN cost_by_project cbp
       ON cbp.project_id = pb.project_id
WHERE cbp.planned_to_date IS NOT NULL  -- Only show projects with cost data
ORDER BY pb.project_name;
`,
    //(007) Teams whose Actuals are most deviating from the Planned by duration trend?
    resourceActualsDeviation: (
        startDate,
        endDate,
        bucket,
        teamFilter = null,
        teamAllocMgrFilter = null,
        orgFilter = null,
        projectTypeFilter = null,
        projectTypeGroupFilter = null,
        portfolioFilter = null
    ) => `-- ENHANCED QUERY: Resource Actuals Deviation with Dynamic Filters
-- Entity Type: Resource (6 filters required)
-- Filters: Team, Team Alloc Mgr, Org, Project Type, Project Type Group, Portfolio

WITH params AS (
    SELECT
        DATE '${startDate}'                   AS start_date,             -- ← window start
        DATE '${endDate}'                     AS end_date,               -- ← window end
        '${bucket}'::text                     AS bucket,                 -- 'week' | 'month' | 'quarter'
        ''                                    AS excluded_resource_type,
    -- Resource/Team filters
    ${toSqlArray(teamFilter)}::text[]                 AS team_filter,
    ${toSqlArray(teamAllocMgrFilter)}::text[]         AS team_alloc_mgr_filter,
    ${toSqlArray(orgFilter)}::text[]                  AS org_filter,
    -- Project filters (to filter which allocations/projects are counted)
    ${toSqlArray(projectTypeFilter)}::text[]          AS project_type_filter,
    ${toSqlArray(projectTypeGroupFilter)}::text[]     AS project_type_group_filter,
    ${toSqlArray(portfolioFilter)}::uuid[]            AS portfolio_filter
),

/* ========= Filter CTEs ========== */
filtered_project_types AS (
    SELECT
        pt."Id"::text AS type_id  -- UUID to match project.Type
    FROM resource_projecttype pt
    JOIN resource_projecttypegroup ptg ON pt."Group"::uuid = ptg."Id"
    JOIN params p ON TRUE
    WHERE pt.__is_deleted__ = false
      AND (p.project_type_group_filter IS NULL OR ptg."Name" = ANY(p.project_type_group_filter))
      AND (p.project_type_filter IS NULL OR pt."Name" = ANY(p.project_type_filter))
),

filtered_projects AS (
    SELECT
        proj."Id" AS project_id
    FROM resource_project proj
    JOIN params p ON TRUE
    WHERE proj.__is_deleted__ = false
      AND (p.portfolio_filter IS NULL OR proj."PortfolioId" = ANY(p.portfolio_filter))
      AND (
          -- If project type filters are null, include all projects
          (p.project_type_filter IS NULL AND p.project_type_group_filter IS NULL)
          OR EXISTS (
              SELECT 1 
              FROM filtered_project_types fpt 
              WHERE fpt.type_id = proj."Type"  -- ⚠️ CRITICAL: Compare UUID to UUID
          )
      )
),

org_filtered_resources AS (
    SELECT DISTINCT
        orgr."Resource" AS resource_id
    FROM resource_organizationresource orgr
    JOIN params p ON TRUE
    WHERE p.org_filter IS NULL 
       OR orgr."Organization" = ANY(p.org_filter)
),

filtered_teams AS (
    SELECT
        t.__path__ AS team_id,
        t."Name" AS team_name
    FROM resource_team t
    JOIN params p ON TRUE
    WHERE (p.team_filter IS NULL OR t.__path__ = ANY(p.team_filter))
      AND (p.team_alloc_mgr_filter IS NULL OR t."AllocationManager" = ANY(p.team_alloc_mgr_filter))
),

team_filtered_resources AS (
    SELECT DISTINCT
        tr."Resource" AS resource_id
    FROM resource_teamresource tr
    WHERE EXISTS (
        SELECT 1 
        FROM filtered_teams ft 
        WHERE ft.team_id = tr."Team"
    )
),

/* ========= 2. Calendar buckets ==================================== */
calendar AS (
    SELECT
        gs AS period_start,
        CASE p.bucket
             WHEN 'week'    THEN gs + INTERVAL '1 week'   - INTERVAL '1 day'
             WHEN 'month'   THEN gs + INTERVAL '1 month'  - INTERVAL '1 day'
             WHEN 'quarter' THEN gs + INTERVAL '3 months' - INTERVAL '1 day'
        END AS period_end
    FROM params p
    JOIN LATERAL generate_series(
            CASE p.bucket
                 WHEN 'week'    THEN date_trunc('week', p.start_date)
                 WHEN 'month'   THEN date_trunc('month', p.start_date)
                 WHEN 'quarter' THEN date_trunc('quarter', p.start_date)
            END,
            CASE p.bucket
                 WHEN 'week'    THEN date_trunc('week', p.end_date)
                 WHEN 'month'   THEN date_trunc('month', p.end_date)
                 WHEN 'quarter' THEN date_trunc('quarter', p.end_date)
            END,
            CASE p.bucket
                 WHEN 'week'    THEN INTERVAL '1 week'
                 WHEN 'month'   THEN INTERVAL '1 month'
                 WHEN 'quarter' THEN INTERVAL '3 months'
            END
        ) AS gs ON TRUE
),

/* ========= 3. Weekly rows with plan & actual ====================== */
alloc AS (
    SELECT
        a.__parent__                          AS resource_id,
        a."Period"                            AS period_date,
        COALESCE(a."AllocationEntered", 0)    AS plan_fte,
        COALESCE(a."ActualsEntered", 0)        AS actual_fte
    FROM public.resource_allocation a
    JOIN params p
      ON a."Period" BETWEEN p.start_date AND p.end_date
    -- Apply project filter (only if project filters are specified)
    WHERE (
        (p.project_type_filter IS NULL AND p.project_type_group_filter IS NULL AND p.portfolio_filter IS NULL)
        OR EXISTS (
            SELECT 1
            FROM filtered_projects fp
            WHERE fp.project_id = a."Project"::uuid
        )
    )
),

/* ========= 4. Eligible resources ================================== */
eligible_resources AS (
    SELECT
        r.__path__                            AS resource_id,
        to_date(r."StartDate", 'YYYY-MM-DD')  AS start_date
    FROM public.resource_resource r
    JOIN params p
      ON r."Type" <> p.excluded_resource_type
     AND to_date(r."StartDate", 'YYYY-MM-DD') <= p.end_date
     AND r.__is_deleted__ = false
      -- Apply organization filter (only if org_filter is specified)
      AND (
          p.org_filter IS NULL 
          OR EXISTS (
              SELECT 1 
              FROM org_filtered_resources ofr 
              WHERE ofr.resource_id = r.__path__
          )
      )
      -- Apply team filter (only if team_filter or team_alloc_mgr_filter is specified)
      AND (
          (p.team_filter IS NULL AND p.team_alloc_mgr_filter IS NULL)
          OR EXISTS (
              SELECT 1
              FROM team_filtered_resources tfr
              WHERE tfr.resource_id = r.__path__
          )
      )
),

/* ========= 5. Company-wide plan / delta per bucket ================ */
company_dev AS (
    SELECT
        CASE p.bucket
             WHEN 'week'    THEN date_trunc('week', a.period_date)
             WHEN 'month'   THEN date_trunc('month', a.period_date)
             WHEN 'quarter' THEN date_trunc('quarter', a.period_date)
        END AS period_start,
        SUM(a.plan_fte)                               AS planned_fte,
        SUM(GREATEST(a.plan_fte - a.actual_fte, 0))   AS delta_fte
    FROM alloc a
    JOIN params p              ON TRUE
    JOIN eligible_resources er ON er.resource_id = a.resource_id
    GROUP BY
        CASE p.bucket
             WHEN 'week'    THEN date_trunc('week', a.period_date)
             WHEN 'month'   THEN date_trunc('month', a.period_date)
             WHEN 'quarter' THEN date_trunc('quarter', a.period_date)
        END
)

/* ========= 6. Final overall metrics =============================== */
SELECT
    cal.period_start::text,
    ROUND((cd.delta_fte / NULLIF(cd.planned_fte, 0))::numeric * 100, 2) AS deviation_pct,
    ROUND((100::numeric - (cd.delta_fte / NULLIF(cd.planned_fte, 0))::numeric * 100), 2) AS in_plan_pct
FROM calendar cal
JOIN company_dev cd
  ON cd.period_start = cal.period_start
ORDER BY cal.period_start;`,

    //(008) How much units is being actuals on unapproved projects by team?
    unapprovedProjectActualsByTeam: (
        startDate,
        endDate,
        bucket,
        teamFilter = null,
        teamAllocMgrFilter = null,
        orgFilter = null,
        projectTypeFilter = null,
        projectTypeGroupFilter = null,
        portfolioFilter = null,
        resourceFilter = null,
        projectFilter = null
    ) => `-- ENHANCED QUERY: Unapproved Project Actuals by Team with Dynamic Filters
-- Description: Categorizes actuals into Approved Work, Unplanned Projects, Other Work, and Personal Time
--              Enhanced with all 8 dropdown filters for Actuals entity
-- 
-- REQUIRED Parameters:
--   ${startDate}  - Start date (format: 'YYYY-MM-DD')
--   ${endDate}    - End date (format: 'YYYY-MM-DD')
--   ${bucket}     - Time bucket ('week', 'month', or 'quarter')
--
-- OPTIONAL Filter Parameters (pass NULL or empty array to skip filtering):
--   Resource Filters:
--   ${resourceFilter}      - Array of resource __path__ values (UUIDs) or NULL
--   ${teamFilter}          - Array of team __path__ values or NULL
--   ${teamAllocMgrFilter}  - Array of team allocation manager __path__ values or NULL
--   ${orgFilter}           - Array of organization __path__ values or NULL
--
--   Project Filters:
--   ${projectFilter}          - Array of project Id (UUID) values or NULL
--   ${projectTypeFilter}      - Array of project type names or NULL
--   ${projectTypeGroupFilter} - Array of project type group names or NULL
--   ${portfolioFilter}        - Array of portfolio Id (UUID) values or NULL
--
-- Categories:
--   - Approved Work: Actuals that match or are less than allocation
--   - Unplanned Projects: Actuals exceeding allocation
--   - Other Work: Actuals on 'Other Work' project
--   - Personal Time: Actuals on 'Personal Time' project

WITH params AS (
    SELECT
        DATE '${startDate}' AS start_date,
        DATE '${endDate}'   AS end_date,
        '${bucket}'::text   AS bucket,
        -- Resource/Team filter parameters
    ${toSqlArray(resourceFilter)}::text[]             AS resource_filter,
    ${toSqlArray(teamFilter)}::text[]                 AS team_filter,
    ${toSqlArray(teamAllocMgrFilter)}::text[]         AS team_alloc_mgr_filter,
    ${toSqlArray(orgFilter)}::text[]                  AS org_filter,
        -- Project filter parameters
    ${toSqlArray(projectFilter)}::uuid[]              AS project_filter,
    ${toSqlArray(projectTypeFilter)}::text[]          AS project_type_filter,
    ${toSqlArray(projectTypeGroupFilter)}::text[]     AS project_type_group_filter,
    ${toSqlArray(portfolioFilter)}::uuid[]            AS portfolio_filter
),

/* ========= 2. CALENDAR BUCKETS ==================================== */
calendar AS (
    SELECT
        gs::date AS period_start,
        CASE p.bucket
            WHEN 'week'    THEN (gs + INTERVAL '6 days')::date
            WHEN 'month'   THEN (gs + INTERVAL '1 month'  - INTERVAL '1 day')::date
            WHEN 'quarter' THEN (gs + INTERVAL '3 months' - INTERVAL '1 day')::date
        END AS period_end
    FROM params p
    JOIN LATERAL generate_series(
        CASE p.bucket
            WHEN 'week'    THEN date_trunc('week', p.start_date)
            WHEN 'month'   THEN date_trunc('month', p.start_date)
            WHEN 'quarter' THEN date_trunc('quarter', p.start_date)
        END,
        CASE p.bucket
            WHEN 'week'    THEN date_trunc('week', p.end_date)
            WHEN 'month'   THEN date_trunc('month', p.end_date)
            WHEN 'quarter' THEN date_trunc('quarter', p.end_date)
        END,
        CASE p.bucket
            WHEN 'week'    THEN INTERVAL '1 week'
            WHEN 'month'   THEN INTERVAL '1 month'
            WHEN 'quarter' THEN INTERVAL '3 months'
        END
    ) AS gs ON TRUE
),

/* ========= 3. PROJECT FILTERS ===================================== */
-- Filter project types by project type group if specified
filtered_project_types AS (
    SELECT
        pt."Id"::text AS type_id
    FROM resource_projecttype pt
    JOIN resource_projecttypegroup ptg ON pt."Group"::uuid = ptg."Id"
    JOIN params p ON TRUE
    WHERE pt.__is_deleted__ = false
      AND (p.project_type_group_filter IS NULL OR ptg."Name" = ANY(p.project_type_group_filter))
      AND (p.project_type_filter IS NULL OR pt."Name" = ANY(p.project_type_filter))
),

-- Filter projects by type, type group, and portfolio
filtered_projects AS (
    SELECT
        proj."Id" AS project_id
    FROM resource_project proj
    JOIN params p ON TRUE
    WHERE proj.__is_deleted__ = false
      AND (p.project_filter IS NULL OR proj."Id" = ANY(p.project_filter))
      AND (p.portfolio_filter IS NULL OR proj."PortfolioId" = ANY(p.portfolio_filter))
      AND (
          (p.project_type_filter IS NULL AND p.project_type_group_filter IS NULL)
          OR EXISTS (
              SELECT 1 
              FROM filtered_project_types fpt 
              WHERE fpt.type_id = proj."Type"
          )
      )
),

/* ========= 4. RESOURCE FILTERS ==================================== */
-- Filter resources by organization if org_filter is provided
org_filtered_resources AS (
    SELECT DISTINCT
        orgr."Resource" AS resource_id
    FROM resource_organizationresource orgr
    JOIN params p ON TRUE
    WHERE p.org_filter IS NULL 
       OR orgr."Organization" = ANY(p.org_filter)
),

-- Eligible resources (with organization and direct resource filters)
eligible_resources AS (
    SELECT
        r.__path__ AS resource_id
    FROM resource_resource r
    JOIN params p ON TRUE
    WHERE r.__is_deleted__ = false
      AND (p.resource_filter IS NULL OR r.__path__ = ANY(p.resource_filter))
      AND EXISTS (
          SELECT 1 
          FROM org_filtered_resources ofr 
          WHERE ofr.resource_id = r.__path__
      )
),

/* ========= 5. TEAM FILTERS ======================================== */
-- Filter teams by allocation manager if team_alloc_mgr_filter is provided
filtered_teams AS (
    SELECT
        t.__path__ AS team_id,
        t."Name" AS team_name
    FROM resource_team t
    JOIN params p ON TRUE
    WHERE (p.team_filter IS NULL OR t.__path__ = ANY(p.team_filter))
      AND (p.team_alloc_mgr_filter IS NULL OR t."AllocationManager" = ANY(p.team_alloc_mgr_filter))
),

/* ========= 6. TEAM MAP  (resource ➜ team) - FILTERED ============== */
team_map AS (
    SELECT
        tr."Resource" AS resource_id,
        tr."Team"     AS team_id
    FROM public.resource_teamresource tr
    -- Only include filtered teams
    WHERE EXISTS (
        SELECT 1 
        FROM filtered_teams ft 
        WHERE ft.team_id = tr."Team"
    )
    -- Only include eligible resources
    AND EXISTS (
        SELECT 1
        FROM eligible_resources er
        WHERE er.resource_id = tr."Resource"
    )
),

/* ========= 7. ALLOCATION ROWS  (add team_id) - FILTERED =========== */
alloc AS (
    SELECT
        CASE p.bucket
            WHEN 'week'    THEN date_trunc('week', a."Period")::date
            WHEN 'month'   THEN date_trunc('month', a."Period")::date
            WHEN 'quarter' THEN date_trunc('quarter', a."Period")::date
        END AS period_start,
        pr."Name"        AS project_name,
        tm.team_id,
        COALESCE(a."AllocationEntered", 0) AS plan_units,
        COALESCE(a."ActualsEntered" , 0)   AS actual_units
    FROM public.resource_allocation a
    JOIN params p
      ON a."Period" BETWEEN p.start_date AND p.end_date
    JOIN team_map tm 
      ON tm.resource_id = a.__parent__
    JOIN public.resource_project pr
      ON pr."Id" = a."Project"::uuid
    -- Apply project filters
    WHERE EXISTS (
        SELECT 1 
        FROM filtered_projects fp 
        WHERE fp.project_id = a."Project"::uuid
    )
),

/* ========= 8. BUCKET TOTALS BY CATEGORY & TEAM ==================== */
bucket_totals AS (
    SELECT
        period_start,
        team_id,

        /* denominator --------------------------------------------- */
        SUM(actual_units) AS total_actuals,

        /* Personal Time ------------------------------------------- */
        SUM(CASE WHEN project_name = 'Personal Time'
                 THEN actual_units ELSE 0 END) AS personal_units,

        /* Other Work ---------------------------------------------- */
        SUM(CASE WHEN project_name = 'Other Work'
                 THEN actual_units ELSE 0 END) AS other_units,

        /* Approved Work ------------------------------------------- */
        SUM(CASE
                WHEN project_name NOT IN ('Personal Time','Other Work')
                THEN LEAST(plan_units, actual_units)
                ELSE 0
            END) AS approved_units,

       /* Unplanned Projects -------------------------------------- */
        SUM(CASE
                WHEN project_name NOT IN ('Personal Time','Other Work')
                THEN GREATEST(actual_units - plan_units, 0)
                ELSE 0
            END)                                                     AS unplanned_units
    FROM alloc
    GROUP BY period_start, team_id
)

/* ========= 9. UNPIVOT & % SHARE  ================================== */
SELECT
    ft.team_name,
    cal.period_start::text,
    cat.category,
    cat.units,
    ROUND(
        CASE
            WHEN bt.total_actuals = 0 THEN 0
            ELSE (cat.units::numeric / bt.total_actuals)::numeric * 100
        END
    , 2) AS pct_of_actuals
FROM calendar cal
JOIN bucket_totals bt
      ON bt.period_start = cal.period_start
JOIN filtered_teams ft
      ON ft.team_id      = bt.team_id
/* unpivot four category columns into rows */
CROSS JOIN LATERAL (
    VALUES
        ('Approved Work'     , COALESCE(bt.approved_units , 0)),
        ('Unplanned Projects', COALESCE(bt.unplanned_units, 0)),
        ('Other Work'        , COALESCE(bt.other_units    , 0)),
        ('Personal Time'     , COALESCE(bt.personal_units , 0))
) AS cat(category, units)
ORDER BY ft.team_name,
         cal.period_start,
         CASE cat.category
              WHEN 'Approved Work'      THEN 1
              WHEN 'Unplanned Projects' THEN 2
              WHEN 'Other Work'         THEN 3
              WHEN 'Personal Time'      THEN 4
         END;
`,

    //(009)Ratio of employees (FTE) to contractors stacked by onshore and offshore resources
    resourceFTEContractorRatio: (startDate, endDate, bucket, teamFilter, teamAllocMgrFilter, orgFilter, projectTypeFilter, projectTypeGroupFilter, portfolioFilter) => `-- ENHANCED QUERY: Resource FTE Contractor Ratio with Dynamic Filters
-- Entity Type: Resource (6 filters required)
-- Filters: Team, Team Alloc Mgr, Org, Project Type, Project Type Group, Portfolio

WITH params AS (
    SELECT
        -- Resource/Team filters
    ${toSqlArray(teamFilter)}::text[]                 AS team_filter,
    ${toSqlArray(teamAllocMgrFilter)}::text[]         AS team_alloc_mgr_filter,
    ${toSqlArray(orgFilter)}::text[]                  AS org_filter,
        -- Project filters (to filter which resources are counted based on their project assignments)
    ${toSqlArray(projectTypeFilter)}::text[]          AS project_type_filter,
    ${toSqlArray(projectTypeGroupFilter)}::text[]     AS project_type_group_filter,
    ${toSqlArray(portfolioFilter)}::uuid[]            AS portfolio_filter
),

/* ========= Filter CTEs ========== */
filtered_project_types AS (
    SELECT
        pt."Id"::text AS type_id  -- UUID to match project.Type
    FROM resource_projecttype pt
    JOIN resource_projecttypegroup ptg ON pt."Group"::uuid = ptg."Id"
    JOIN params p ON TRUE
    WHERE pt.__is_deleted__ = false
      AND (p.project_type_group_filter IS NULL OR ptg."Name" = ANY(p.project_type_group_filter))
      AND (p.project_type_filter IS NULL OR pt."Name" = ANY(p.project_type_filter))
),

filtered_projects AS (
    SELECT
        proj."Id" AS project_id
    FROM resource_project proj
    JOIN params p ON TRUE
    WHERE proj.__is_deleted__ = false
      AND (p.portfolio_filter IS NULL OR proj."PortfolioId" = ANY(p.portfolio_filter))
      AND (
          -- If project type filters are null, include all projects
          (p.project_type_filter IS NULL AND p.project_type_group_filter IS NULL)
          OR EXISTS (
              SELECT 1 
              FROM filtered_project_types fpt 
              WHERE fpt.type_id = proj."Type"  -- ⚠️ CRITICAL: Compare UUID to UUID
          )
      )
),

org_filtered_resources AS (
    SELECT DISTINCT
        orgr."Resource" AS resource_id
    FROM resource_organizationresource orgr
    JOIN params p ON TRUE
    WHERE p.org_filter IS NULL 
       OR orgr."Organization" = ANY(p.org_filter)
),

filtered_teams AS (
    SELECT
        t.__path__ AS team_id,
        t."Name" AS team_name
    FROM resource_team t
    JOIN params p ON TRUE
    WHERE (p.team_filter IS NULL OR t.__path__ = ANY(p.team_filter))
      AND (p.team_alloc_mgr_filter IS NULL OR t."AllocationManager" = ANY(p.team_alloc_mgr_filter))
),

team_filtered_resources AS (
    SELECT DISTINCT
        tr."Resource" AS resource_id
    FROM resource_teamresource tr
    WHERE EXISTS (
        SELECT 1 
        FROM filtered_teams ft 
        WHERE ft.team_id = tr."Team"
    )
),

eligible_resources AS (
    SELECT DISTINCT
        r.__path__ AS resource_id
    FROM resource_resource r
    JOIN params p ON TRUE
    WHERE r.__is_deleted__ = false
      AND r."Status" = 'Active'
      -- Apply organization filter (only if org_filter is specified)
      AND (
          p.org_filter IS NULL 
          OR EXISTS (
              SELECT 1 
              FROM org_filtered_resources ofr 
              WHERE ofr.resource_id = r.__path__
          )
      )
      -- Apply team filter (only if team_filter or team_alloc_mgr_filter is specified)
      AND (
          (p.team_filter IS NULL AND p.team_alloc_mgr_filter IS NULL)
          OR EXISTS (
              SELECT 1
              FROM team_filtered_resources tfr
              WHERE tfr.resource_id = r.__path__
          )
      )
      -- Apply project filter (only if project filters are specified)
      AND (
          (p.project_type_filter IS NULL AND p.project_type_group_filter IS NULL AND p.portfolio_filter IS NULL)
          OR EXISTS (
              SELECT 1
              FROM resource_allocation a
              JOIN filtered_projects fp ON fp.project_id = a."Project"::uuid
              WHERE a.__parent__ = r.__path__
                AND a.__is_deleted__ = false
          )
      )
)

/* ========= Main Query ========== */
SELECT
    r."LocationCategory"                  AS shore_flag,
    COUNT(DISTINCT r.__path__) FILTER (WHERE r."Type" = 'FTE')   AS fte_cnt,
    COUNT(DISTINCT r.__path__) FILTER (WHERE r."Type" <> 'FTE')  AS contractor_cnt
FROM public.resource_resource r
JOIN params p ON TRUE
WHERE r.__is_deleted__ = false
  AND r."Status" = 'Active'
  -- Apply all filters through eligible_resources
  AND EXISTS (
      SELECT 1
      FROM eligible_resources er
      WHERE er.resource_id = r.__path__
  )
GROUP BY r."LocationCategory";
`,
    //(010) Total active projects breakdown by project type
    activeProjectsByType: (
        startDate,
        endDate,
        bucket,
        teamFilter = null,
        teamAllocMgrFilter = null,
        orgFilter = null,
        projectTypeFilter = null,
        projectTypeGroupFilter = null,
        portfolioFilter = null
    ) => `-- ENHANCED QUERY: Active Projects by Type with Dynamic Filters
-- Entity Type: Project (6 filters required)
-- Filters: Project Type, Project Type Group, Portfolio, Team, Team Alloc Mgr, Org

WITH params AS (
    SELECT
        -- Project filters
    ${toSqlArray(projectTypeFilter)}::text[]          AS project_type_filter,
    ${toSqlArray(projectTypeGroupFilter)}::text[]     AS project_type_group_filter,
    ${toSqlArray(portfolioFilter)}::uuid[]            AS portfolio_filter,
        -- Resource/Team filters (to filter which projects are counted based on their resource assignments)
    ${toSqlArray(teamFilter)}::text[]                 AS team_filter,
    ${toSqlArray(teamAllocMgrFilter)}::text[]         AS team_alloc_mgr_filter,
    ${toSqlArray(orgFilter)}::text[]                  AS org_filter
),

/* ========= Filter CTEs ========== */
filtered_project_types AS (
    SELECT
        pt."Id"::text AS type_id  -- UUID to match project.Type
    FROM resource_projecttype pt
    JOIN resource_projecttypegroup ptg ON pt."Group"::uuid = ptg."Id"
    JOIN params p ON TRUE
    WHERE pt.__is_deleted__ = false
      AND (p.project_type_group_filter IS NULL OR ptg."Name" = ANY(p.project_type_group_filter))
      AND (p.project_type_filter IS NULL OR pt."Name" = ANY(p.project_type_filter))
),

filtered_projects AS (
    SELECT
        proj."Id" AS project_id
    FROM resource_project proj
    JOIN params p ON TRUE
    WHERE proj.__is_deleted__ = false
      AND (p.portfolio_filter IS NULL OR proj."PortfolioId" = ANY(p.portfolio_filter))
      AND (
          -- If project type filters are null, include all projects
          (p.project_type_filter IS NULL AND p.project_type_group_filter IS NULL)
          OR EXISTS (
              SELECT 1 
              FROM filtered_project_types fpt 
              WHERE fpt.type_id = proj."Type"  
          )
      )
),

org_filtered_resources AS (
    SELECT DISTINCT
        orgr."Resource" AS resource_id
    FROM resource_organizationresource orgr
    JOIN params p ON TRUE
    WHERE p.org_filter IS NULL 
       OR orgr."Organization" = ANY(p.org_filter)
),

filtered_teams AS (
    SELECT
        t.__path__ AS team_id,
        t."Name" AS team_name
    FROM resource_team t
    JOIN params p ON TRUE
    WHERE (p.team_filter IS NULL OR t.__path__ = ANY(p.team_filter))
      AND (p.team_alloc_mgr_filter IS NULL OR t."AllocationManager" = ANY(p.team_alloc_mgr_filter))
),

team_filtered_resources AS (
    SELECT DISTINCT
        tr."Resource" AS resource_id
    FROM resource_teamresource tr
    WHERE EXISTS (
        SELECT 1 
        FROM filtered_teams ft 
        WHERE ft.team_id = tr."Team"
    )
),

eligible_resources AS (
    SELECT DISTINCT
        r.__path__ AS resource_id
    FROM resource_resource r
    JOIN params p ON TRUE
    WHERE r.__is_deleted__ = false
      -- Apply organization filter (only if org_filter is specified)
      AND (
          p.org_filter IS NULL 
          OR EXISTS (
              SELECT 1 
              FROM org_filtered_resources ofr 
              WHERE ofr.resource_id = r.__path__
          )
      )
      -- Apply team filter (only if team_filter or team_alloc_mgr_filter is specified)
      AND (
          (p.team_filter IS NULL AND p.team_alloc_mgr_filter IS NULL)
          OR EXISTS (
              SELECT 1
              FROM team_filtered_resources tfr
              WHERE tfr.resource_id = r.__path__
          )
      )
)

/* ========= Main Query ========== */
SELECT
    ptg."Name" as "_type",
    pt."Color",
    COUNT(rp."Id") as count
FROM public.resource_project rp
JOIN public.resource_projecttype pt
  ON rp."Type"::uuid = pt."Id"
JOIN public.resource_projecttypegroup ptg
  ON pt."Group"::uuid = ptg."Id"
JOIN params p ON TRUE
WHERE pt."Status" = 'Active'
  -- Apply project filters (only if project filters are specified)
  AND (
      (p.project_type_filter IS NULL AND p.project_type_group_filter IS NULL AND p.portfolio_filter IS NULL)
      OR EXISTS (
          SELECT 1
          FROM filtered_projects fp
          WHERE fp.project_id = rp."Id"
      )
  )
  -- Apply resource filters (only if resource filters are specified)
  AND (
      (p.team_filter IS NULL AND p.team_alloc_mgr_filter IS NULL AND p.org_filter IS NULL)
      OR EXISTS (
          SELECT 1
          FROM resource_allocation a
          JOIN eligible_resources er ON er.resource_id = a.__parent__
          WHERE a."Project"::uuid = rp."Id"
            AND a.__is_deleted__ = false
      )
  )
GROUP BY ptg."Name", pt."Color"
ORDER BY count DESC;`,

    //(011) Total headcount breakdown by FTE vs contractors
    totalHeadcount: (
        startDate,
        endDate,
        bucket,
        teamFilter = null,
        teamAllocMgrFilter = null,
        orgFilter = null,
        projectTypeFilter = null,
        projectTypeGroupFilter = null,
        portfolioFilter = null
    ) => `-- ENHANCED QUERY: Total Headcount with Dynamic Filters
-- Entity Type: Resource (6 filters required)
-- Filters: Team, Team Alloc Mgr, Org, Project Type, Project Type Group, Portfolio

WITH params AS (
    SELECT
        -- Resource/Team filters
    ${toSqlArray(teamFilter)}::text[]                 AS team_filter,
    ${toSqlArray(teamAllocMgrFilter)}::text[]         AS team_alloc_mgr_filter,
    ${toSqlArray(orgFilter)}::text[]                  AS org_filter,
        -- Project filters (to filter which resources are counted based on their project assignments)
    ${toSqlArray(projectTypeFilter)}::text[]          AS project_type_filter,
    ${toSqlArray(projectTypeGroupFilter)}::text[]     AS project_type_group_filter,
    ${toSqlArray(portfolioFilter)}::uuid[]            AS portfolio_filter
),

/* ========= Filter CTEs ========== */
filtered_project_types AS (
    SELECT
        pt."Id"::text AS type_id  -- UUID to match project.Type
    FROM resource_projecttype pt
    JOIN resource_projecttypegroup ptg ON pt."Group"::uuid = ptg."Id"
    JOIN params p ON TRUE
    WHERE pt.__is_deleted__ = false
      AND (p.project_type_group_filter IS NULL OR ptg."Name" = ANY(p.project_type_group_filter))
      AND (p.project_type_filter IS NULL OR pt."Name" = ANY(p.project_type_filter))
),

filtered_projects AS (
    SELECT
        proj."Id" AS project_id
    FROM resource_project proj
    JOIN params p ON TRUE
    WHERE proj.__is_deleted__ = false
      AND (p.portfolio_filter IS NULL OR proj."PortfolioId" = ANY(p.portfolio_filter))
      AND (
          -- If project type filters are null, include all projects
          (p.project_type_filter IS NULL AND p.project_type_group_filter IS NULL)
          OR EXISTS (
              SELECT 1 
              FROM filtered_project_types fpt 
              WHERE fpt.type_id = proj."Type"  -- ⚠️ CRITICAL: Compare UUID to UUID
          )
      )
),

org_filtered_resources AS (
    SELECT DISTINCT
        orgr."Resource" AS resource_id
    FROM resource_organizationresource orgr
    JOIN params p ON TRUE
    WHERE p.org_filter IS NULL 
       OR orgr."Organization" = ANY(p.org_filter)
),

filtered_teams AS (
    SELECT
        t.__path__ AS team_id,
        t."Name" AS team_name
    FROM resource_team t
    JOIN params p ON TRUE
    WHERE (p.team_filter IS NULL OR t.__path__ = ANY(p.team_filter))
      AND (p.team_alloc_mgr_filter IS NULL OR t."AllocationManager" = ANY(p.team_alloc_mgr_filter))
),

team_filtered_resources AS (
    SELECT DISTINCT
        tr."Resource" AS resource_id
    FROM resource_teamresource tr
    WHERE EXISTS (
        SELECT 1 
        FROM filtered_teams ft 
        WHERE ft.team_id = tr."Team"
    )
),

eligible_resources AS (
    SELECT DISTINCT
        r.__path__ AS resource_id
    FROM resource_resource r
    JOIN params p ON TRUE
    WHERE r.__is_deleted__ = false
      AND r."Status" = 'Active'
      -- Apply organization filter (only if org_filter is specified)
      AND (
          p.org_filter IS NULL 
          OR EXISTS (
              SELECT 1 
              FROM org_filtered_resources ofr 
              WHERE ofr.resource_id = r.__path__
          )
      )
      -- Apply team filter (only if team_filter or team_alloc_mgr_filter is specified)
      AND (
          (p.team_filter IS NULL AND p.team_alloc_mgr_filter IS NULL)
          OR EXISTS (
              SELECT 1
              FROM team_filtered_resources tfr
              WHERE tfr.resource_id = r.__path__
          )
      )
      -- Apply project filter (only if project filters are specified)
      AND (
          (p.project_type_filter IS NULL AND p.project_type_group_filter IS NULL AND p.portfolio_filter IS NULL)
          OR EXISTS (
              SELECT 1
              FROM resource_allocation a
              JOIN filtered_projects fp ON fp.project_id = a."Project"::uuid
              WHERE a.__parent__ = r.__path__
                AND a.__is_deleted__ = false
          )
      )
)

/* ========= Main Query ========== */
SELECT 
    r."Type" as "_type",
    COUNT(*) as count
FROM public.resource_resource r
JOIN params p ON TRUE
WHERE r."Status" = 'Active'
  AND r.__is_deleted__ = false
  -- Apply all filters through eligible_resources
  AND EXISTS (
      SELECT 1
      FROM eligible_resources er
      WHERE er.resource_id = r.__path__
  )
GROUP BY r."Type";`,

    //(0011) - Unplanned Allocation Units
    unapprovedProjectAllocation: (
        startDate,
        endDate,
        bucket,
        teamFilter = null,
        teamAllocMgrFilter = null,
        orgFilter = null,
        projectTypeFilter = null,
        projectTypeGroupFilter = null,
        portfolioFilter = null,
        resourceFilter = null,
        projectFilter = null
    ) => `-- ENHANCED QUERY: Unapproved Project Allocation with Dynamic Filters
-- Entity Type: Allocation (8 filters required)
-- Filters: Team, Team Alloc Mgr, Org, Project Type, Project Type Group, Portfolio, Project, Resource

WITH params AS (
    SELECT
        DATE '${startDate}'                   AS start_date,             -- ← window start
        DATE '${endDate}'                   AS end_date,               -- ← window end
        '${bucket}'::text      AS bucket,           -- 'week' | 'month' | 'quarter'
        -- Resource/Team filters
    ${toSqlArray(teamFilter)}::text[]                 AS team_filter,
    ${toSqlArray(teamAllocMgrFilter)}::text[]         AS team_alloc_mgr_filter,
    ${toSqlArray(orgFilter)}::text[]                  AS org_filter,
        -- Project filters
    ${toSqlArray(projectTypeFilter)}::text[]          AS project_type_filter,
    ${toSqlArray(projectTypeGroupFilter)}::text[]     AS project_type_group_filter,
    ${toSqlArray(portfolioFilter)}::uuid[]            AS portfolio_filter,
    ${toSqlArray(projectFilter)}::uuid[]              AS project_filter,
        -- Resource filter
    ${toSqlArray(resourceFilter)}::text[]             AS resource_filter
),

/* ========= Filter CTEs ========== */
filtered_project_types AS (
    SELECT
        pt."Id"::text AS type_id  -- UUID to match project.Type
    FROM resource_projecttype pt
    JOIN resource_projecttypegroup ptg ON pt."Group"::uuid = ptg."Id"
    JOIN params p ON TRUE
    WHERE pt.__is_deleted__ = false
      AND (p.project_type_group_filter IS NULL OR ptg."Name" = ANY(p.project_type_group_filter))
      AND (p.project_type_filter IS NULL OR pt."Name" = ANY(p.project_type_filter))
),

filtered_projects AS (
    SELECT
        proj."Id" AS project_id
    FROM resource_project proj
    JOIN params p ON TRUE
    WHERE proj.__is_deleted__ = false
      AND (p.portfolio_filter IS NULL OR proj."PortfolioId" = ANY(p.portfolio_filter))
      AND (p.project_filter IS NULL OR proj."Id" = ANY(p.project_filter))
      AND (
          -- If project type filters are null, include all projects
          (p.project_type_filter IS NULL AND p.project_type_group_filter IS NULL)
          OR EXISTS (
              SELECT 1 
              FROM filtered_project_types fpt 
              WHERE fpt.type_id = proj."Type"  -- ⚠️ CRITICAL: Compare UUID to UUID
          )
      )
),

org_filtered_resources AS (
    SELECT DISTINCT
        orgr."Resource" AS resource_id
    FROM resource_organizationresource orgr
    JOIN params p ON TRUE
    WHERE p.org_filter IS NULL 
       OR orgr."Organization" = ANY(p.org_filter)
),

filtered_teams AS (
    SELECT
        t.__path__ AS team_id,
        t."Name" AS team_name
    FROM resource_team t
    JOIN params p ON TRUE
    WHERE (p.team_filter IS NULL OR t.__path__ = ANY(p.team_filter))
      AND (p.team_alloc_mgr_filter IS NULL OR t."AllocationManager" = ANY(p.team_alloc_mgr_filter))
),

team_filtered_resources AS (
    SELECT DISTINCT
        tr."Resource" AS resource_id
    FROM resource_teamresource tr
    WHERE EXISTS (
        SELECT 1 
        FROM filtered_teams ft 
        WHERE ft.team_id = tr."Team"
    )
),

eligible_resources AS (
    SELECT DISTINCT
        r.__path__ AS resource_id
    FROM resource_resource r
    JOIN params p ON TRUE
    WHERE r.__is_deleted__ = false
      AND (p.resource_filter IS NULL OR r.__path__ = ANY(p.resource_filter))
      -- Apply organization filter (only if org_filter is specified)
      AND (
          p.org_filter IS NULL 
          OR EXISTS (
              SELECT 1 
              FROM org_filtered_resources ofr 
              WHERE ofr.resource_id = r.__path__
          )
      )
      -- Apply team filter (only if team_filter or team_alloc_mgr_filter is specified)
      AND (
          (p.team_filter IS NULL AND p.team_alloc_mgr_filter IS NULL)
          OR EXISTS (
              SELECT 1
              FROM team_filtered_resources tfr
              WHERE tfr.resource_id = r.__path__
          )
      )
),

/* ========= 2. CALENDAR BUCKETS ==================================== */
calendar AS (
    SELECT
        gs::date AS period_start,
        CASE p.bucket
             WHEN 'week'    THEN (gs + INTERVAL '6 days')::date
             WHEN 'month'   THEN (gs + INTERVAL '1 month'  - INTERVAL '1 day')::date
             WHEN 'quarter' THEN (gs + INTERVAL '3 months' - INTERVAL '1 day')::date
        END AS period_end
    FROM params p
    JOIN LATERAL generate_series(
            date_trunc(p.bucket, p.start_date),
            date_trunc(p.bucket, p.end_date),
            CASE p.bucket
                 WHEN 'week'    THEN INTERVAL '1 week'
                 WHEN 'month'   THEN INTERVAL '1 month'
                 WHEN 'quarter' THEN INTERVAL '3 months'
            END
         ) AS gs ON TRUE
),

/* ========= 3. ALLOCATION ROWS ===================================== */
alloc AS (
    SELECT
        date_trunc(p.bucket, a."Period")::date AS period_start,
        pr."Name"                                                    AS project_name,
        COALESCE(a."AllocationEntered", 0)                           AS plan_units,
        COALESCE(a."ActualsEntered" , 0)                             AS actual_units
    FROM public.resource_allocation a
    JOIN params p
      ON a."Period"
         BETWEEN p.start_date AND p.end_date
    JOIN public.resource_project pr
      ON pr."Id" = a."Project"::uuid
    -- Apply resource filter
    WHERE EXISTS (
        SELECT 1
        FROM eligible_resources er
        WHERE er.resource_id = a.__parent__
    )
    -- Apply project filter (only if project filters are specified)
    AND (
        (p.project_type_filter IS NULL AND p.project_type_group_filter IS NULL AND p.portfolio_filter IS NULL AND p.project_filter IS NULL)
        OR EXISTS (
            SELECT 1
            FROM filtered_projects fp
            WHERE fp.project_id = pr."Id"
        )
    )
),

/* ========= 4. BUCKET TOTALS BY CATEGORY =========================== */
bucket_totals AS (
    SELECT
        period_start,

        /* ---- total actuals (denominator) ------------------------ */
        SUM(actual_units)                                            AS total_actuals,

        /* ---- Personal Time ------------------------------------- */
        SUM(CASE WHEN project_name = 'Personal Time'
                 THEN actual_units ELSE 0 END)                       AS personal_units,

        /* ---- Other Work ---------------------------------------- */
        SUM(CASE WHEN project_name = 'Other Work'
                 THEN actual_units ELSE 0 END)                       AS other_units,

        /* ---- Approved Work  (min(plan,actual)) ----------------- */
        SUM(CASE
                WHEN project_name NOT IN ('Personal Time','Other Work')
                THEN LEAST(plan_units, actual_units)
                ELSE 0
            END)                                                     AS approved_units,

        /* ---- Unplanned Projects  (excess actual) --------------- */
        SUM(CASE
                WHEN project_name NOT IN ('Personal Time','Other Work')
                THEN GREATEST(actual_units - plan_units, 0)
                ELSE 0
            END)                                                     AS unplanned_units
    FROM alloc
    GROUP BY period_start
)

/* ========= 5. UNPIVOT & % SHARE =================================== */
SELECT
    cal.period_start::text,
    cat.category,
    cat.units,
    ROUND(
        CASE
            WHEN bt.total_actuals = 0 THEN 0
            ELSE (cat.units::numeric / bt.total_actuals)::numeric * 100
        END
    , 2) AS pct_of_actuals
FROM calendar cal
LEFT JOIN bucket_totals bt
  ON bt.period_start = cal.period_start
CROSS JOIN LATERAL (
    VALUES
        ('Approved Work'     , COALESCE(bt.approved_units , 0)),
        ('Unplanned Projects', COALESCE(bt.unplanned_units, 0)),
        ('Other Work'        , COALESCE(bt.other_units    , 0)),
        ('Personal Time'     , COALESCE(bt.personal_units , 0))
) AS cat(category, units)
ORDER BY cal.period_start,
         CASE cat.category
              WHEN 'Approved Work'      THEN 1
              WHEN 'Unplanned Projects' THEN 2
              WHEN 'Other Work'         THEN 3
              WHEN 'Personal Time'      THEN 4
         END;`,

    //001 - Percentage of coverage of resource allocation by teams by duration trend (duration trend is always weeks/months/quarters). Exclude PT contractor allocation
    resourceCoverage: (startDate, endDate, bucket, teamFilter = null, teamAllocMgrFilter = null, orgFilter = null, projectTypeFilter = null, projectTypeGroupFilter = null, portfolioFilter = null) => `-- ENHANCED QUERY: Team Coverage Report with Dynamic Filters
-- Description: Calculates team allocation coverage percentage over time periods with dropdown filters
-- 
-- REQUIRED Parameters:
--   ${startDate}  - Start date (format: 'YYYY-MM-DD')
--   ${endDate}    - End date (format: 'YYYY-MM-DD')
--   ${bucket}     - Time bucket ('week', 'month', or 'quarter')
--
-- OPTIONAL Filter Parameters (pass NULL or empty array to skip filtering):
--   Resource/Team Filters:
--   ${teamFilter}          - Array of team __path__ values, e.g., ARRAY['team_path_1', 'team_path_2'] or NULL
--   ${teamAllocMgrFilter}  - Array of team allocation manager __path__ values or NULL
--   ${orgFilter}           - Array of organization __path__ values or NULL
--
--   Project Filters (filter which allocations are counted):
--   ${projectTypeFilter}      - Array of project type names, e.g., ARRAY['Development', 'Maintenance'] or NULL
--   ${projectTypeGroupFilter} - Array of project type group names or NULL
--   ${portfolioFilter}        - Array of portfolio Id (UUID) values or NULL
--
-- Example Usage:
-- 1. No filters (show all teams, all allocations):
--    All filters = NULL
--
-- 2. Filter by specific teams:
--    ${teamFilter} = ARRAY['Resource$Team/uuid-here']
--
-- 3. Filter by project portfolio (only count allocations to Portfolio X):
--    ${portfolioFilter} = ARRAY['portfolio-uuid-here']
--
-- 4. Filter by project type group (only count allocations to certain project types):
--    ${projectTypeGroupFilter} = ARRAY['Development', 'Support']
--
-- 5. Combine multiple filters:
--    ${teamFilter} = ARRAY['team1', 'team2']
--    ${portfolioFilter} = ARRAY['portfolio1']
--    (Shows coverage for team1 and team2, but only for allocations to portfolio1)

WITH params AS (
        SELECT
            DATE '${startDate}'                   AS start_date,
            DATE '${endDate}'                     AS end_date,
            '${bucket}'::text                     AS bucket,
            'Contractor - PT'                     AS excluded_type,
            -- Resource/Team filter parameters (NULL means no filtering)
        ${toSqlArray(teamFilter)}::text[]                 AS team_filter,
        ${toSqlArray(teamAllocMgrFilter)}::text[]         AS team_alloc_mgr_filter,
        ${toSqlArray(orgFilter)}::text[]                  AS org_filter,
            -- Project filter parameters (NULL means no filtering)
        ${toSqlArray(projectTypeFilter)}::text[]          AS project_type_filter,
        ${toSqlArray(projectTypeGroupFilter)}::text[]     AS project_type_group_filter,
        ${toSqlArray(portfolioFilter)}::uuid[]            AS portfolio_filter
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
    -- Filter project types by project type group if specified
    filtered_project_types AS (
        SELECT
            pt."Id"::text AS type_id  -- Store UUID as text to match project.Type
        FROM resource_projecttype pt
        JOIN resource_projecttypegroup ptg ON pt."Group"::uuid = ptg."Id"
        JOIN params p ON TRUE
        WHERE pt.__is_deleted__ = false
          AND (p.project_type_group_filter IS NULL OR ptg."Name" = ANY(p.project_type_group_filter))
          AND (p.project_type_filter IS NULL OR pt."Name" = ANY(p.project_type_filter))
    ),
    -- Filter projects by type, type group, and portfolio
    filtered_projects AS (
        SELECT
            proj."Id" AS project_id
        FROM resource_project proj
        JOIN params p ON TRUE
        WHERE proj.__is_deleted__ = false
          AND (p.portfolio_filter IS NULL OR proj."PortfolioId" = ANY(p.portfolio_filter))
          AND (
              -- If project type filters are null, include all projects
              (p.project_type_filter IS NULL AND p.project_type_group_filter IS NULL)
              OR EXISTS (
                  SELECT 1 
                  FROM filtered_project_types fpt 
                  WHERE fpt.type_id = proj."Type"  -- Compare UUID to UUID
              )
          )
    ),
    allocations AS (
        SELECT
            a.__parent__ AS resource_id,
            a."Period" AS period_date,
            a."AllocationEntered" AS alloc_fte
        FROM resource_allocation a
        JOIN params p
          ON a."Period"
             BETWEEN p.start_date AND p.end_date
        -- Apply project filters to allocations
        WHERE EXISTS (
            SELECT 1 
            FROM filtered_projects fp 
            WHERE fp.project_id = a."Project"
        )
    ),
    -- Filter resources by organization if org_filter is provided
    org_filtered_resources AS (
        SELECT DISTINCT
            orgr."Resource" AS resource_id
        FROM resource_organizationresource orgr
        JOIN params p ON TRUE
        WHERE p.org_filter IS NULL 
           OR orgr."Organization" = ANY(p.org_filter)
    ),
    eligible_resources AS (
        SELECT
            r.__path__ AS resource_id,
            to_date(r."StartDate", 'YYYY-MM-DD') AS start_date
        FROM resource_resource r
        JOIN params p ON r."Type" <> p.excluded_type
        -- Apply organization filter
        WHERE EXISTS (
            SELECT 1 
            FROM org_filtered_resources ofr 
            WHERE ofr.resource_id = r.__path__
        )
    ),
    -- Filter teams by allocation manager if team_alloc_mgr_filter is provided
    filtered_teams AS (
        SELECT
            t.__path__ AS team_id,
            t."Name" AS team_name,
            t."AllocationManager" AS allocation_manager
        FROM resource_team t
        JOIN params p ON TRUE
        WHERE (p.team_filter IS NULL OR t.__path__ = ANY(p.team_filter))
          AND (p.team_alloc_mgr_filter IS NULL OR t."AllocationManager" = ANY(p.team_alloc_mgr_filter))
    ),
    team_map AS (
        SELECT
            tr."Resource" AS resource_id,
            tr."Team"  AS team_id
        FROM resource_teamresource tr
        -- Only include teams that pass the team filters
        WHERE EXISTS (
            SELECT 1 
            FROM filtered_teams ft 
            WHERE ft.team_id = tr."Team"
        )
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
        ft.team_name,
        cal.period_start::text,
        ROUND(
            (COALESCE(abp.sum_alloc_fte, 0)
             / NULLIF(tc.headcount * cal.weeks_in_bucket, 0) * 100
            )::numeric, 2
        ) AS coverage_pct
    FROM calendar cal
    JOIN team_capacity tc ON tc.period_start = cal.period_start
    LEFT JOIN alloc_by_team_period abp
           ON abp.period_start = cal.period_start AND abp.team_id = tc.team_id
    JOIN filtered_teams ft ON ft.team_id = tc.team_id
    ORDER BY ft.team_name, cal.period_start;
`,
    activeProjects: (
        startDate,
        endDate,
        bucket,
        teamFilter = null,
        teamAllocMgrFilter = null,
        orgFilter = null,
        projectTypeFilter = null,
        projectTypeGroupFilter = null,
        portfolioFilter = null
    ) => `-- ENHANCED QUERY: Active Projects with Dynamic Filters
-- Entity Type: Project (6 filters required)
-- Filters: Project Type, Project Type Group, Portfolio, Team, Team Alloc Mgr, Org

WITH params AS (
    SELECT
        -- Project filters
    ${toSqlArray(projectTypeFilter)}::text[]          AS project_type_filter,
    ${toSqlArray(projectTypeGroupFilter)}::text[]     AS project_type_group_filter,
    ${toSqlArray(portfolioFilter)}::uuid[]            AS portfolio_filter,
        -- Resource filters (to filter which resources' allocations count)
    ${toSqlArray(teamFilter)}::text[]                 AS team_filter,
    ${toSqlArray(teamAllocMgrFilter)}::text[]         AS team_alloc_mgr_filter,
    ${toSqlArray(orgFilter)}::text[]                  AS org_filter
),

/* ========= Filter CTEs ========== */
filtered_project_types AS (
    SELECT
        pt."Id"::text AS type_id  -- UUID to match project.Type
    FROM resource_projecttype pt
    JOIN resource_projecttypegroup ptg ON pt."Group"::uuid = ptg."Id"
    JOIN params p ON TRUE
    WHERE pt.__is_deleted__ = false
      AND (p.project_type_group_filter IS NULL OR ptg."Name" = ANY(p.project_type_group_filter))
      AND (p.project_type_filter IS NULL OR pt."Name" = ANY(p.project_type_filter))
),

filtered_projects AS (
    SELECT
        proj."Id" AS project_id
    FROM resource_project proj
    JOIN params p ON TRUE
    WHERE proj.__is_deleted__ = false
      AND proj."Status" IN ('Active', 'Approved')
      AND (p.portfolio_filter IS NULL OR proj."PortfolioId" = ANY(p.portfolio_filter))
      AND (
          -- If project type filters are null, include all projects
          (p.project_type_filter IS NULL AND p.project_type_group_filter IS NULL)
          OR EXISTS (
              SELECT 1 
              FROM filtered_project_types fpt 
              WHERE fpt.type_id = proj."Type"  -- ⚠️ CRITICAL: Compare UUID to UUID
          )
      )
),

org_filtered_resources AS (
    SELECT DISTINCT
        orgr."Resource" AS resource_id
    FROM resource_organizationresource orgr
    JOIN params p ON TRUE
    WHERE p.org_filter IS NULL 
       OR orgr."Organization" = ANY(p.org_filter)
),

filtered_teams AS (
    SELECT
        t.__path__ AS team_id,
        t."Name" AS team_name
    FROM resource_team t
    JOIN params p ON TRUE
    WHERE (p.team_filter IS NULL OR t.__path__ = ANY(p.team_filter))
      AND (p.team_alloc_mgr_filter IS NULL OR t."AllocationManager" = ANY(p.team_alloc_mgr_filter))
),

team_filtered_resources AS (
    SELECT DISTINCT
        tr."Resource" AS resource_id
    FROM resource_teamresource tr
    WHERE EXISTS (
        SELECT 1 
        FROM filtered_teams ft 
        WHERE ft.team_id = tr."Team"
    )
),

eligible_resources AS (
    SELECT
        r.__path__ AS resource_id
    FROM resource_resource r
    WHERE r.__is_deleted__ = FALSE
      -- Apply organization filter
      AND EXISTS (
          SELECT 1 
          FROM org_filtered_resources ofr 
          WHERE ofr.resource_id = r.__path__
      )
      -- Apply team filter
      AND EXISTS (
          SELECT 1
          FROM team_filtered_resources tfr
          WHERE tfr.resource_id = r.__path__
      )
)

/* ========= Main Query ========== */
SELECT 
    COUNT(*) as Active_project
FROM filtered_projects fp
JOIN params p ON TRUE
-- Apply resource filters (for Project entity, resource filters determine which projects are counted)
WHERE (
    (p.team_filter IS NULL AND p.team_alloc_mgr_filter IS NULL AND p.org_filter IS NULL)
    OR EXISTS (
        SELECT 1
        FROM resource_allocation a
        JOIN eligible_resources er ON er.resource_id = a.__parent__
        WHERE a."Project"::uuid = fp.project_id
          AND a.__is_deleted__ = false
    )
);`,

    activeResources: (
        startDate,
        endDate,
        bucket,
        teamFilter = null,
        teamAllocMgrFilter = null,
        orgFilter = null,
        projectTypeFilter = null,
        projectTypeGroupFilter = null,
        portfolioFilter = null
    ) => `-- ENHANCED QUERY: Active Resources with Dynamic Filters
-- Entity Type: Resource (6 filters required)
-- Filters: Team, Team Alloc Mgr, Org, Project Type, Project Type Group, Portfolio

WITH params AS (
    SELECT
        -- Resource/Team filters
        ${toSqlArray(teamFilter)}::text[]                 AS team_filter,
        ${toSqlArray(teamAllocMgrFilter)}::text[]         AS team_alloc_mgr_filter,
        ${toSqlArray(orgFilter)}::text[]                  AS org_filter,
        -- Project filters (to filter which allocations/projects are counted)
        ${toSqlArray(projectTypeFilter)}::text[]          AS project_type_filter,
        ${toSqlArray(projectTypeGroupFilter)}::text[]     AS project_type_group_filter,
        ${toSqlArray(portfolioFilter)}::uuid[]            AS portfolio_filter
),

/* ========= Filter CTEs ========== */
filtered_project_types AS (
    SELECT
        pt."Id"::text AS type_id  -- UUID to match project.Type
    FROM resource_projecttype pt
    JOIN resource_projecttypegroup ptg ON pt."Group"::uuid = ptg."Id"
    JOIN params p ON TRUE
    WHERE pt.__is_deleted__ = false
      AND (p.project_type_group_filter IS NULL OR ptg."Name" = ANY(p.project_type_group_filter))
      AND (p.project_type_filter IS NULL OR pt."Name" = ANY(p.project_type_filter))
),

filtered_projects AS (
    SELECT
        proj."Id" AS project_id
    FROM resource_project proj
    JOIN params p ON TRUE
    WHERE proj.__is_deleted__ = false
      AND (p.portfolio_filter IS NULL OR proj."PortfolioId" = ANY(p.portfolio_filter))
      AND (
          -- If project type filters are null, include all projects
          (p.project_type_filter IS NULL AND p.project_type_group_filter IS NULL)
          OR EXISTS (
              SELECT 1 
              FROM filtered_project_types fpt 
              WHERE fpt.type_id = proj."Type"  -- ⚠️ CRITICAL: Compare UUID to UUID
          )
      )
),

org_filtered_resources AS (
    SELECT DISTINCT
        orgr."Resource" AS resource_id
    FROM resource_organizationresource orgr
    JOIN params p ON TRUE
    WHERE p.org_filter IS NULL 
       OR orgr."Organization" = ANY(p.org_filter)
),

filtered_teams AS (
    SELECT
        t.__path__ AS team_id,
        t."Name" AS team_name
    FROM resource_team t
    JOIN params p ON TRUE
    WHERE (p.team_filter IS NULL OR t.__path__ = ANY(p.team_filter))
      AND (p.team_alloc_mgr_filter IS NULL OR t."AllocationManager" = ANY(p.team_alloc_mgr_filter))
),

team_filtered_resources AS (
    SELECT DISTINCT
        tr."Resource" AS resource_id
    FROM resource_teamresource tr
    WHERE EXISTS (
        SELECT 1 
        FROM filtered_teams ft 
        WHERE ft.team_id = tr."Team"
    )
)

/* ========= Main Query ========== */
SELECT 
    COUNT(*) as Active_Resource
FROM resource_resource r
JOIN params p ON TRUE
WHERE r.__is_deleted__ = false
  AND r."Status" = 'Active'
  -- Apply organization filter
  AND EXISTS (
      SELECT 1 
      FROM org_filtered_resources ofr 
      WHERE ofr.resource_id = r.__path__
  )
  -- Apply team filter
  AND EXISTS (
      SELECT 1
      FROM team_filtered_resources tfr
      WHERE tfr.resource_id = r.__path__
  )
  -- Apply project filters (for Resource entity, project filters determine which allocations count)
  -- Only apply project filter if project filters are specified
  AND (
      (p.project_type_filter IS NULL AND p.project_type_group_filter IS NULL AND p.portfolio_filter IS NULL)
      OR EXISTS (
          SELECT 1
          FROM resource_allocation a
          JOIN filtered_projects fp ON fp.project_id = a."Project"::uuid
          WHERE a.__parent__ = r.__path__
            AND a.__is_deleted__ = false
      )
  );`,

    actualsConfirmed: (startDate, endDate, bucket, teamFilter = null, teamAllocMgrFilter = null, orgFilter = null, projectTypeFilter = null, projectTypeGroupFilter = null, portfolioFilter = null, resourceFilter = null, projectFilter = null) => `-- ENHANCED QUERY: Actuals Confirmed with Dynamic Filters
-- Entity Type: Actuals (8 filters required)
-- Filters: Team, Team Alloc Mgr, Org, Project Type, Project Type Group, Portfolio, Project, Resource

WITH params AS (
    SELECT
        DATE '${startDate}'                   AS start_date,             -- ← window start
        DATE '${endDate}'                   AS end_date,               -- ← window end
        '${bucket}'::text       AS bucket,        -- 'week' | 'month' | 'quarter'
        -- Resource/Team filters
    ${toSqlArray(teamFilter)}::text[]                 AS team_filter,
    ${toSqlArray(teamAllocMgrFilter)}::text[]         AS team_alloc_mgr_filter,
    ${toSqlArray(orgFilter)}::text[]                  AS org_filter,
        -- Project filters
    ${toSqlArray(projectTypeFilter)}::text[]          AS project_type_filter,
    ${toSqlArray(projectTypeGroupFilter)}::text[]     AS project_type_group_filter,
    ${toSqlArray(portfolioFilter)}::uuid[]            AS portfolio_filter,
    ${toSqlArray(projectFilter)}::uuid[]              AS project_filter,
        -- Resource filter
    ${toSqlArray(resourceFilter)}::text[]             AS resource_filter
),

/* ========= Filter CTEs ========== */
filtered_project_types AS (
    SELECT
        pt."Id"::text AS type_id  
    FROM resource_projecttype pt
    LEFT JOIN resource_projecttypegroup ptg ON pt."Group"::uuid = ptg."Id"
    JOIN params p ON TRUE
    WHERE pt.__is_deleted__ = false
      AND (p.project_type_group_filter IS NULL OR ptg."Name" = ANY(p.project_type_group_filter))
      AND (p.project_type_filter IS NULL OR pt."Name" = ANY(p.project_type_filter))
),

filtered_projects AS (
    SELECT
        proj."Id" AS project_id
    FROM resource_project proj
    JOIN params p ON TRUE
    WHERE proj.__is_deleted__ = false
      AND (p.portfolio_filter IS NULL OR proj."PortfolioId" = ANY(p.portfolio_filter))
      AND (p.project_filter IS NULL OR proj."Id" = ANY(p.project_filter))
      AND (
          -- If project type filters are null, include all projects
          (p.project_type_filter IS NULL AND p.project_type_group_filter IS NULL)
          OR EXISTS (
              SELECT 1 
              FROM filtered_project_types fpt 
              WHERE fpt.type_id = proj."Type"  
          )
      )
),

org_filtered_resources AS (
    SELECT DISTINCT
        orgr."Resource" AS resource_id
    FROM resource_organizationresource orgr
    JOIN params p ON TRUE
    WHERE p.org_filter IS NOT NULL 
       AND orgr."Organization" = ANY(p.org_filter)
),

filtered_teams AS (
    SELECT
        t.__path__ AS team_id,
        t."Name" AS team_name
    FROM resource_team t
    JOIN params p ON TRUE
    WHERE (p.team_filter IS NULL OR t.__path__ = ANY(p.team_filter))
      AND (p.team_alloc_mgr_filter IS NULL OR t."AllocationManager" = ANY(p.team_alloc_mgr_filter))
),

team_filtered_resources AS (
    SELECT DISTINCT
        tr."Resource" AS resource_id
    FROM resource_teamresource tr
    JOIN params p ON TRUE
    WHERE (p.team_filter IS NOT NULL OR p.team_alloc_mgr_filter IS NOT NULL)
      AND EXISTS (
        SELECT 1 
        FROM filtered_teams ft 
        WHERE ft.team_id = tr."Team"
    )
),

eligible_resources AS (
    SELECT DISTINCT
        r.__path__ AS resource_id
    FROM resource_resource r
    JOIN params p ON TRUE
    WHERE r.__is_deleted__ = false
      AND (p.resource_filter IS NULL OR r.__path__ = ANY(p.resource_filter))
      -- Apply organization filter (only if org_filter is specified)
      -- When NULL, include all resources (don't require org assignment)
      AND (
          p.org_filter IS NULL 
          OR EXISTS (
              SELECT 1 
              FROM org_filtered_resources ofr 
              WHERE ofr.resource_id = r.__path__
          )
      )
      -- Apply team filter (only if team_filter or team_alloc_mgr_filter is specified)
      -- When NULL, include all resources (don't require team assignment)
      AND (
          (p.team_filter IS NULL AND p.team_alloc_mgr_filter IS NULL)
          OR EXISTS (
              SELECT 1
              FROM team_filtered_resources tfr
              WHERE tfr.resource_id = r.__path__
          )
      )
),

/* ========= 2. Calendar buckets ==================================== */
calendar AS (
    SELECT
        gs::date AS period_start,
        CASE p.bucket
             WHEN 'week'    THEN (gs + INTERVAL '6 days')::date
             WHEN 'month'   THEN (gs + INTERVAL '1 month'  - INTERVAL '1 day')::date
             WHEN 'quarter' THEN (gs + INTERVAL '3 months' - INTERVAL '1 day')::date
        END      AS period_end
    FROM params p
    JOIN LATERAL generate_series(
           date_trunc(p.bucket, p.start_date),
           date_trunc(p.bucket, p.end_date),
           CASE p.bucket
                WHEN 'week'    THEN INTERVAL '1 week'
                WHEN 'month'   THEN INTERVAL '1 month'
                WHEN 'quarter' THEN INTERVAL '3 months'
           END
         ) AS gs ON TRUE
),

/* ========= 3. Bucketed actual-status rows ========================= */
bucket_actuals AS (
    SELECT
        date_trunc(p.bucket, to_date(a."Period", 'YYYY-MM-DD'))::date AS period_start,
        COUNT(*)                                                     AS total_rows,
        COUNT(*) FILTER (WHERE a."Status" = 'Confirmed')              AS confirmed_rows
    FROM public.resource_actualsstatus a
    JOIN params p
      ON to_date(a."Period", 'YYYY-MM-DD')
         BETWEEN p.start_date AND p.end_date
    -- Apply resource filter (only if any resource-related filter is specified)
    -- When all resource filters are NULL, include all actuals (even if resource is missing/deleted)
    WHERE (
        (p.resource_filter IS NULL AND p.org_filter IS NULL AND p.team_filter IS NULL AND p.team_alloc_mgr_filter IS NULL)
        OR EXISTS (
            SELECT 1
            FROM eligible_resources er
            WHERE er.resource_id = a.__parent__
        )
    )
    -- Apply project filter (only if project filters are specified)
    AND (
        (p.project_type_filter IS NULL AND p.project_type_group_filter IS NULL AND p.portfolio_filter IS NULL AND p.project_filter IS NULL)
        OR EXISTS (
            SELECT 1
            FROM resource_allocation al
            JOIN filtered_projects fp ON fp.project_id = al."Project"::uuid
            WHERE al.__parent__ = a.__parent__
              AND al."Period"::text = a."Period"
              AND al.__is_deleted__ = false
        )
    )
    GROUP BY date_trunc(p.bucket, to_date(a."Period", 'YYYY-MM-DD'))
)

/* ========= 4. Final report ======================================== */
SELECT
    cal.period_start::text,
    cal.period_end::text,
    COALESCE(ba.total_rows, 0)      AS total_rows,
    COALESCE(ba.confirmed_rows, 0)  AS confirmed_rows,
    ROUND(
        CASE
            WHEN COALESCE(ba.total_rows, 0) = 0 THEN 0
            ELSE (ba.confirmed_rows::numeric / ba.total_rows) * 100
        END
    , 2)                            AS pct_confirmed
FROM calendar cal
LEFT JOIN bucket_actuals ba
       ON ba.period_start = cal.period_start
ORDER BY cal.period_start;`,

    totalResourceCost: (startDate, endDate, bucket, teamFilter = null, teamAllocMgrFilter = null, orgFilter = null, projectTypeFilter = null, projectTypeGroupFilter = null, portfolioFilter = null) => `-- ENHANCED QUERY: Total Resource Cost with Dynamic Filters
-- Entity Type: Resource (6 filters required)
-- Filters: Team, Team Alloc Mgr, Org, Project Type, Project Type Group, Portfolio

WITH params AS (
    SELECT
        DATE '${startDate}' AS start_date,
        DATE '${endDate}' AS end_date,
        -- Resource/Team filters
    ${toSqlArray(teamFilter)}::text[]                 AS team_filter,
    ${toSqlArray(teamAllocMgrFilter)}::text[]         AS team_alloc_mgr_filter,
    ${toSqlArray(orgFilter)}::text[]                  AS org_filter,
        -- Project filters (to filter which allocations/projects are counted)
    ${toSqlArray(projectTypeFilter)}::text[]          AS project_type_filter,
    ${toSqlArray(projectTypeGroupFilter)}::text[]     AS project_type_group_filter,
    ${toSqlArray(portfolioFilter)}::uuid[]            AS portfolio_filter
),

/* ========= Filter CTEs ========== */
filtered_project_types AS (
    SELECT
        pt."Id"::text AS type_id  -- UUID to match project.Type
    FROM resource_projecttype pt
    JOIN resource_projecttypegroup ptg ON pt."Group"::uuid = ptg."Id"
    JOIN params p ON TRUE
    WHERE pt.__is_deleted__ = false
      AND (p.project_type_group_filter IS NULL OR ptg."Name" = ANY(p.project_type_group_filter))
      AND (p.project_type_filter IS NULL OR pt."Name" = ANY(p.project_type_filter))
),

filtered_projects AS (
    SELECT
        proj."Id" AS project_id
    FROM resource_project proj
    JOIN params p ON TRUE
    WHERE proj.__is_deleted__ = false
      AND (p.portfolio_filter IS NULL OR proj."PortfolioId" = ANY(p.portfolio_filter))
      AND (
          -- If project type filters are null, include all projects
          (p.project_type_filter IS NULL AND p.project_type_group_filter IS NULL)
          OR EXISTS (
              SELECT 1 
              FROM filtered_project_types fpt 
              WHERE fpt.type_id = proj."Type"  -- ⚠️ CRITICAL: Compare UUID to UUID
          )
      )
),

org_filtered_resources AS (
    SELECT DISTINCT
        orgr."Resource" AS resource_id
    FROM resource_organizationresource orgr
    JOIN params p ON TRUE
    WHERE p.org_filter IS NULL 
       OR orgr."Organization" = ANY(p.org_filter)
),

filtered_teams AS (
    SELECT
        t.__path__ AS team_id,
        t."Name" AS team_name
    FROM resource_team t
    JOIN params p ON TRUE
    WHERE (p.team_filter IS NULL OR t.__path__ = ANY(p.team_filter))
      AND (p.team_alloc_mgr_filter IS NULL OR t."AllocationManager" = ANY(p.team_alloc_mgr_filter))
),

team_filtered_resources AS (
    SELECT DISTINCT
        tr."Resource" AS resource_id
    FROM resource_teamresource tr
    WHERE EXISTS (
        SELECT 1 
        FROM filtered_teams ft 
        WHERE ft.team_id = tr."Team"
    )
),

eligible_resources AS (
    SELECT
        r.__path__ AS resource_id
    FROM resource_resource r
    WHERE r.__is_deleted__ = FALSE
      AND r."Type" <> 'Contractor - PT'
      -- Apply organization filter
      AND EXISTS (
          SELECT 1 
          FROM org_filtered_resources ofr 
          WHERE ofr.resource_id = r.__path__
      )
      -- Apply team filter
      AND EXISTS (
          SELECT 1
          FROM team_filtered_resources tfr
          WHERE tfr.resource_id = r.__path__
      )
)

/* ========= Main Query ========== */
SELECT
    SUM(rcu."PlannedCost") AS total_cost,
    rcu."CostCurrency" AS Currency
FROM resource_allocationcost rcu
JOIN params p ON TRUE
JOIN eligible_resources er ON er.resource_id = rcu."ResourceRef"
WHERE rcu."Period"::date BETWEEN p.start_date AND p.end_date
  AND rcu.__is_deleted__ = FALSE
  -- Apply project filters (only if project filters are specified)
  AND (
      (p.project_type_filter IS NULL AND p.project_type_group_filter IS NULL AND p.portfolio_filter IS NULL)
      OR EXISTS (
          SELECT 1
          FROM filtered_projects fp
          WHERE fp.project_id = rcu."Project"::uuid
      )
  )
GROUP BY rcu."CostCurrency";`,

    allocationPercentage: (
        startDate,
        endDate,
        bucket,
        teamFilter = null,
        teamAllocMgrFilter = null,
        orgFilter = null,
        projectTypeFilter = null,
        projectTypeGroupFilter = null,
        portfolioFilter = null
    ) => `-- ENHANCED QUERY: Allocation Percentage with Dynamic Filters
-- Entity Type: Resource (6 filters required)
-- Filters: Team, Team Alloc Mgr, Org, Project Type, Project Type Group, Portfolio

WITH params AS (
    SELECT
        DATE '${startDate}'                   AS start_date,             -- ← window start
        DATE '${endDate}'                   AS end_date,               -- ← window end
        '${bucket}'::text       AS bucket,        -- 'week' | 'month' | 'quarter'
        -- Resource/Team filters
    ${toSqlArray(teamFilter)}::text[]                 AS team_filter,
    ${toSqlArray(teamAllocMgrFilter)}::text[]         AS team_alloc_mgr_filter,
    ${toSqlArray(orgFilter)}::text[]                  AS org_filter,
        -- Project filters (to filter which allocations/projects are counted)
    ${toSqlArray(projectTypeFilter)}::text[]          AS project_type_filter,
    ${toSqlArray(projectTypeGroupFilter)}::text[]     AS project_type_group_filter,
    ${toSqlArray(portfolioFilter)}::uuid[]            AS portfolio_filter
),

/* ========= Filter CTEs ========== */
filtered_project_types AS (
    SELECT
        pt."Id"::text AS type_id  -- UUID to match project.Type
    FROM resource_projecttype pt
    JOIN resource_projecttypegroup ptg ON pt."Group"::uuid = ptg."Id"
    JOIN params p ON TRUE
    WHERE pt.__is_deleted__ = false
      AND (p.project_type_group_filter IS NULL OR ptg."Name" = ANY(p.project_type_group_filter))
      AND (p.project_type_filter IS NULL OR pt."Name" = ANY(p.project_type_filter))
),

filtered_projects AS (
    SELECT
        proj."Id" AS project_id
    FROM resource_project proj
    JOIN params p ON TRUE
    WHERE proj.__is_deleted__ = false
      AND (p.portfolio_filter IS NULL OR proj."PortfolioId" = ANY(p.portfolio_filter))
      AND (
          -- If project type filters are null, include all projects
          (p.project_type_filter IS NULL AND p.project_type_group_filter IS NULL)
          OR EXISTS (
              SELECT 1 
              FROM filtered_project_types fpt 
              WHERE fpt.type_id = proj."Type"  -- ⚠️ CRITICAL: Compare UUID to UUID
          )
      )
),

org_filtered_resources AS (
    SELECT DISTINCT
        orgr."Resource" AS resource_id
    FROM resource_organizationresource orgr
    JOIN params p ON TRUE
    WHERE p.org_filter IS NULL 
       OR orgr."Organization" = ANY(p.org_filter)
),

filtered_teams AS (
    SELECT
        t.__path__ AS team_id,
        t."Name" AS team_name
    FROM resource_team t
    JOIN params p ON TRUE
    WHERE (p.team_filter IS NULL OR t.__path__ = ANY(p.team_filter))
      AND (p.team_alloc_mgr_filter IS NULL OR t."AllocationManager" = ANY(p.team_alloc_mgr_filter))
),

team_filtered_resources AS (
    SELECT DISTINCT
        tr."Resource" AS resource_id
    FROM resource_teamresource tr
    WHERE EXISTS (
        SELECT 1 
        FROM filtered_teams ft 
        WHERE ft.team_id = tr."Team"
    )
),

/* ========= 2. CALENDAR BUCKETS ==================================== */
calendar AS (
    SELECT
        gs::date AS period_start,
        CASE p.bucket
             WHEN 'week'    THEN (gs + INTERVAL '6 days')::date
             WHEN 'month'   THEN (gs + INTERVAL '1 month'  - INTERVAL '1 day')::date
             WHEN 'quarter' THEN (gs + INTERVAL '3 months' - INTERVAL '1 day')::date
        END AS period_end
    FROM params p
    JOIN LATERAL generate_series(
            date_trunc(p.bucket, p.start_date),   -- anchor on bucket start
            date_trunc(p.bucket, p.end_date),
            CASE p.bucket
                 WHEN 'week'    THEN INTERVAL '1 week'
                 WHEN 'month'   THEN INTERVAL '1 month'
                 WHEN 'quarter' THEN INTERVAL '3 months'
            END
         ) AS gs ON TRUE
),

/* ========= 3. ACTIVE FTE RESOURCE MASTER ========================== */
fte_resources AS (
    SELECT
        __path__                        AS resource_id,
        to_date("StartDate",'YYYY-MM-DD') AS start_date,
        to_date("EndDate"  ,'YYYY-MM-DD') AS end_date
    FROM public.resource_resource
    WHERE "Type" <> 'Contractor - PT'       -- only full-timers
	and __is_deleted__ is false
      -- Apply organization filter
      AND EXISTS (
          SELECT 1 
          FROM org_filtered_resources ofr 
          WHERE ofr.resource_id = __path__
      )
      -- Apply team filter
      AND EXISTS (
          SELECT 1
          FROM team_filtered_resources tfr
          WHERE tfr.resource_id = __path__
      )
),

/* ========= 4. HEAD-COUNT PER BUCKET =============================== */
headcount AS (
    SELECT
        cal.period_start,
        COUNT(DISTINCT fr.resource_id) AS headcount
    FROM calendar cal
    JOIN fte_resources fr
      ON fr.start_date <= cal.period_end                 -- joined by bucket end
     AND (fr.end_date IS NULL OR fr.end_date >= cal.period_start)
    GROUP BY cal.period_start
),

/* ========= 5. ALLOCATED UNITS PER BUCKET ========================= */
alloc_units AS (
    SELECT
        date_trunc(p.bucket,a."Period")::date AS period_start,
        SUM(COALESCE(a."AllocationEntered",0))                       AS allocated_units
    FROM public.resource_allocation a
    JOIN params p  ON a."Period"
                     BETWEEN date_trunc(p.bucket, p.start_date)     -- ← fixed filter
                         AND p.end_date
    JOIN fte_resources fr ON fr.resource_id = a.__parent__
    -- Apply project filters (only if project filters are specified)
    WHERE (
        (p.project_type_filter IS NULL AND p.project_type_group_filter IS NULL AND p.portfolio_filter IS NULL)
        OR EXISTS (
            SELECT 1
            FROM filtered_projects fp
            WHERE fp.project_id = a."Project"::uuid
        )
    )
    GROUP BY date_trunc(p.bucket, a."Period")
)

/* ========= 6. FINAL PERCENT ALLOCATED ============================ */
SELECT
    cal.period_start::text,
    COALESCE(hc.headcount, 0)              AS headcount,
    COALESCE(au.allocated_units, 0)        AS allocated_units,
    ROUND(
        CASE
            WHEN COALESCE(hc.headcount,0) = 0
                 THEN 0
            ELSE (COALESCE(au.allocated_units,0)::numeric
                  / hc.headcount) * 100
        END
    , 2)                                   AS pct_allocated
FROM calendar  cal
LEFT JOIN headcount   hc ON hc.period_start = cal.period_start
LEFT JOIN alloc_units au ON au.period_start = cal.period_start
ORDER BY cal.period_start;`,
};

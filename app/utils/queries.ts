export const allowedQueries: Record<string, string> = {
  
  //002 - Fractional units breakdown of resources allocation by duration trend based on project types.
  projectFTE: `
    /* ========= 1. Parameter block (extended) ========== */
WITH params AS (
    SELECT
        DATE '2025-01-01'                   AS start_date,             -- ← window start
        DATE '2025-06-30'                   AS end_date,               -- ← window end
        'week'::text                      AS bucket,                 -- 'week' | 'month' | 'quarter'
        'Contractor - PT'                  AS excluded_resource_type,
        /* optional: list of project types to ignore                         */
        /* supply '{}' to include all                                        */
        ARRAY['Overhead', 'Internal']::text[] AS excluded_project_types
),

/* ========= 2. Calendar buckets (unchanged) ========== */
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

/* ========= 3. Raw allocations (weekly entries) ========== */
allocations AS (
    SELECT
        a.___parent__                        AS resource_id,
        a._project                           AS project_id,
        to_date(a._period, 'YYYY-MM-DD')     AS period_date,
        a._allocationentered                 AS alloc_fte
    FROM public.resourceallocation_core__allocation_0_0_1 a
    JOIN params p
      ON to_date(a._period, 'YYYY-MM-DD')
         BETWEEN p.start_date AND p.end_date
),

/* ========= 4. Eligible resources (non-contractor) ========== */
eligible_resources AS (
    SELECT
        r.___path__                          AS resource_id,
        to_date(r._startdate, 'YYYY-MM-DD')  AS start_date
    FROM public.resourceallocation_core__resource_0_0_1 r
    JOIN params p
      ON r._type <> p.excluded_resource_type
),

/* ========= 5. Project lookup (type) ========== */
project_lu AS (
    SELECT
        pr._id     AS project_id,
        pr._type   AS project_type
    FROM public.resourceallocation_core__project_0_0_1 pr
),

/* ========= 6. Allocation totals per bucket × project type ========== */
alloc_by_proj_period AS (
    SELECT
        pl.project_type,
        date_trunc(p.bucket, alloc.period_date)     AS period_start,
        SUM(alloc.alloc_fte)                        AS sum_alloc_fte
    FROM allocations alloc
    JOIN project_lu          pl ON pl.project_id = alloc.project_id
    JOIN params              p  ON TRUE
    JOIN eligible_resources  er ON er.resource_id = alloc.resource_id
    WHERE (
            pl.project_type IS NOT NULL
        AND (p.excluded_project_types = '{}'::text[]
             OR pl.project_type <> ALL (p.excluded_project_types))
    )
    GROUP BY pl.project_type, date_trunc(p.bucket, alloc.period_date)
)

/* ========= 7. Final — fractional (avg-weekly) FTE per bucket ========= */
SELECT
    abpp.project_type,
    cal.period_start,
    ROUND(
    (abpp.sum_alloc_fte            -- double precision
     / NULLIF(cal.weeks_in_bucket, 0)
    )::numeric                     -- ← single cast
 , 2) AS avg_weekly_fte
FROM calendar cal
LEFT JOIN alloc_by_proj_period abpp
       ON abpp.period_start = cal.period_start
ORDER BY abpp.project_type, cal.period_start;
  `,
  //003 - What is my capacity available by Teams vs the Capacity allocated by duration trend?
  capacityAvailability: `/* ========= 1. Parameter block ========== */
WITH params AS (
    SELECT
        DATE '2025-01-01'  AS start_date,            -- ← reporting window start
        DATE '2025-06-30'  AS end_date,              -- ← reporting window end
        'week'::text      AS bucket,                -- 'week' | 'month' | 'quarter'
        'Contractor - PT'    AS excluded_type
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

/* ========= 3. Raw allocations (weekly entries) ========== */
allocations AS (
    SELECT
        a.___parent__                        AS resource_id,
        to_date(a._period, 'YYYY-MM-DD')     AS period_date,
        a._allocationentered                 AS alloc_fte
    FROM resourceallocation_core__allocation_0_0_1 a
    JOIN params p
      ON to_date(a._period, 'YYYY-MM-DD')
         BETWEEN p.start_date AND p.end_date
),

/* ========= 4. Eligible resources (non-contractor, with start date) ========== */
eligible_resources AS (
    SELECT
        r.___path__                          AS resource_id,
        to_date(r._startdate, 'YYYY-MM-DD')  AS start_date
    FROM resourceallocation_core__resource_0_0_1 r
    JOIN params p ON r._type <> p.excluded_type
),

/* ========= 5. Resource → Team link (static) ========== */
team_map AS (
    SELECT
        tr._resource AS resource_id,
        tr._team     AS team_id
    FROM resourceallocation_core__teamresource_0_0_1 tr
),

/* ========= 6. Dynamic team capacity for each bucket ========== */
team_capacity AS (
    SELECT
        cal.period_start,
        cal.weeks_in_bucket,
        tm.team_id,
        COUNT(DISTINCT tm.resource_id)              AS headcount
    FROM calendar cal
    JOIN team_map tm           ON TRUE                    -- cross-join buckets
    JOIN eligible_resources er ON er.resource_id = tm.resource_id
                               AND er.start_date <= cal.period_end  -- already joined
    GROUP BY cal.period_start, cal.weeks_in_bucket, tm.team_id
),

/* ========= 7. Allocation totals per bucket ========== */
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

/* ========= 8. Capacity vs Allocation trend ========= */
SELECT
    t._name                                                AS team_name,
    cal.period_start,
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
JOIN resourceallocation_core__team_0_0_1 t
     ON t.___path__ = tc.team_id
ORDER BY t._name, cal.period_start;

`,
  //004/005 - Which teams are over-allocated and under-allocated? (2 separate reporting charts over a period of time)
  resourceUtilization: `/* ========= Thresholds you can tweak ========== */
WITH limits AS (
    SELECT
        100::numeric AS over_pct,
        80::numeric  AS under_pct
),
/* ========= 1. Parameter block ========== */
params AS (
    SELECT
        DATE '2025-01-01'  AS start_date,            -- ← reporting window start
        DATE '2025-06-30'  AS end_date,              -- ← reporting window end
        'week'::text      AS bucket,                -- 'week' | 'month' | 'quarter'
        'Contractor - PT'    AS excluded_type
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

/* ========= 3. Raw allocations (weekly entries) ========== */
allocations AS (
    SELECT
        a.___parent__                        AS resource_id,
        to_date(a._period, 'YYYY-MM-DD')     AS period_date,
        a._allocationentered                 AS alloc_fte
    FROM resourceallocation_core__allocation_0_0_1 a
    JOIN params p
      ON to_date(a._period, 'YYYY-MM-DD')
         BETWEEN p.start_date AND p.end_date
),

/* ========= 4. Eligible resources (non-contractor, with start date) ========== */
eligible_resources AS (
    SELECT
        r.___path__                          AS resource_id,
        to_date(r._startdate, 'YYYY-MM-DD')  AS start_date
    FROM resourceallocation_core__resource_0_0_1 r
    JOIN params p ON r._type <> p.excluded_type
),

/* ========= 5. Resource → Team link (static) ========== */
team_map AS (
    SELECT
        tr._resource AS resource_id,
        tr._team     AS team_id
    FROM resourceallocation_core__teamresource_0_0_1 tr
),

/* ========= 6. Dynamic team capacity for each bucket ========== */
team_capacity AS (
    SELECT
        cal.period_start,
        cal.weeks_in_bucket,
        tm.team_id,
        COUNT(DISTINCT tm.resource_id)              AS headcount
    FROM calendar cal
    JOIN team_map tm           ON TRUE                    -- cross-join buckets
    JOIN eligible_resources er ON er.resource_id = tm.resource_id
                               AND er.start_date <= cal.period_end  -- already joined
    GROUP BY cal.period_start, cal.weeks_in_bucket, tm.team_id
),

/* ========= 7. Allocation totals per bucket ========== */
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
        t._name                                                AS team_name,
        cal.period_start,
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
    JOIN resourceallocation_core__team_0_0_1 t
         ON t.___path__ = tc.team_id
)

/* ========= 9  Classify each row ========== */
SELECT
    b.*,
    CASE
        WHEN b.utilization_pct >  l.over_pct  THEN 'over-allocated'
        WHEN b.utilization_pct <  l.under_pct THEN 'under-allocated'
        ELSE                                      'balanced'
    END AS allocation_status
FROM baseline b
CROSS JOIN limits l;          -- gives you access to the thresholds
`,
  //006 -Projects budget vs Planned vs Actuals to date
budgetVsPlanVsActual: `/* ======== 1.  Parameters you can tweak ============================= */
WITH params AS (
    SELECT
        DATE '2025-01-01'  AS start_date,     -- ← reporting window
        DATE '2025-05-28'  AS end_date
),

/* ======== 2.  Allocation-cost rows inside the window =============== */
alloc_cost AS (
    SELECT
        ac._project ::uuid                       AS project_id,
        ac._costcurrency                         AS currency,
        COALESCE(ac._plannedcost , 0)            AS planned_cost,
        COALESCE(ac._actualscost, 0)             AS actual_cost
    FROM public.resourceallocation_core__allocationcost_0_0_1 ac
    JOIN params p
      ON to_date(ac._period, 'YYYY-MM-DD')
         BETWEEN p.start_date AND p.end_date
	where ac._agentlang__is_deleted is false
),

/* ======== 3.  Sum plan / actual to-date per project ================ */
cost_by_project AS (
    SELECT
        project_id,
        currency,
        SUM(planned_cost)  AS planned_to_date,
        SUM(actual_cost)   AS actual_to_date
    FROM alloc_cost
    GROUP BY project_id, currency
),

/* ======== 4.  Project master with budget =========================== */
project_budget AS (
    SELECT
        pr._id          AS project_id,
        pr._name        AS project_name,
        pr._budget      AS budget,     -- assumed same currency as allocation rows
		pr._budgetcurrency AS currency
    FROM public.resourceallocation_core__project_0_0_1 pr
	where _agentlang__is_deleted is false
)

/* ======== 5.  Final report ========================================= */
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
where cbp.planned_to_date is not null;
`,
  //(007) Teams whose Actuals are most deviating from the Planned by duration trend?
  resourceActualsDeviation: `/* ========= 1. Parameters ========================================== */
WITH params AS (
    SELECT
        DATE '2025-05-26' AS start_date,
        DATE '2025-06-01' AS end_date,
        'week'::text      AS bucket,      -- 'week' | 'month' | 'quarter'
        ''                AS excluded_resource_type
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
            date_trunc(p.bucket, p.start_date),
            date_trunc(p.bucket, p.end_date),
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
        a.___parent__                    AS resource_id,
        to_date(a._period, 'YYYY-MM-DD') AS period_date,
        COALESCE(a._allocationentered, 0) AS plan_fte,
        COALESCE(a._actualsentered, 0)    AS actual_fte
    FROM public.resourceallocation_core__allocation_0_0_1 a
    JOIN params p
      ON to_date(a._period, 'YYYY-MM-DD')
         BETWEEN p.start_date AND p.end_date
),

/* ========= 4. Eligible resources ================================== */
eligible_resources AS (
    SELECT
        r.___path__                        AS resource_id,
        to_date(r._startdate, 'YYYY-MM-DD') AS start_date
    FROM public.resourceallocation_core__resource_0_0_1 r
    JOIN params p
      ON r._type <> p.excluded_resource_type
     AND to_date(r._startdate, 'YYYY-MM-DD') <= p.end_date
),

/* ========= 5. Company-wide plan / delta per bucket ================ */
company_dev AS (
    SELECT
        date_trunc(p.bucket, a.period_date)           AS period_start,
        SUM(a.plan_fte)                               AS planned_fte,
        SUM(GREATEST(a.plan_fte - a.actual_fte, 0))   AS delta_fte
    FROM alloc a
    JOIN params p                ON TRUE
    JOIN eligible_resources er   ON er.resource_id = a.resource_id
    GROUP BY date_trunc(p.bucket, a.period_date)
)

/* ========= 6. Final overall metrics =============================== */
SELECT
    cal.period_start,

    /* deviation = % of planned hours that did NOT occur */
    ROUND(
        (cd.delta_fte / NULLIF(cd.planned_fte, 0))::numeric * 100
    , 2)  AS deviation_pct,

    /* in-plan = 100 − deviation */
    ROUND(
        (100::numeric - (cd.delta_fte / NULLIF(cd.planned_fte, 0))::numeric * 100)
    , 2)  AS in_plan_pct
FROM calendar  cal
JOIN company_dev cd
  ON cd.period_start = cal.period_start
ORDER BY cal.period_start;
`,

  //(008) How much units is being allocated on unapproved projects by team?
  unapprovedProjectAllocation: `/* ========= 1.  Parameters  ========================================= */
WITH params AS (
    SELECT
        DATE '2025-01-01'              AS start_date,      -- reporting window
        DATE '2025-06-30'              AS end_date,
        'month'::text                 AS bucket,          -- 'week' | 'month' | 'quarter'
        'Contractor - PT'             AS excluded_resource_type
),

/* ========= 2.  Time buckets (only if you want a trend) ============= */
calendar AS (
    SELECT
        gs                                   AS period_start,
        CASE p.bucket
             WHEN 'week'    THEN gs + INTERVAL '1 week'   - INTERVAL '1 day'
             WHEN 'month'   THEN gs + INTERVAL '1 month'  - INTERVAL '1 day'
             WHEN 'quarter' THEN gs + INTERVAL '3 months' - INTERVAL '1 day'
        END                                  AS period_end
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

/* ========= 3.  Grab the two "unapproved" project IDs =============== */
unapproved_projects AS (
    SELECT _id
    FROM public.resourceallocation_core__project_0_0_1
    WHERE _name IN ('Other Work', 'Personal Time')
),

/* ========= 4.  Raw allocation rows for those projects ============== */
alloc_up AS (
    SELECT
        a.___parent__                    AS resource_id,
        to_date(a._period, 'YYYY-MM-DD') AS period_date,
        a._allocationentered             AS alloc_fte
    FROM public.resourceallocation_core__allocation_0_0_1 a
    JOIN unapproved_projects up ON up._id = a._project
    JOIN params p
      ON to_date(a._period, 'YYYY-MM-DD')
         BETWEEN p.start_date AND p.end_date
),

/* ========= 5.  Keep only eligible resources  ======================= */
eligible_resources AS (
    SELECT ___path__ AS resource_id
    FROM public.resourceallocation_core__resource_0_0_1 r
    JOIN params p ON r._type <> p.excluded_resource_type
),

/* ========= 6.  Resource → Team link  =============================== */
team_map AS (
    SELECT _resource AS resource_id, _team AS team_id
    FROM public.resourceallocation_core__teamresource_0_0_1
),

/* ========= 7.  Sum unapproved allocations by team & bucket ========= */
unapproved_by_team AS (
    SELECT
        tm.team_id,
        date_trunc(p.bucket, au.period_date) AS period_start,
        SUM(au.alloc_fte)                    AS unapproved_fte
    FROM alloc_up              au
    JOIN team_map              tm ON tm.resource_id = au.resource_id
    JOIN params                p  ON TRUE
    JOIN eligible_resources    er ON er.resource_id = au.resource_id
    GROUP BY tm.team_id, date_trunc(p.bucket, au.period_date)
)

/* ========= 8.  Final output ======================================== */
SELECT
    t._name                 AS team_name,
    ut.period_start,
    ut.unapproved_fte       AS units_unapproved
FROM unapproved_by_team ut
JOIN public.resourceallocation_core__team_0_0_1 t
     ON t.___path__ = ut.team_id
ORDER BY ut.unapproved_fte DESC, t._name, ut.period_start;
`,

  //(009)Ratio of employees (FTE) to contractors stacked by onshore and offshore resources
  resourceFTEContractorRatio: `SELECT
    _locationcategory                  AS shore_flag,
    COUNT(DISTINCT ___path__) FILTER (WHERE _type = 'FTE')   AS fte_cnt,
    COUNT(DISTINCT ___path__) FILTER (WHERE _type <> 'FTE')  AS contractor_cnt
FROM public.resourceallocation_core__resource_0_0_1
where _agentlang__is_deleted is false
and _status = 'Active'
GROUP BY shore_flag
`,
  //(010) Total active projects breakdown by project type
  activeProjectsByType: `select _type,count(*) from public.resourceallocation_core__project_0_0_1
where _status = 'Active'
group by _type`,

  //(011) Total headcount breakdown by FTE vs contractors
  totalHeadcount: `select _type,count(*) from public.resourceallocation_core__resource_0_0_1
where _status = 'Active'
and _agentlang__is_deleted is false
group by _type`,

//001 - Percentage of coverage of resource allocation by teams by duration trend (duration trend is always weeks/months/quarters). Exclude PT contractor allocation
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
  `,
};

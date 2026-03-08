import { getWeekNumber as getWeekNumberFromCommon } from './common';
import { format} from 'date-fns';
import { parseISO } from 'date-fns/parseISO';

/**
 * Parse week key (W52-2026) to extract week number and year
 */
const parseWeekKey = (weekKey: string): { week: number; year: number } | null => {
  if (!weekKey || typeof weekKey !== 'string') return null;
  const match = weekKey.match(/^W(\d+)-(\d{4})$/);
  if (!match) return null;
  return {
    week: Number(match[1]),
    year: Number(match[2]),
  };
};

/**
 * Calculate ISO week number from date string
 * Returns canonical week key like "W4-2026"
 */
export const getWeekKey = (dateString: string): string | null => {
  if (!dateString) return null;
  try {
    const date = parseISO(dateString);
    return getWeekNumberFromCommon(date);
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
    return null;
  }
};

/**
 * Format date to display format (e.g., "Jan 5")
 */
export const formatWeekDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d');
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return dateString;
  }
};

/**
 * Transform API response to table format with dynamic week columns
 */
export interface ProjectSummaryTableRow {
  id: string;
  project_id: string;
  project_name: string;
  project_manager: string;
  project_category: string;
  portfolio: string;
  project_sponsor: string;
  [key: string]: any; // Dynamic week columns like "W4-2026"
}

export interface WeekColumn {
  field: string;       // e.g., "W4-2026"
  headerName: string;  // e.g., "W4"
  weekNumber: number;  // e.g., 4
  year: number;        // e.g., 2026
  date: string;        // formatted StartDate, e.g., "Jan 19"
  dateTo: string;      // formatted EndDate, e.g., "Jan 25"
  period: string;      // ISO StartDate
}

export interface ProjectPeriodCellData {
  score: number | null;
  alignmentScore: number | null;
  healthScore: number | null;
  scoreBand: string | null;
  summary: string | null;
  summaryHtml: string | null;
  period: string;
  aiSummary: boolean;  // Whether this period has an AI summary (clickable)
  periodId: string;    // UUID of the Projectperiod record for the detail API
}

/**
 * Format the API response for display in the summary table
 */
export const formatAISummaryResponse = (apiResponse: any[]): {
  rows: ProjectSummaryTableRow[];
  weekColumns: WeekColumn[];
} => {
 
  if (!apiResponse || apiResponse.length === 0) {
    return { rows: [], weekColumns: [] };
  }

  // Collect all unique periods keyed by "W4-2026" (Week-Year)
  // Use a Map to deduplicate; prefer the first occurrence of each unique week+year
  const allPeriodsMap = new Map<string, {
    week: string;
    year: number;
    startDate: string;
    endDate: string;
    period: string;
  }>();

  apiResponse.forEach((item: any) => {
    if (item.Projectperiod && Array.isArray(item.Projectperiod)) {
      item.Projectperiod.forEach((pp: any) => {
        // Prefer direct Week/Year fields; fall back to computing from Period date
        let fieldKey: string | null = null;
        let weekLabel: string;
        let year: number;

        if (pp.Week && pp.Year) {
          fieldKey = `${pp.Week}-${pp.Year}`;
          weekLabel = pp.Week;
          year = pp.Year;
        } else if (pp.Period) {
          const wk = getWeekKey(pp.Period);
          if (wk) {
            fieldKey = wk;
            const parsed = parseWeekKey(wk);
            weekLabel = parsed ? `W${parsed.week}` : wk;
            year = parsed?.year ?? new Date().getFullYear();
          }
        }

        if (fieldKey && !allPeriodsMap.has(fieldKey)) {
          allPeriodsMap.set(fieldKey, {
            week: weekLabel!,
            year: year!,
            startDate: pp.StartDate || pp.Period || '',
            endDate: pp.EndDate || pp.Period || '',
            period: pp.Period || pp.StartDate || '',
          });
        }
      });
    }
  });

  // Sort by StartDate descending (most recent first)
  const sortedPeriods = Array.from(allPeriodsMap.entries()).sort(([, a], [, b]) => {
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  // Generate week columns
  const weekColumns: WeekColumn[] = sortedPeriods.map(([fieldKey, data]) => {
    const weekNum = parseInt(data.week.replace('W', ''), 10);
    return {
      field: fieldKey,
      headerName: data.week,        // "W4" directly from API
      weekNumber: isNaN(weekNum) ? 0 : weekNum,
      year: data.year,
      date: formatWeekDate(data.startDate),
      dateTo: formatWeekDate(data.endDate),
      period: data.startDate,
    };
  });

  // Transform each project to a table row
  const rows: ProjectSummaryTableRow[] = apiResponse.map((item: any, index: number) => {
    
    const row: ProjectSummaryTableRow = {
      id: item.Project?.Id || `project_${index}`,
      project_id: item.Project?.Id || '',
      project_name: item.Project?.Name || '',
      project_manager: item.ProjectManager?.FirstName 
        ? `${item.ProjectManager.FirstName} ${item.ProjectManager.LastName || ''}`.trim()
        : '',
      project_category: item.ProjectTypeGroup?.Name || '',
      portfolio: item.Portfolio?.Name || '',
      project_sponsor: item.ProjectSponsor || '',
    };

    // Map each Projectperiod entry to the correct week column cell
    if (item.Projectperiod && Array.isArray(item.Projectperiod)) {
      item.Projectperiod.forEach((pp: any) => {
        let fieldKey: string | null = null;

        if (pp.Week && pp.Year) {
          fieldKey = `${pp.Week}-${pp.Year}`;
        } else if (pp.Period) {
          fieldKey = getWeekKey(pp.Period);
        }

        if (fieldKey) {
          const cellData: ProjectPeriodCellData = {
            score: pp.ProjectScore ?? null,
            alignmentScore: pp.AlignmentScore ?? null,
            healthScore: pp.ProjectHealthScore ?? null,
            scoreBand: pp.ProjectScoreBand ?? null,
            summary: pp.Summary ?? null,
            summaryHtml: pp.SummaryHtml ?? null,
            period: pp.Period || pp.StartDate || '',
            aiSummary: pp.AISummary === true,
            periodId: pp.Id || '',
          };
          row[fieldKey] = cellData;
        }
      });
    }

    return row;
  });
  
  return { rows, weekColumns };
};

/**
 * Get color for score value
 */
export const getScoreColor = (score: number | null): string => {
  if (score === null) return '#9CA3AF';
  if (score >= 90) return '#2E7D32';  // Dark Green
  if (score >= 75) return '#558B2F'; // Green
  if (score >= 60) return '#F9A825'; // Orange
  if (score >= 40) return '#EF6C00';
  if (score >= 20) return '#E53935';
  return '#C62828'; // Red
};

/**
 * Get background color for score band
 */
export const getScoreBandColor = (band: string | null): { bg: string; text: string } => {
  switch (band?.toLowerCase()) {
    case 'high':
      return { bg: '#D4EDDA', text: '#155724' };
    case 'medium':
      return { bg: '#FFF3CD', text: '#856404' };
    case 'low':
      return { bg: '#F8D7DA', text: '#721C24' };
    default:
      return { bg: '#E5E7EB', text: '#6B7280' };
  }
};

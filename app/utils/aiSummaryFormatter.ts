import { getWeekNumber as getWeekNumberFromCommon, parseWeekKeyToMonday, isWeekKey } from './common';
import { format } from 'date-fns';

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
    const date = new Date(dateString);
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
    const date = new Date(dateString);
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
  [key: string]: any; // Dynamic week columns like week_52, week_51, etc.
}

export interface WeekColumn {
  field: string;
  headerName: string;
  weekNumber: number;
  date: string;
  period: string;
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

  // Extract all unique periods across all projects and sort them
  const allPeriodsSet = new Set<string>();
  apiResponse.forEach((item: any, index: number) => {
    
    if (item.Projectperiod && Array.isArray(item.Projectperiod)) {
      item.Projectperiod.forEach((pp: any, ppIndex: number) => {
        if (pp.Period) {
          allPeriodsSet.add(pp.Period);
        }
      });
    } else {
      console.warn(`Item ${index} does not have Projectperiod array`);
    }
  });

  const sortedPeriods = Array.from(allPeriodsSet).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB.getTime() - dateA.getTime(); // Most recent first
  });

  // Generate week columns from sorted periods
  const weekColumns: WeekColumn[] = sortedPeriods.map((period) => {
    const weekKey = getWeekKey(period);
    if (!weekKey) return null;
    
    const parsed = parseWeekKey(weekKey);
    if (!parsed) return null;
    
    const displayDate = formatWeekDate(period);
    
    return {
      field: weekKey, // Use canonical week key like "W4-2026"
      headerName: `Week ${parsed.week}`,
      weekNumber: parsed.week,
      date: displayDate,
      period: period,
    };
  }).filter((col): col is WeekColumn => col !== null);

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

    // Map period data to week columns
    if (item.Projectperiod && Array.isArray(item.Projectperiod)) {
      item.Projectperiod.forEach((pp: any, ppIdx: number) => {
        if (pp.Period) {
          const weekKey = getWeekKey(pp.Period);
          if (!weekKey) {
            console.warn(`Invalid period date: ${pp.Period}`);
            return;
          }
                    
          row[weekKey] = {
            score: pp.ProjectScore,
            alignmentScore: pp.AlignmentScore,
            healthScore: pp.ProjectHealthScore,
            scoreBand: pp.ProjectScoreBand,
            summary: pp.Summary,
            summaryHtml: pp.SummaryHtml,
            period: pp.Period,
          };
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

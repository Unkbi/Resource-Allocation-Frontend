'use client';

/**
 * Demo Page - Custom Chart Tooltip Examples
 * 
 * This page demonstrates various ways to use the CustomChartTooltip component
 * with different chart types and configurations.
 */

import React, { useState } from 'react';
import { Box, Typography, Paper, Divider, Chip } from '@mui/material';
import { BarChart, PieChart, LineChart } from '@mui/x-charts';
import CustomChartTooltip from '../../components/Dashboard/CustomChartTooltip';

// Sample data
const teamCoverageData = [
  { team_name: 'Engineering', coverage_pct: 85, team_id: 1 },
  { team_name: 'Design', coverage_pct: 72, team_id: 2 },
  { team_name: 'Marketing', coverage_pct: 91, team_id: 3 },
  { team_name: 'Sales', coverage_pct: 68, team_id: 4 },
  { team_name: 'Support', coverage_pct: 95, team_id: 5 },
];

const projectTypeData = [
  { type: 'Transform', count: 12 },
  { type: 'Grow', count: 8 },
  { type: 'Run', count: 15 },
];

const monthlyTrendData = {
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  planned: [45, 52, 48, 61, 58, 65],
  actual: [42, 48, 51, 58, 62, 63],
};

const DemoSection = ({ title, description, children }) => (
  <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
    <Typography variant="h5" gutterBottom fontWeight={600}>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      {description}
    </Typography>
    <Box sx={{ minHeight: 400 }}>
      {children}
    </Box>
  </Paper>
);

export default function CustomTooltipDemoPage() {
  const [clickInfo, setClickInfo] = useState('Click on any chart element to see click event data here');

  const handleClick = (event, params) => {
    setClickInfo(JSON.stringify(params, null, 2));
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight={700}>
          Custom Chart Tooltip Demo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Hover over any chart element to see the custom tooltip with clickable links.
          The links open in a new tab with relevant data.
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Click Event Info Display */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          mb: 4, 
          backgroundColor: '#f5f5f5',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        <Chip label="Click Event Data" color="primary" size="small" sx={{ mb: 1 }} />
        <Typography variant="body2" component="pre">
          {clickInfo}
        </Typography>
      </Paper>

      {/* Example 1: Bar Chart with Item Tooltip */}
      <DemoSection
        title="1. Bar Chart - Item Tooltip with Links"
        description="Hover over any bar to see a tooltip with the team coverage percentage. Click the 'View Details' link to navigate to that team's page."
      >
        <BarChart
          width={800}
          height={350}
          series={[
            {
              data: teamCoverageData.map(d => d.coverage_pct),
              label: 'Coverage %',
              id: 'coverage',
              color: '#4169E1',
              valueFormatter: (value) => `${value}%`,
            },
          ]}
          xAxis={[
            {
              data: teamCoverageData.map(d => d.team_name),
              scaleType: 'band',
              label: 'Team',
            },
          ]}
          yAxis={[
            {
              label: 'Coverage Percentage',
              min: 0,
              max: 100,
            },
          ]}
          onItemClick={handleClick}
          slots={{
            tooltip: CustomChartTooltip,
          }}
          slotProps={{
            tooltip: {
              trigger: 'item',
              linkGenerator: (tooltipData) => {
                const dataIndex = tooltipData?.identifier?.dataIndex;
                if (dataIndex !== undefined && teamCoverageData[dataIndex]) {
                  const team = teamCoverageData[dataIndex];
                  return `/people?team=${encodeURIComponent(team.team_name)}&id=${team.team_id}`;
                }
                return null;
              },
            },
          }}
          grid={{ horizontal: true }}
          margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
        />
      </DemoSection>

      {/* Example 2: Bar Chart with Axis Tooltip */}
      <DemoSection
        title="2. Line Chart - Axis Tooltip with Multiple Series"
        description="Hover anywhere on the chart to see data for both planned and actual values at that month. The link will take you to a detailed report for that month."
      >
        <LineChart
          width={800}
          height={350}
          series={[
            {
              data: monthlyTrendData.planned,
              label: 'Planned',
              id: 'planned',
              color: '#FFD700',
              valueFormatter: (value) => `${value} FTE`,
            },
            {
              data: monthlyTrendData.actual,
              label: 'Actual',
              id: 'actual',
              color: '#FF884D',
              valueFormatter: (value) => `${value} FTE`,
            },
          ]}
          xAxis={[
            {
              data: monthlyTrendData.months,
              scaleType: 'band',
              label: 'Month',
            },
          ]}
          yAxis={[
            {
              label: 'FTE Count',
              min: 0,
            },
          ]}
          onAxisClick={handleClick}
          slots={{
            tooltip: CustomChartTooltip,
          }}
          slotProps={{
            tooltip: {
              trigger: 'axis',
              linkGenerator: (tooltipData) => {
                const { axisValue } = tooltipData;
                if (axisValue) {
                  return `/report?month=${encodeURIComponent(axisValue)}&year=2024`;
                }
                return null;
              },
            },
          }}
          grid={{ horizontal: true }}
          margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
        />
      </DemoSection>

      {/* Example 3: Pie Chart */}
      <DemoSection
        title="3. Pie Chart - Item Tooltip"
        description="Hover over any pie slice to see the project count. Click the link to see all projects of that type."
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <PieChart
            series={[
              {
                data: projectTypeData.map((item, index) => ({
                  id: index,
                  value: item.count,
                  label: item.type,
                })),
                highlightScope: { faded: 'global', highlighted: 'item' },
                valueFormatter: (value) => `${value.value} projects`,
              },
            ]}
            width={500}
            height={350}
            onItemClick={handleClick}
            slots={{
              tooltip: CustomChartTooltip,
            }}
            slotProps={{
              tooltip: {
                trigger: 'item',
                linkGenerator: (tooltipData) => {
                  const dataIndex = tooltipData?.identifier?.dataIndex;
                  if (dataIndex !== undefined && projectTypeData[dataIndex]) {
                    const projectType = projectTypeData[dataIndex].type;
                    return `/project?type=${encodeURIComponent(projectType)}`;
                  }
                  return null;
                },
              },
            }}
            margin={{ right: 200 }}
          />
        </Box>
      </DemoSection>

      {/* Example 4: Conditional Links */}
      <DemoSection
        title="4. Conditional Links Based on Data"
        description="Hover over teams with coverage < 80% to see an 'alerts' link, or >= 80% to see a 'dashboard' link. This shows how to conditionally generate different links."
      >
        <BarChart
          width={800}
          height={350}
          series={[
            {
              data: teamCoverageData.map(d => d.coverage_pct),
              label: 'Coverage %',
              id: 'coverage',
              color: '#00C9A7',
              valueFormatter: (value) => `${value}%`,
            },
          ]}
          xAxis={[
            {
              data: teamCoverageData.map(d => d.team_name),
              scaleType: 'band',
              label: 'Team',
            },
          ]}
          yAxis={[
            {
              label: 'Coverage Percentage',
              min: 0,
              max: 100,
            },
          ]}
          onItemClick={handleClick}
          slots={{
            tooltip: CustomChartTooltip,
          }}
          slotProps={{
            tooltip: {
              trigger: 'item',
              linkGenerator: (tooltipData) => {
                const dataIndex = tooltipData?.identifier?.dataIndex;
                if (dataIndex !== undefined && teamCoverageData[dataIndex]) {
                  const team = teamCoverageData[dataIndex];
                  
                  // Conditional link based on coverage
                  if (team.coverage_pct < 80) {
                    return `/teams/${team.team_id}/alerts?coverage=${team.coverage_pct}`;
                  } else {
                    return `/teams/${team.team_id}/dashboard`;
                  }
                }
                return null;
              },
            },
          }}
          grid={{ horizontal: true }}
          margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
        />
      </DemoSection>

      {/* Example 5: No Links */}
      <DemoSection
        title="5. Custom Tooltip Without Links"
        description="This example shows the custom tooltip styling without any links. Just omit the linkGenerator prop."
      >
        <BarChart
          width={800}
          height={350}
          series={[
            {
              data: projectTypeData.map(d => d.count),
              label: 'Project Count',
              id: 'projects',
              color: '#9C27B0',
              valueFormatter: (value) => `${value} projects`,
            },
          ]}
          xAxis={[
            {
              data: projectTypeData.map(d => d.type),
              scaleType: 'band',
              label: 'Project Type',
            },
          ]}
          yAxis={[
            {
              label: 'Count',
              min: 0,
            },
          ]}
          slots={{
            tooltip: CustomChartTooltip,
          }}
          slotProps={{
            tooltip: {
              trigger: 'item',
              // No linkGenerator = no link shown
            },
          }}
          grid={{ horizontal: true }}
          margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
        />
      </DemoSection>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ p: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Implementation Notes
        </Typography>
        <Typography variant="body2" component="div" sx={{ '& ul': { mt: 1 } }}>
          <ul>
            <li>The tooltip appears on hover over chart elements</li>
            <li>Links open in a new tab with <code>target="_blank"</code></li>
            <li>Use <code>trigger="item"</code> for individual elements or <code>trigger="axis"</code> for axis-based tooltips</li>
            <li>The <code>linkGenerator</code> function receives tooltip data and returns a URL or null</li>
            <li>Use <code>dataIndex</code> to access your chart data array</li>
            <li>Click events (<code>onItemClick</code>, <code>onAxisClick</code>) work independently from tooltips</li>
          </ul>
        </Typography>
      </Box>
    </Box>
  );
}

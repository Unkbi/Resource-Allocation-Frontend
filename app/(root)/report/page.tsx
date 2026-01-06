import ReportBuilderPage from "@/app/components/Dashboard/ReportBuilder/ReportBuilderPage"
import { Box } from "@mui/material"
import { Suspense } from "react"

export default function Report() {
    return (
        <Box
            sx={{
                height: 'calc(100vh - 32px)',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Suspense fallback={<div>Loading...</div>}>
                <ReportBuilderPage />
            </Suspense>
        </Box>
    )
}
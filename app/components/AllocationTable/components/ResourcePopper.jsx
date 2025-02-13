import { useState } from "react"
import { Box, TextField, Popper, List, ListItem, ListItemText } from "@mui/material"

const allResources = [
  { name: "John Doe", projects: ["Project A"], totalHours: 30 },
  { name: "Jane Smith", projects: ["Project B"], totalHours: 25 },
  { name: "Alice Johnson", projects: ["Project C"], totalHours: 35 },
]

export default function ResourcePopper({ anchorEl, onClose, onAddResource }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredResources = allResources.filter((resource) =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} placement="bottom-start">
      <Box sx={{ p: 1, bgcolor: "background.paper", minWidth: 200 }}>
        <TextField
          fullWidth
          placeholder="Search Resource"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ border: 0 }}
        />
        <List>
          {filteredResources.map((resource, index) => (
            <ListItem key={index} button onClick={() => onAddResource(resource)}>
              <ListItemText primary={resource.name} secondary={resource.projects.join(", ")} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Popper>
  )
}


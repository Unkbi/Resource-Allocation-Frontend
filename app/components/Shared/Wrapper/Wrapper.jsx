import { Box, Container } from '@mui/material'
import React from 'react'

const Wrapper = ({children}) => {
  return (
    <Container sx={{marginLeft:"250px", width: "calc(100vw - 250px)"}} >
        {children}
    </Container>
  )
}

export default Wrapper
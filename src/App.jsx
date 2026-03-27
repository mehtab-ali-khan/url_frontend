import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import Home from './home'

function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      <Home />
    </ChakraProvider>
  )
}

export default App

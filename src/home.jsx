import { useEffect, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Input,
  Separator,
  Text,
  VStack,
} from '@chakra-ui/react'

const API = import.meta.env.VITE_API_URL;

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [urls, setUrls] = useState([])
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchUrls()
  }, [])

  const showToast = (type, message) => {
    setToast({ type, message })
    window.clearTimeout(showToast.timeoutId)
    showToast.timeoutId = window.setTimeout(() => setToast(null), 3000)
  }

  const fetchUrls = async () => {
    try {
      const response = await fetch(`${API}/api/urls`)
      if (!response.ok) {
        throw new Error('Failed to load URLs.')
      }

      const data = await response.json()
      setUrls(Array.isArray(data) ? data : [])
    } catch {
      showToast('error', 'Failed to load URLs.')
    }
  }

  const handleAdd = async () => {
    if (!url.trim()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API}/api/urls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const message = errorData?.url?.[0] || 'Failed to save URL.'
        throw new Error(message)
      }

      setUrl('')
      showToast('success', 'URL added successfully.')
      await fetchUrls()
    } catch (error) {
      showToast('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const timeAgo = (value) => {
    const seconds = Math.floor((Date.now() - new Date(value)) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`

    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <Box bg="#f4f6f8" minH="100vh" color="#111827" py={{ base: 10, md: 16 }} px={4}>
      <Container maxW="760px">
        <VStack spacing={4} mb={10} textAlign="center">
          <Badge
            bg="white"
            color="#4b5563"
            border="1px solid #d6dde6"
            borderRadius="full"
            px={4}
            py={1}
            fontSize="10px"
            letterSpacing="0.08em"
          >
            URL Checker
          </Badge>
          <Heading
            fontWeight={700}
            letterSpacing="-0.03em"
            lineHeight={1.1}
            fontSize={{ base: '30px', md: '48px' }}
            color="#111827"
          >
            Check your website URLs
            <br />
            in one simple place.
          </Heading>
          <Text color="#6b7280" fontSize="15px" maxW="560px">
            A clean and minimal screen for storing links in your database
            extra clutter.
          </Text>
        </VStack>

        <Box
          bg="white"
          border="1px solid #e5e7eb"
          borderRadius="22px"
          p={{ base: 5, md: 7 }}
          boxShadow="0 16px 40px rgba(15, 23, 42, 0.05)"
        >
          <VStack spacing={4} align="stretch">
            <Text
              fontSize="11px"
              fontFamily="mono"
              color="#6b7280"
              textTransform="uppercase"
              letterSpacing="0.1em"
            >
              Add Website URL
            </Text>

            <HStack align="stretch" flexDir={{ base: 'column', md: 'row' }}>
              <Input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com"
                size="lg"
                bg="white"
                border="1px solid #d1d5db"
                color="#111827"
                _placeholder={{ color: '#9ca3af' }}
                _hover={{ borderColor: '#9ca3af' }}
                _focusVisible={{
                  borderColor: '#64748b',
                  boxShadow: '0 0 0 1px #64748b',
                }}
              />
              <Button
                onClick={handleAdd}
                isLoading={loading}
                px={6}
                bg="#111827"
                color="white"
                _hover={{ bg: '#1f2937' }}
                _active={{ bg: '#0f172a' }}
              >
                Add URL
              </Button>
            </HStack>

            {toast ? (
              <Box
                px={3}
                py={2}
                borderRadius="12px"
                fontSize="13px"
                bg={toast.type === 'success' ? '#ecfdf3' : '#fef2f2'}
                border={`1px solid ${toast.type === 'success' ? '#bbf7d0' : '#fecaca'
                  }`}
                color={toast.type === 'success' ? '#166534' : '#b91c1c'}
              >
                {toast.message}
              </Box>
            ) : null}
          </VStack>
        </Box>

        <Box mt={8}>
          <HStack justify="space-between" mb={4}>
            <Text
              fontSize="11px"
              fontFamily="mono"
              color="#6b7280"
              textTransform="uppercase"
              letterSpacing="0.1em"
            >
              Saved URLs
            </Text>
            <Badge
              bg="white"
              color="#475569"
              border="1px solid #dbe3ec"
              borderRadius="full"
              px={3}
              fontSize="11px"
              fontFamily="mono"
            >
              {urls.length} url{urls.length !== 1 ? 's' : ''}
            </Badge>
          </HStack>

          <VStack spacing={3}>
            {urls.length === 0 ? (
              <Box
                w="full"
                textAlign="center"
                py={6}
                bg="white"
                border="1px dashed #d1d5db"
                borderRadius="18px"
                color="#6b7280"
                fontSize="13px"
              >
                No URLs yet. Add one above.
              </Box>
            ) : (
              urls.map((savedUrl) => (
                <Box
                  key={savedUrl.id}
                  w="full"
                  bg="white"
                  border="1px solid #e5e7eb"
                  borderRadius="18px"
                  p={4}
                  boxShadow="0 10px 24px rgba(15, 23, 42, 0.04)"
                >
                  <VStack align="stretch" spacing={3}>
                    <Text
                      fontSize="15px"
                      fontWeight="600"
                      color="#111827"
                      wordBreak="break-all"
                    >
                      {savedUrl.url}
                    </Text>
                    <Separator borderColor="#edf2f7" />
                    <Text fontSize="12px" color="#6b7280">
                      Added {timeAgo(savedUrl.created_at)}
                    </Text>
                  </VStack>
                </Box>
              ))
            )}
          </VStack>
        </Box>
      </Container>
    </Box>
  )
}

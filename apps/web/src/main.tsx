import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getErrorMessage } from '@/lib/api'
import { showToast } from '@/lib/toastBus'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
  // Mutations already toast their own specific, contextual error messages at
  // each call site — this only covers query (GET) failures, which previously
  // surfaced as a silent inline banner with no notification.
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.silent) return
      showToast(getErrorMessage(error, 'Something went wrong — check your connection and try again'), 'error')
    },
  }),
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)

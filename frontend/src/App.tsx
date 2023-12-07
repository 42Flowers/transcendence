import { QueryClient, QueryClientProvider } from 'react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthConsumer, AuthProvider } from './contexts/AuthContext';
import { router } from './router';
import { AvatarProvider } from './contexts/AvatarContext';
import { PseudoProvider } from './contexts/PseudoContext';
import { LeaderProvider } from './contexts/LeaderContext';
import { PerfectProvider } from './contexts/PerfectContext';

import { SnackbarProvider } from 'notistack';
import './App.css';
import { queryClient } from './query-client';

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AvatarProvider>
      <LeaderProvider>
        <PerfectProvider>
          <PseudoProvider>
            <SnackbarProvider>
              <AuthProvider>
                <div className="App">
                  <AuthConsumer>
                    {
                      auth => auth.isLoading ?
                        <p>Loading...</p> :
                        <RouterProvider router={router} />
                    }
                  </AuthConsumer>
                </div>
              </AuthProvider>
            </SnackbarProvider>
          </PseudoProvider>
        </PerfectProvider>
      </LeaderProvider>
    </AvatarProvider>
  </QueryClientProvider>
);

export default App;

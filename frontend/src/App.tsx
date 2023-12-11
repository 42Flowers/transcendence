import { QueryClientProvider } from 'react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthConsumer, AuthProvider } from './contexts/AuthContext';
import { AvatarProvider } from './contexts/AvatarContext';
import { LeaderProvider } from './contexts/LeaderContext';
import { PerfectProvider } from './contexts/PerfectContext';
import { router } from './router';

import { SnackbarProvider } from 'notistack';
import './App.css';
import { queryClient } from './query-client';
import { ChatProvider } from './contexts/ChatContext';

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ChatProvider>
      <AvatarProvider>
        <LeaderProvider>
          <PerfectProvider>
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
          </PerfectProvider>
        </LeaderProvider>
      </AvatarProvider>
    </ChatProvider>
  </QueryClientProvider>
);

export default App;

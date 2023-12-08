import { QueryClient, QueryClientProvider } from 'react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthConsumer, AuthProvider } from './contexts/AuthContext';
import { router } from './router';
import { AvatarProvider } from './contexts/AvatarContext';
import { PseudoProvider } from './contexts/PseudoContext';
import { AchievementsListProvider } from './contexts/AchievementsListContext';
import { LeaderProvider } from './contexts/LeaderContext';
import { PerfectProvider } from './contexts/PerfectContext';
import { ChatProvider } from './contexts/ChatContext';

import { SnackbarProvider } from 'notistack';
import './App.css';
import { queryClient } from './query-client';

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AvatarProvider>
      <ChatProvider>
        <LeaderProvider>
          <PerfectProvider>
            <PseudoProvider>
              <AchievementsListProvider>
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
              </AchievementsListProvider>
            </PseudoProvider>
          </PerfectProvider>
        </LeaderProvider>
      </ChatProvider>
    </AvatarProvider>
  </QueryClientProvider>
);

export default App;

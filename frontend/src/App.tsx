import { QueryClientProvider } from 'react-query';
import { RouterProvider } from 'react-router-dom';
import { AchievementsListProvider } from './contexts/AchievementsListContext';
import { AuthConsumer, AuthProvider } from './contexts/AuthContext';
import { AvatarProvider } from './contexts/AvatarContext';
import { LeaderProvider } from './contexts/LeaderContext';
import { PerfectProvider } from './contexts/PerfectContext';
import { PseudoProvider } from './contexts/PseudoContext';
import { router } from './router';

import { SnackbarProvider } from 'notistack';
import './App.css';
import { queryClient } from './query-client';

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AvatarProvider>
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
    </AvatarProvider>
  </QueryClientProvider>
);

export default App;

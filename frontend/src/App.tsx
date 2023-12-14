import { QueryClientProvider } from 'react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthConsumer, AuthProvider } from './contexts/AuthContext';
import { router } from './router';

import { SnackbarProvider } from 'notistack';
import './App.css';
import { queryClient } from './query-client';

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
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
  </QueryClientProvider>
);

export default App;

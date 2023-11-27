import { QueryClient, QueryClientProvider } from 'react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthConsumer, AuthProvider } from './contexts/AuthContext';
import { router } from './router';
import { AvatarProvider } from './contexts/AvatarContext';

// import Navigation from './components/Navigation/Navigation';
// import SocketContextComponent from './components/Socket/Context/Component';
// import { BrowserRouter, Routes, Route } from '../node_modules/react-router-dom/dist/index';
// import { ContactForm } from './components/Chat/ContactForm';
// import { MainPage } from './components/Chat/MainPage';
// import { ChatPage } from './components/Chat/ChatPage';
// import Room from './components/Chat/Room';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000,
    },
  },
});

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AvatarProvider>
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
    </AvatarProvider>
  </QueryClientProvider>
);

// return (
//   <SocketContextComponent>
//   <div className='App'>
//     <BrowserRouter>
//       <Routes>
//         <Route  path='/' element={<MainPage/>}/>
//         <Route path='/subscribe' element={<ContactForm/>} />
//         <Route path='/chat' element={<ChatPage/>} />
//         <Route path='/chat/room/:id' element={<Room/>}/>
//       </Routes>
//     </BrowserRouter>
//   </div>
//   </SocketContextComponent>
// )

export default App;

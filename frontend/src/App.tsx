import { Provider } from 'react-redux';
import { store } from './store';
import { AppRouter } from './routes/AppRouter';
import { AuthToastProvider } from './contexts/AuthToastContext';

function App() {
  return (
    <Provider store={store}>
      <AuthToastProvider>
        <AppRouter />
      </AuthToastProvider>
    </Provider>
  );
}

export default App;

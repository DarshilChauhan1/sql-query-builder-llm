import { Provider } from 'react-redux';
import { store } from './store';
import { AppRouter } from './routes/AppRouter';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </Provider>
  );
}

export default App;

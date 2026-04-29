import { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AppRouter } from './routes/AppRouter.tsx';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState, store } from './stores/store.ts';
import { getUserThunk } from './stores/userSlice.ts';
import GlobalSnackbar from './components/common/GlobalSnackbar.tsx';
import { Toaster } from 'sonner';
import { GlobalToastListener } from './components/common/GlobalToastListener.tsx';

const PROTECTED_ROUTE_PREFIXES = [
    '/native/home',
    '/home',
    '/profile',
    '/flash-cards',
    '/study-calendar',
    '/practice-skill',
    '/result-statistic',
    '/learning-completion',
    '/programs',
    '/lesson',
    '/credit',
];

const shouldBootstrapUser = (pathname: string) =>
    PROTECTED_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));


const initSentryWhenIdle = () => {
    if (!import.meta.env.PROD || !import.meta.env.VITE_SENTRY_DSN) {
        return;
    }

    const idleWindow = window as Window & {
        requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    };

    const start = () => {
        void import('./lib/sentry.ts').then(m => m.getSentryModule());
    };

    if (idleWindow.requestIdleCallback) {
        idleWindow.requestIdleCallback(start, { timeout: 4000 });
        return;
    }

    window.setTimeout(start, 2000);
};

const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useDispatch<AppDispatch>();
    const location = useLocation();
    const { initialized, loading } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        if (initialized || loading || !shouldBootstrapUser(location.pathname)) {
            return;
        }

        dispatch(getUserThunk())
            .unwrap()
            .then((user) => {
                void import('./lib/sentry.ts').then(m => m.setSentryUserContext(user));
            })
            .catch(() => {
                void import('./lib/sentry.ts').then(m => m.setSentryUserContext(null));
            });
    }, [dispatch, initialized, loading, location.pathname]);

    return <>
        {children}
        <GlobalSnackbar />
    </>;
};

initSentryWhenIdle();

export default function FullApp() {
    return (
        <BrowserRouter>
            <Provider store={store}>
                <Toaster
                    position='top-right'
                    richColors
                    toastOptions={{
                        classNames: {
                            loading: `
                                    !text-blue-400 
                                    [&>svg]:!text-blue-400 
                                    [&>svg]:!stroke-blue-400 
                                    [&>svg]:!fill-blue-400
                                `,
                        },
                    }} />
                <GlobalToastListener />
                <AppProvider>
                    <AppRouter />
                </AppProvider>
            </Provider>
        </BrowserRouter>
    );
}
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser, clearCredentials } from '../store/slices/auth.slice';

export const useAuthRequired = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectCurrentUser);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token || !isAuthenticated) {
            navigate('/login');
        }
    }, [navigate, isAuthenticated]);

    const logout = () => {
        dispatch(clearCredentials());
        navigate('/login');
    };

    return {
        isAuthenticated,
        user,
        logout
    };
};

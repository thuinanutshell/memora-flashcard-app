import { useCallback, useState } from 'react';

const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const executeRequest = useCallback(async (apiFunction, ...args) => {
        setLoading(true);
        setError(null);

        try {
            const result = await apiFunction(...args);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        loading,
        error,
        executeRequest,
        clearError
    };
};

export default useApi;
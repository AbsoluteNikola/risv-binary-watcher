import { useCallback, useEffect, useRef, useMemo } from 'react';

export default function useTimeout(callback, delay) {
    const timeoutRef = useRef();
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        return () => window.clearTimeout(timeoutRef.current);
    }, []);

    const memoizedCallback = useCallback(
        (args) => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = window.setTimeout(() => {
                timeoutRef.current = null;
                callbackRef.current?.(args);
            }, delay);
        },
        [delay, timeoutRef, callbackRef]
    );

    return useMemo(() => [memoizedCallback], [memoizedCallback]);
}
import { useState, useCallback } from 'react';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // Time window in milliseconds
  blockDurationMs?: number; // How long to block after exceeding limit
}

interface RateLimitState {
  attempts: number;
  lastAttempt: number;
  isBlocked: boolean;
  blockUntil?: number;
}

export const useRateLimit = (config: RateLimitConfig) => {
  const [state, setState] = useState<RateLimitState>({
    attempts: 0,
    lastAttempt: 0,
    isBlocked: false,
  });

  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    
    // Check if currently blocked
    if (state.blockUntil && now < state.blockUntil) {
      return {
        allowed: false,
        remainingTime: Math.ceil((state.blockUntil - now) / 1000),
        message: `Too many attempts. Try again in ${Math.ceil((state.blockUntil - now) / 1000)} seconds.`
      };
    }
    
    // Reset if window has passed
    if (now - state.lastAttempt > config.windowMs) {
      setState({
        attempts: 0,
        lastAttempt: now,
        isBlocked: false,
      });
      return { allowed: true };
    }
    
    // Check if limit exceeded
    if (state.attempts >= config.maxAttempts) {
      const blockUntil = now + (config.blockDurationMs || config.windowMs);
      setState(prev => ({
        ...prev,
        isBlocked: true,
        blockUntil,
      }));
      return {
        allowed: false,
        remainingTime: Math.ceil((blockUntil - now) / 1000),
        message: `Too many attempts. Try again in ${Math.ceil((blockUntil - now) / 1000)} seconds.`
      };
    }
    
    return { allowed: true };
  }, [state, config]);

  const recordAttempt = useCallback(() => {
    const now = Date.now();
    setState(prev => ({
      ...prev,
      attempts: prev.attempts + 1,
      lastAttempt: now,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      attempts: 0,
      lastAttempt: 0,
      isBlocked: false,
    });
  }, []);

  return {
    checkRateLimit,
    recordAttempt,
    reset,
    isBlocked: state.isBlocked,
    remainingTime: state.blockUntil ? Math.max(0, Math.ceil((state.blockUntil - Date.now()) / 1000)) : 0,
  };
};
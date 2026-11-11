import { useState, useEffect, useCallback } from 'react';

const VALIDITY_SEC = 300; // 5 minutes — matches Redis OTP TTL
const COOLDOWN_SEC = 30;  // 30s resend cooldown

export function useOtpCountdown() {
  const [validity,  setValidity]  = useState(VALIDITY_SEC);
  const [cooldown,  setCooldown]  = useState(COOLDOWN_SEC);

  useEffect(() => {
    const id = setInterval(() => {
      setValidity(v => (v > 0 ? v - 1 : 0));
      setCooldown(c => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const reset = useCallback(() => {
    setValidity(VALIDITY_SEC);
    setCooldown(COOLDOWN_SEC);
  }, []);

  const m = Math.floor(validity / 60);
  const s = validity % 60;

  return {
    expiryLabel:  `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`,
    cooldownSec:  cooldown,
    isExpired:    validity <= 0,
    canResend:    cooldown <= 0,
    reset,
  };
}

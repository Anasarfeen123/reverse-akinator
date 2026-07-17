import { useReducer, useCallback, useRef, useEffect } from 'react';
import { matchdayReducer, INITIAL_MATCHDAY_STATE } from './MatchdayState';
import type { MatchdayAction } from './MatchdayState';
import { aiReferee } from '../services/aiReferee';

const NETWORK_TIMEOUT_MS = 120000;
const IDLE_TIMEOUT_MS = 90000;

export function useMatchdayEngine() {
  const [state, dispatch] = useReducer(matchdayReducer, INITIAL_MATCHDAY_STATE);
  
  const timeoutRef = useRef<number | null>(null);
  const idleTimerRef = useRef<number | null>(null);

  const clearNetworkTimeout = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
    }
    
    // Only set idle timeout if not in LOBBY or VAR_REVIEW
    if (state.status !== 'LOBBY' && state.status !== 'VAR_REVIEW') {
      idleTimerRef.current = window.setTimeout(() => {
        dispatch({ type: 'RESET_MATCH' });
      }, IDLE_TIMEOUT_MS);
    }
  }, [state.status]);

  // Global activity listener for idle timeout
  useEffect(() => {
    const handleActivity = () => resetIdleTimer();
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('click', handleActivity);
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('click', handleActivity);
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  const dispatchWithTimeout = useCallback(async <T>(
    actionThunk: () => Promise<T>,
    onSuccess: (result: T) => MatchdayAction
  ) => {
    clearNetworkTimeout();
    resetIdleTimer();
    
    timeoutRef.current = window.setTimeout(() => {
      dispatch({ type: 'NETWORK_TIMEOUT' });
    }, NETWORK_TIMEOUT_MS);

    try {
      const result = await actionThunk();
      clearNetworkTimeout();
      dispatch(onSuccess(result));
    } catch (error) {
      clearNetworkTimeout();
      dispatch({ type: 'NETWORK_TIMEOUT' });
    }
  }, [clearNetworkTimeout, resetIdleTimer]);

  const triggerKickoff = useCallback(() => {
    dispatch({ type: 'TRIGGER_KICKOFF' });
    dispatchWithTimeout(
      () => aiReferee.pickSecretPlayer(),
      (player) => ({ type: 'KICKOFF_SUCCESS', payload: player })
    );
  }, [dispatchWithTimeout]);

  const processInterrogationTick = useCallback((question: string) => {
    if (!state.secretPlayer) return;
    dispatch({ type: 'SUBMIT_INTERROGATION', payload: question });
    
    dispatchWithTimeout(
      () => aiReferee.answerQuestion(question, state.secretPlayer!, state.interrogationLog),
      (answer) => ({ type: 'INTERROGATION_SUCCESS', payload: { question, answer } })
    );
  }, [state.secretPlayer, state.interrogationLog, dispatchWithTimeout]);

  const transmitGuessAttempt = useCallback((guess: string) => {
    if (!state.secretPlayer) return;
    dispatch({ type: 'SUBMIT_GUESS', payload: guess });

    dispatchWithTimeout(
      () => aiReferee.checkGuess(guess, state.secretPlayer!),
      (isCorrect) => ({ 
        type: 'GUESS_VERDICT', 
        payload: { isCorrect, guess, actualPlayer: state.secretPlayer! } 
      })
    );
  }, [state.secretPlayer, dispatchWithTimeout]);

  const blowFinalWhistle = useCallback(() => {
    dispatch({ type: 'BLOW_FINAL_WHISTLE' });
  }, []);

  const appealDecision = useCallback(() => {
    dispatch({ type: 'VAR_DECISION_APPEAL' });
  }, []);

  const resetMatch = useCallback(() => {
    clearNetworkTimeout();
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    dispatch({ type: 'RESET_MATCH' });
  }, [clearNetworkTimeout]);

  return {
    state,
    triggerKickoff,
    processInterrogationTick,
    transmitGuessAttempt,
    blowFinalWhistle,
    appealDecision,
    resetMatch,
  };
}

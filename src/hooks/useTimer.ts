import { useEffect, useRef, useState, useCallback } from 'react'
import { INITIAL_TIME, BONUS_ACTOR, BONUS_FILM, BONUS_TV } from '../constants'

export function useTimer() {
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME)
  const [isExpired, setIsExpired] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const deadlineRef = useRef<number>(0)

  const start = useCallback(() => {
    deadlineRef.current = Date.now() + INITIAL_TIME * 1000
    setTimeLeft(INITIAL_TIME)
    setIsExpired(false)
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000))
      setTimeLeft(remaining)
      if (remaining <= 0) {
        clearInterval(intervalRef.current)
        setIsExpired(true)
      }
    }, 250)
  }, [])

  const stop = useCallback(() => {
    clearInterval(intervalRef.current)
  }, [])

  const addTime = useCallback((nodeType: 'film' | 'actor' | 'tv') => {
    const bonus = nodeType === 'actor' ? BONUS_ACTOR : nodeType === 'tv' ? BONUS_TV : BONUS_FILM
    deadlineRef.current += bonus * 1000
    setTimeLeft(prev => prev + bonus)
  }, [])

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  return { timeLeft, isExpired, start, stop, addTime }
}

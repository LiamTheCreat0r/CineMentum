import { useEffect, useRef, useState, useCallback } from 'react'
import { INITIAL_TIME, BONUS_ACTOR, BONUS_FILM, BONUS_TV } from '../constants'

export function useTimer() {
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME)
  const [isExpired, setIsExpired] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const start = useCallback(() => {
    setTimeLeft(INITIAL_TIME)
    setIsExpired(false)
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setIsExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const stop = useCallback(() => {
    clearInterval(intervalRef.current)
  }, [])

  const addTime = useCallback((nodeType: 'film' | 'actor' | 'tv') => {
    const bonus = nodeType === 'actor' ? BONUS_ACTOR : nodeType === 'tv' ? BONUS_TV : BONUS_FILM
    setTimeLeft(prev => prev + bonus)
  }, [])

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  return { timeLeft, isExpired, start, stop, addTime }
}

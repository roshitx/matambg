"use client"

import { useState, useEffect, useRef } from "react"
import { getTodaySpent, getElapsedSecondsToday } from "@/lib/utils/calculate"
import { MBG } from "@/lib/constants/mbg"

export function useLiveCounter() {
  const [amount, setAmount] = useState(() => getTodaySpent())
  const rafRef = useRef<number>(0)
  const lastSecRef = useRef(0)

  useEffect(() => {
    const tick = () => {
      const nowSec = Math.floor(getElapsedSecondsToday())
      if (nowSec !== lastSecRef.current) {
        lastSecRef.current = nowSec
        setAmount(Math.floor(nowSec * MBG.PER_SECOND))
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return { amount }
}

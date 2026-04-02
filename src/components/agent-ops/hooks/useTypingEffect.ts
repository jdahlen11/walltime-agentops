import { useState, useEffect, useRef } from 'react'

export function useTypingEffect(fullText: string, speed: number = 25) {
  const [displayed, setDisplayed] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const indexRef = useRef(0)
  const textRef = useRef(fullText)

  useEffect(() => {
    textRef.current = fullText
    indexRef.current = 0
    setDisplayed('')
    setIsTyping(true)
  }, [fullText])

  useEffect(() => {
    if (!isTyping) return
    const id = setInterval(() => {
      if (indexRef.current < textRef.current.length) {
        setDisplayed(textRef.current.slice(0, indexRef.current + 1))
        indexRef.current++
      } else {
        setIsTyping(false)
        clearInterval(id)
        setTimeout(() => {
          indexRef.current = 0
          setDisplayed('')
          setIsTyping(true)
        }, 8000)
      }
    }, speed + Math.random() * 20)
    return () => clearInterval(id)
  }, [isTyping, speed])

  return { displayed, isTyping }
}

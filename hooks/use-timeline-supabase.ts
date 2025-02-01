import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { TimelineEvent } from '@/types/app'

export const useTimelineSupabase = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([])

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('timeline_events')
      .select('*')
    if (error) console.error('Error fetching events:', error)
    else setEvents(data)
  }

  const addEvent = async (event: Omit<TimelineEvent, 'id' | 'created_at'>) => { // createdAt から created_at に変更
    const newEvent = {
      ...event,
      created_at: new Date().toISOString() // createdAt から created_at に変更
    }
    const { error } = await supabase
      .from('timeline_events')
      .insert(newEvent)
    if (!error) await fetchEvents()
  }

  const deleteEvent = async (id: string) => {
    const { error } = await supabase
      .from('timeline_events')
      .delete()
      .eq('id', id)
    if (!error) await fetchEvents()
  }

  const getAllEventsSorted = () => {
    return [...events].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }

  return { events, addEvent, deleteEvent, getAllEventsSorted }
}

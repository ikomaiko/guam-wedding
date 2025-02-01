"use client";

import { useEffect, useState } from "react";
import { Hero } from "@/components/sections/hero";
import { WeddingDetails } from "@/components/sections/wedding-details";
import { Guests } from "@/components/sections/guests";
import { Checklist } from "@/components/sections/checklist";
import { Timeline } from "@/components/sections/timeline";
import { Countdown } from "@/components/sections/countdown";
import { Navigation } from "@/components/navigation";
import { useChecklistSupabase } from "@/hooks/use-checklist-supabase";
import { useTimelineSupabase } from "@/hooks/use-timeline-supabase";
import { useAuth } from "@/contexts/auth-context";
import { redirect } from "next/navigation";

function PageContent() {
  const { user } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const {
    items: checklistItems,
    toggleComplete,
    addItem,
    deleteItem,
  } = useChecklistSupabase();
  const {
    events: timelineEvents,
    getAllEventsSorted,
    addEvent,
    deleteEvent,
  } = useTimelineSupabase();
  const sortedEvents = getAllEventsSorted();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const weddingDate = new Date("2025-02-08");
  const today = new Date();
  const timeLeft = Math.ceil(
    (weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="relative pb-20">
      <Hero />
      <WeddingDetails />
      <Guests />
      <Timeline
        events={sortedEvents}
        onAddEvent={addEvent}
        onDeleteEvent={deleteEvent}
      />
      <Checklist
        items={checklistItems}
        onToggleComplete={toggleComplete}
        onAddItem={addItem}
        onDeleteItem={deleteItem}
      />
      <Countdown daysLeft={timeLeft} />
      <Navigation />
    </main>
  );
}

export default function Home() {
  return <PageContent />;
}

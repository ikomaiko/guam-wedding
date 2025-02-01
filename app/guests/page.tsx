"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";

interface GuestWithProfile {
  id: string;
  name: string;
  type: string;
  side: string;
  profile?: {
    avatar_url: string | null;
    location: string | null;
  };
}

export default function GuestsPage() {
  const { user } = useAuth();
  const [guests, setGuests] = useState<GuestWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGuests = async () => {
      const { data, error } = await supabase
        .from("guests")
        .select(`
          id,
          name,
          type,
          side,
          guest_profiles (
            avatar_url,
            location
          )
        `)
        .order("side")
        .order("type")
        .order("name");

      if (error) {
        console.error("Error fetching guests:", error);
        return;
      }

      setGuests(data.map(guest => ({
        ...guest,
        profile: guest.guest_profiles?.[0] || null
      })));
      setIsLoading(false);
    };

    fetchGuests();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const getInitials = (name: string) => {
    return name.slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#f8f5f2] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif mb-8">参列者一覧</h1>
        
        <div className="grid gap-8">
          {["新郎側", "新婦側"].map(side => (
            <div key={side}>
              <h2 className="text-2xl font-serif mb-4">{side}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {guests
                  .filter(guest => guest.side === side)
                  .map((guest, index) => (
                    <motion.div
                      key={guest.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link href={`/guests/${guest.id}`}>
                        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={guest.profile?.avatar_url || undefined} />
                                <AvatarFallback>{getInitials(guest.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{guest.name}</div>
                                <div className="text-sm text-muted-foreground">{guest.type}</div>
                                {guest.profile?.location && (
                                  <div className="text-sm text-muted-foreground mt-1">
                                    📍 {guest.profile.location}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
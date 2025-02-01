"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { sortByGuestType } from "@/lib/utils";
import type { Guest } from "@/types/app";

interface GuestWithProfile {
  id: string;
  name: string;
  type: Guest["type"];
  side: Guest["side"];
  profile?: {
    avatar_url: string | null;
    location: string | null;
  };
}

export function Guests() {
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
        `);

      if (error) {
        console.error("Error fetching guests:", error);
        return;
      }

      // Sort guests by type using the sortByGuestType utility
      const sortedGuests = data
        .map(guest => ({
          ...guest,
          profile: guest.guest_profiles?.[0] || null
        }))
        .sort((a, b) => sortByGuestType(a.type) - sortByGuestType(b.type));

      setGuests(sortedGuests);
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
    <section className="py-20 bg-white" id="guests">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif text-center mb-12">参列者一覧</h2>
          
          <div className="grid gap-12">
            {["新郎側", "新婦側"].map(side => (
              <motion.div
                key={side}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-serif mb-6">{side}</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {guests
                    .filter(guest => guest.side === side)
                    .map((guest, index) => (
                      <motion.div
                        key={guest.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
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
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
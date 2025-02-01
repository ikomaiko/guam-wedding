"use client";

import { motion } from "framer-motion";
import { Plus, MapPin, ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import type { TimelineEvent, Visibility } from "@/types/app";

interface TimelineProps {
  events: TimelineEvent[];
  onAddEvent?: (event: Omit<TimelineEvent, "id" | "created_at">) => void;
  onDeleteEvent?: (id: string) => void;
}

export function Timeline({ events, onAddEvent, onDeleteEvent }: TimelineProps) {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [showAllDates, setShowAllDates] = useState(false);
  const [newEvent, setNewEvent] = useState({
    date: "",
    time: "",
    title: "",
    location: "",
    visibility: "public" as Visibility,
  });

  // イベントを日付でグループ化
  const groupedEvents = useMemo(() => {
    const sorted = [...events].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return sorted.reduce((groups, event) => {
      const date = new Date(event.date).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      if (!groups[date]) {
        groups[date] = {
          新郎側: [],
          新婦側: [],
        };
      }
      groups[date][event.side].push(event);
      return groups;
    }, {} as Record<string, Record<"新郎側" | "新婦側", TimelineEvent[]>>);
  }, [events]);

  // 表示する日付を制限
  const displayDates = useMemo(() => {
    const dates = Object.entries(groupedEvents);
    return showAllDates ? dates : dates.slice(0, 2);
  }, [groupedEvents, showAllDates]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddEvent || !user) return;

    const dateTime = `${newEvent.date} ${newEvent.time}`;
    onAddEvent({
      date: dateTime,
      title: newEvent.title,
      location: newEvent.location,
      visibility: newEvent.visibility,
      created_by: user.id,
      side: user.side,
    });

    setNewEvent({
      date: "",
      time: "",
      title: "",
      location: "",
      visibility: "public",
    });
    setIsDialogOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setEventToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (eventToDelete && onDeleteEvent) {
      onDeleteEvent(eventToDelete);
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderEvent = (event: TimelineEvent, side: "新郎側" | "新婦側") => (
    <motion.div
      key={event.id}
      className={`relative ${side === "新郎側" ? "text-right" : "text-left"}`}
      initial={{ opacity: 0, x: side === "新郎側" ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
    >
      <div className="space-y-2">
        {/* タイトル */}
        <div
          className={`flex items-center gap-2 ${
            side === "新郎側" ? "justify-end" : "justify-start"
          }`}
        >
          {side === "新郎側" ? (
            <>
              {event.created_by === user?.id && onDeleteEvent && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleDeleteClick(event.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
              <h4 className="font-medium text-lg">{event.title}</h4>
            </>
          ) : (
            <>
              <h4 className="font-medium text-lg">{event.title}</h4>
              {event.created_by === user?.id && onDeleteEvent && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleDeleteClick(event.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </>
          )}
        </div>

        {/* 時間 */}
        <div className="text-sm text-muted-foreground">
          {formatTime(event.date)}
        </div>

        {/* 場所 */}
        <div
          className={`flex items-center gap-1 text-muted-foreground ${
            side === "新郎側" ? "justify-end" : "justify-start"
          }`}
        >
          {side === "新郎側" ? (
            <>
              {event.location}
              <MapPin className="h-4 w-4 text-[#722F37]" />
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 text-[#722F37]" />
              {event.location}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <section className="py-20 bg-[#f8f5f2]" id="timeline">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-serif mb-4">タイムライン</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  予定を追加
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新しい予定を追加</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">日付</label>
                      <Input
                        type="date"
                        value={newEvent.date}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, date: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">時間</label>
                      <Input
                        type="time"
                        value={newEvent.time}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, time: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">タイトル</label>
                    <Input
                      value={newEvent.title}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">場所</label>
                    <Input
                      value={newEvent.location}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, location: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">公開設定</label>
                    <Select
                      value={newEvent.visibility}
                      onValueChange={(value: Visibility) =>
                        setNewEvent({ ...newEvent, visibility: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="公開設定を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">自分だけ</SelectItem>
                        <SelectItem value="family">身内だけ</SelectItem>
                        <SelectItem value="public">全員</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    追加
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-2 gap-8 relative top-[60px]">
            <h3 className="text-xl font-serif text-center ">新郎側</h3>
            <h3 className="text-xl font-serif text-center ">新婦側</h3>
          </div>

          <div className="relative">
            {/* 中央の軸 */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/30 transform -translate-x-1/2" />

            {/* 日付ごとのイベント */}
            {displayDates.map(([date, sides], index) => (
              <div key={date} className="">
                {" "}
                {/* mb-16から変更 */}
                {/* 日付ラベル */}
                <div className="relative mb-24">
                  {" "}
                  {/* mb-16から変更 */}
                  <div className="absolute left-1/2 transform -translate-x-1/2">
                    <div className="bg-[#f8f5f2] px-4 py-2 rounded-full border border-primary/30">
                      <div className="text-lg font-medium text-primary">
                        {date}
                      </div>
                    </div>
                  </div>
                </div>
                {/* イベント */}
                <div className="grid grid-cols-2 gap-8 relative top-[60px]">
                  <div className="space-y-8 pr-2">
                    {" "}
                    {/* space-y-12から変更 */}
                    {sides["新郎側"].map((event) =>
                      renderEvent(event, "新郎側")
                    )}
                  </div>
                  <div className="space-y-8 pl-8">
                    {" "}
                    {/* space-y-12から変更 */}
                    {sides["新婦側"].map((event) =>
                      renderEvent(event, "新婦側")
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* もっと見るボタン */}
            {Object.keys(groupedEvents).length > 2 && (
              <div className="text-center mt-8 relative top-[40px]">
                <Button
                  variant="outline"
                  onClick={() => setShowAllDates(!showAllDates)}
                  className="gap-2"
                >
                  <ChevronDown className="h-4 w-4" />
                  {showAllDates ? "閉じる" : "もっと見る"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>予定の削除</DialogTitle>
            <DialogDescription>
              この予定を削除してもよろしいですか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

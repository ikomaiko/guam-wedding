"use client";

import { motion } from "framer-motion";
import { Plus, MapPin, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import type { TimelineEvent, Visibility } from "@/types/app";

interface TimelineProps {
  events: TimelineEvent[];
  onAddEvent?: (event: Omit<TimelineEvent, "id" | "created_at">) => void;
  onDeleteEvent?: (id: string) => void;
}

export function Timeline({ events, onAddEvent, onDeleteEvent }: TimelineProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({
    date: "",
    time: "",
    title: "",
    location: "",
    visibility: "public" as Visibility,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddEvent || !user) return;

    const dateTime = `${newEvent.date} ${newEvent.time}`;
    onAddEvent({
      date: dateTime,
      title: newEvent.title,
      location: newEvent.location,
      visibility: newEvent.visibility,
      user_id: user.id,
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderTimelineEvents = (side: "新郎側" | "新婦側") => {
    const sideEvents = events.filter((event) => event.side === side);
    const eventsToShow = isExpanded ? sideEvents : sideEvents.slice(0, 3);

    return eventsToShow.map((event, index) => (
      <motion.div
        key={event.id}
        className={`relative ${side === "新郎側" ? "pr-8 text-right" : "pl-8"}`}
        initial={{ opacity: 0, x: side === "新郎側" ? -20 : 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.2 }}
      >
        <div className="absolute top-0 h-full">
          <div className="h-full border-l-2 border-primary"></div>
          <div className="absolute top-6 w-3 h-3 rounded-full bg-primary transform -translate-x-1.5"></div>
          <div className="absolute top-2 text-sm text-muted-foreground whitespace-nowrap">
            {formatDate(event.date)}
          </div>
          <div className="absolute top-6 text-sm text-muted-foreground whitespace-nowrap">
            {formatTime(event.date)}
          </div>
        </div>
        <div
          className={`flex items-center gap-2 ${
            side === "新郎側" ? "justify-end" : "justify-start"
          } mt-16`}
        >
          {side === "新郎側" ? (
            <>
              {event.user_id === user?.id && onDeleteEvent && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleDeleteClick(event.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
              <h4 className="font-medium">{event.title}</h4>
            </>
          ) : (
            <>
              <h4 className="font-medium">{event.title}</h4>
              {event.user_id === user?.id && onDeleteEvent && (
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
      </motion.div>
    ));
  };

  return (
    <section className="py-20 bg-[#f8f5f2]" id="timeline">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
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

          <div className="relative grid grid-cols-2 gap-8">
            {/* 新郎側 */}
            <div className="space-y-8">
              <h3 className="text-xl font-serif text-center mb-8">新郎側</h3>
              {renderTimelineEvents("新郎側")}
            </div>

            {/* 中央の線 */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full border-l-2 border-primary" />

            {/* 新婦側 */}
            <div className="space-y-8">
              <h3 className="text-xl font-serif text-center mb-8">新婦側</h3>
              {renderTimelineEvents("新婦側")}
            </div>
          </div>

          {/* 中央の線の下にドロップダウンボタンを配置 */}
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-[200px] text-center mt-8">
              <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 mx-auto"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        <span>閉じる</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        <span>すべて表示</span>
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            </div>
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

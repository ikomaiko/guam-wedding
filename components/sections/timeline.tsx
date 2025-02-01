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
import type { TimelineEvent, Family, Visibility } from "@/types/app";
import { Card, CardContent } from "@/components/ui/card";

interface TimelineProps {
  events: TimelineEvent[];
  onAddEvent?: (event: Omit<TimelineEvent, "id">) => void;
  onDeleteEvent?: (id: string) => void;
}

export function Timeline({ events, onAddEvent, onDeleteEvent }: TimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<{
    id: string;
    family: Family;
  } | null>(null);
  const [newEvent, setNewEvent] = useState({
    date: "",
    time: "",
    title: "",
    location: "",
    family: "ikoma" as Family,
    visibility: "public" as Visibility,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddEvent) return;

    const dateTime = `${newEvent.date} ${newEvent.time}`;
    onAddEvent({
      date: dateTime,
      title: newEvent.title,
      location: newEvent.location,
      visibility: newEvent.visibility,
      user_id: "1",
      family: newEvent.family,
      created_at: new Date().toISOString(),
    });

    // フォームをリセット
    setNewEvent({
      date: "",
      time: "",
      title: "",
      location: "",
      family: "ikoma",
      visibility: "public",
    });
    setIsDialogOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setEventToDelete({ id, family: "ikoma" });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (eventToDelete && onDeleteEvent) {
      onDeleteEvent(eventToDelete.id);
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  const renderTimelineEvent = (event: TimelineEvent) => (
    <Card key={event.id}>
      <CardContent>
        <p>{event.title}</p>
        <p>{event.location}</p>
        {event.user_id === "1" && onDeleteEvent && (
          <Button onClick={() => handleDeleteClick(event.id)}>削除</Button>
        )}
      </CardContent>
    </Card>
  );

  const renderTimelineEvents = (family: Family) => {
    const currentUserId = "1";

    // フィルタリングロジックを修正
    const familyEvents = events.filter((event) => {
      // user_idに基づいて家族を判定
      const eventFamily = event.user_id === "1" ? "ikoma" : "onohara";
      if (eventFamily !== family) return false;

      // 表示制御
      switch (event.visibility) {
        case "public":
          return true;
        case "family":
          return (
            event.user_id === currentUserId ||
            ["1", "2"].includes(currentUserId)
          );
        case "private":
          return event.user_id === currentUserId;
        default:
          return false;
      }
    });

    // イベントの日付フォーマットを修正
    const eventsToShow = isExpanded ? familyEvents : familyEvents.slice(0, 3);
    return eventsToShow.map((event, index) => (
      <motion.div
        key={event.id}
        className={`relative ${
          family === "ikoma" ? "pr-8 text-right" : "pl-8"
        }`}
        initial={{ opacity: 0, x: family === "ikoma" ? -20 : 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.2 }}
      >
        {/* ISO形式の日付を日本時間に変換して表示 */}
        <time className="text-sm text-muted-foreground">
          {new Date(event.date).toLocaleString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
        <div className="flex items-center gap-2 justify-between">
          {family === "ikoma" ? (
            <>
              {event.user_id === "1" && onDeleteEvent && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleDeleteClick(event.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
              <h4 className="font-medium mt-1">{event.title}</h4>
            </>
          ) : (
            <>
              <h4 className="font-medium mt-1">{event.title}</h4>
              {event.user_id === "1" && onDeleteEvent && (
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
            family === "ikoma" ? "justify-end" : "justify-start"
          }`}
        >
          {family === "ikoma" ? (
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
          <div className="flex justify-between items-center mb-16">
            <h2 className="text-3xl font-serif">Timeline</h2>
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
                    <label className="text-sm font-medium">家族</label>
                    <Select
                      value={newEvent.family}
                      onValueChange={(value: Family) =>
                        setNewEvent({ ...newEvent, family: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="家族を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ikoma">生駒家</SelectItem>
                        <SelectItem value="onohara">小野原家</SelectItem>
                      </SelectContent>
                    </Select>
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
            {/* 生駒家側 */}
            <div className="space-y-8">
              <h3 className="text-xl font-serif text-center mb-8">生駒家</h3>
              {renderTimelineEvents("ikoma")}
            </div>

            {/* 中央の線 */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full border-l-2 border-primary" />

            {/* 小野原家側 */}
            <div className="space-y-8">
              <h3 className="text-xl font-serif text-center mb-8">小野原家</h3>
              {renderTimelineEvents("onohara")}
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

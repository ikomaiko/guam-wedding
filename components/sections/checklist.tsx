"use client";

import {
  Plus,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type {
  ChecklistItem,
  ChecklistItemWithState,
  DueType,
  Visibility,
  Guest,
} from "@/types/app";

interface ChecklistProps {
  items: ChecklistItemWithState[];
  onToggleComplete: (id: string) => void;
  onAddItem: (
    item: Pick<ChecklistItem, "content" | "due_type" | "visibility">
  ) => void;
  onDeleteItem?: (id: string) => void;
}

export function Checklist({
  items,
  onToggleComplete,
  onAddItem,
  onDeleteItem,
}: ChecklistProps) {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isProgressExpanded, setIsProgressExpanded] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    content: "",
    dueType: "week_before" as DueType,
    visibility: "public" as Visibility,
  });
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGuests = async () => {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .order("id");

      if (error) {
        console.error("Error fetching guests:", error);
        return;
      }

      setGuests(data || []);
      setIsLoading(false);
    };

    fetchGuests();
  }, []);

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.content || !newTask.dueType) return;

    onAddItem({
      content: newTask.content,
      due_type: newTask.dueType,
      visibility: newTask.visibility,
    });

    setNewTask({ content: "", dueType: "week_before", visibility: "public" });
    setIsTaskDialogOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete && onDeleteItem) {
      onDeleteItem(itemToDelete);
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const renderChecklistItem = (item: ChecklistItemWithState) => (
    <Card key={item.id}>
      <CardContent className="flex items-center p-4">
        <Checkbox
          id={`task-${item.id}`}
          checked={item.is_completed}
          onCheckedChange={() => onToggleComplete(item.id)}
          className="mr-4"
        />
        <div className="flex-1">
          {item.link ? (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2"
            >
              <label
                htmlFor={`task-${item.id}`}
                className={`text-sm font-medium ${
                  item.is_completed
                    ? "line-through text-muted-foreground"
                    : "text-blue-600 underline"
                }`}
              >
                {item.content}
              </label>
              <ExternalLink className="h-4 w-4 text-blue-600 group-hover:text-blue-800" />
            </a>
          ) : (
            <div className="flex justify-between items-center w-full">
              <label
                htmlFor={`task-${item.id}`}
                className={`text-sm font-medium ${
                  item.is_completed ? "line-through text-muted-foreground" : ""
                }`}
              >
                {item.content}
              </label>
              {item.user_id === "1" && onDeleteItem && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleDeleteClick(item.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const calculateProgress = (userId: string) => {
    const publicTasks = items.filter((item) => item.visibility === "public");
    const totalTasks = publicTasks.length;
    const completedTasks = publicTasks.filter(
      (item) => item.is_completed && item.user_id === userId
    ).length;
    return `${completedTasks}/${totalTasks}`;
  };

  const initialDisplayGuests = guests.slice(0, 3);
  const remainingGuests = guests.slice(3);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <section className="py-20 bg-[#f8f5f2]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-serif">チェックリスト</h2>
            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  タスクを追加
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新しいタスクを追加</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleTaskSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">タスク内容</label>
                    <Input
                      value={newTask.content}
                      onChange={(e) =>
                        setNewTask({ ...newTask, content: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      実行タイミング
                    </label>
                    <Select
                      value={newTask.dueType}
                      onValueChange={(value: DueType) =>
                        setNewTask({ ...newTask, dueType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="実行タイミングを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week_before">1週間前</SelectItem>
                        <SelectItem value="day_before">前日</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">公開設定</label>
                    <Select
                      value={newTask.visibility}
                      onValueChange={(value: Visibility) =>
                        setNewTask({ ...newTask, visibility: value })
                      }
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

          <Tabs defaultValue="week_before" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="week_before">1週間前</TabsTrigger>
              <TabsTrigger value="day_before">前日</TabsTrigger>
            </TabsList>
            <TabsContent value="week_before">
              <div className="space-y-4">
                {items
                  .filter((item) => item.due_type === "week_before")
                  .map(renderChecklistItem)}
              </div>
            </TabsContent>
            <TabsContent value="day_before">
              <div className="space-y-4">
                {items
                  .filter((item) => item.due_type === "day_before")
                  .map(renderChecklistItem)}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-12">
            <h3 className="text-2xl font-serif mb-6">みんなの進捗状況</h3>
            <div className="space-y-4">
              {initialDisplayGuests.map((guest) => (
                <Card key={guest.id}>
                  <CardContent className="flex justify-between items-center p-4">
                    <div>
                      <p className="font-medium">{guest.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {guest.type}
                      </p>
                    </div>
                    <div className="text-lg font-medium">
                      {calculateProgress(guest.id)}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {remainingGuests.length > 0 && (
                <Collapsible
                  open={isProgressExpanded}
                  onOpenChange={setIsProgressExpanded}
                  className="space-y-2"
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 w-full justify-center"
                    >
                      {isProgressExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          <span>閉じる</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          <span>もっと見る</span>
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2">
                    {remainingGuests.map((guest) => (
                      <Card key={guest.id}>
                        <CardContent className="flex justify-between items-center p-4">
                          <div>
                            <p className="font-medium">{guest.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {guest.type}
                            </p>
                          </div>
                          <div className="text-lg font-medium">
                            {calculateProgress(guest.id)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>タスクの削除</DialogTitle>
            <DialogDescription>
              このタスクを削除してもよろしいですか？この操作は取り消せません。
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

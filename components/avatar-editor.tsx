"use client";

import { useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";
import { Camera, ZoomIn, ZoomOut, RotateCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface AvatarEditorProps {
  userId: string;
  onSave: (url: string) => void;
}

export function AvatarEditorDialog({ userId, onSave }: AvatarEditorProps) {
  const [image, setImage] = useState<File | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef<AvatarEditor>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB制限
        toast({
          title: "エラー",
          description: "ファイルサイズは5MB以下にしてください",
          variant: "destructive",
        });
        return;
      }
      setImage(file);
    }
  };

  const handleSave = async () => {
    if (!editorRef.current || !image) return;
    setIsLoading(true);

    try {
      // Get edited image as blob
      const canvas = editorRef.current.getImageScaledToCanvas();
      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.9)
      );

      // Upload to Supabase Storage
      const fileName = `avatar-${userId}-${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, blob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from("guest_profiles")
        .upsert({
          guest_id: userId,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "guest_id",
        });

      if (updateError) throw updateError;

      onSave(publicUrl);
      setIsOpen(false);
      toast({
        title: "保存完了",
        description: "アイコンを更新しました",
      });
    } catch (error) {
      console.error("Error saving avatar:", error);
      toast({
        title: "エラー",
        description: "アイコンの保存に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Camera className="h-4 w-4" />
          アイコンを変更
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>アイコンを編集</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {!image ? (
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    クリックして画像を選択
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG (最大 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <AvatarEditor
                  ref={editorRef}
                  image={image}
                  width={250}
                  height={250}
                  border={25}
                  borderRadius={125}
                  color={[0, 0, 0, 0.6]}
                  scale={scale}
                  rotate={rotation}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">拡大・縮小</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setScale(Math.max(1, scale - 0.1))}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setScale(Math.min(3, scale + 0.1))}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Slider
                    value={[scale]}
                    min={1}
                    max={3}
                    step={0.1}
                    onValueChange={([value]) => setScale(value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">回転</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setRotation((prev) => prev + 90)}
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setImage(null)}
                  >
                    画像を選び直す
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isLoading ? "保存中..." : "保存"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mic, Plus, Send, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const messageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").trim(),
});

type MessageFormData = z.infer<typeof messageSchema>;

interface MessageFormProps {
  onSubmit: (message: string) => void;
  isStreaming: boolean;
  onStop: () => void;
}

export function MessageForm({
  onSubmit,
  isStreaming,
  onStop,
}: MessageFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isComposing, setIsComposing] = useState(false);

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: "",
    },
  });

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = newHeight + "px";
      textarea.style.overflowY =
        textarea.scrollHeight > 120 ? "auto" : "hidden";
    }
  };

  const handleInputChange = (value: string) => {
    form.setValue("message", value);
    adjustTextareaHeight();
  };

  const watchedMessage = form.watch("message");

  useEffect(() => {
    adjustTextareaHeight();
  }, [watchedMessage]);

  const handleSubmit = (data: MessageFormData) => {
    if (isStreaming) return;
    onSubmit(data.message);
    form.reset();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isComposing) return; // don't send if IME composition is active
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(handleSubmit)();
    }
  };

  return (
    <Card className="bg-card border p-0">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-4">
          <div className="mb-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      ref={textareaRef}
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange(e.target.value);
                      }}
                      onKeyDown={handleKeyPress}
                      onCompositionStart={() => setIsComposing(true)}
                      onCompositionEnd={() => setIsComposing(false)}
                      placeholder="Ask anything"
                      disabled={isStreaming}
                      className="min-h-[28px] max-h-[120px] resize-none border-0 p-0 text-base !bg-transparent !shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-50"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                type="button"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8" type="button">
                <span className="text-sm">Tools</span>
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                type="button"
              >
                <Mic className="w-4 h-4" />
              </Button>
              {isStreaming ? (
                <Button
                  type="button"
                  onClick={onStop}
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  <Square className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!watchedMessage?.trim()}
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </Card>
  );
}

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Plus, Send } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
          {/* Right (user) */}
          <div className="flex justify-end">
            <div className="flex items-center space-x-4">
              <div className="space-y-2 text-right">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
          {/* Left (bot, system) */}
          <div className="flex justify-start">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="shrink-0 px-4 pb-6">
        <div className="w-full max-w-3xl mx-auto">
          <Card className="bg-card border p-0">
            <form className="p-4">
              <div className="mb-4">
                <Textarea
                  placeholder="Ask anything"
                  disabled={true}
                  className="min-h-[28px] max-h-[120px] resize-none border-0 p-0 text-base !bg-transparent !shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-50"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    type="button"
                    disabled={true}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    type="button"
                    disabled={true}
                  >
                    <span className="text-sm">Tools</span>
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    type="button"
                    disabled={true}
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Button
                    type="submit"
                    disabled={true}
                    size="icon"
                    className="h-8 w-8 rounded-full"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          <p className="text-xs text-muted-foreground mt-3 text-center">
            My Personal AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}

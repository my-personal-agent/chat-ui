import { Bot } from "lucide-react";

export function WelcomeScreen() {
  return (
    <div className="text-center py-16">
      <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        Welcome to My Personal AI
      </h2>
      <p className="text-muted-foreground max-w-md mx-auto">
        Start a conversation by typing your message below. I&apos;m here to help
        with any questions or tasks you have.
      </p>
    </div>
  );
}

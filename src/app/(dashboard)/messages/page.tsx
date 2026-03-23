"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  role: "client" | "admin";
  senderName: string;
  createdAt: string;
}

const demoMessages: Message[] = [
  {
    id: "1",
    content: "Hey! Just started working on your project. I'll have the wireframes ready by end of week.",
    role: "admin",
    senderName: "Fortitudo Team",
    createdAt: "Mar 15, 2026 2:30 PM",
  },
  {
    id: "2",
    content: "Sounds great! Looking forward to seeing the wireframes. Should I send over the brand assets now?",
    role: "client",
    senderName: "You",
    createdAt: "Mar 15, 2026 3:15 PM",
  },
  {
    id: "3",
    content: "Yes please! Upload them to your project page and I'll review them. Also, any preference on the color palette beyond what you mentioned in onboarding?",
    role: "admin",
    senderName: "Fortitudo Team",
    createdAt: "Mar 15, 2026 3:45 PM",
  },
  {
    id: "4",
    content: "I uploaded the brand guide and logo files. The colors in the guide should cover everything!",
    role: "client",
    senderName: "You",
    createdAt: "Mar 16, 2026 10:00 AM",
  },
];

export default function MessagesPage() {
  const [newMessage, setNewMessage] = useState("");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Messages</h1>
        <p className="text-muted-foreground mt-1">
          Chat with the Fortitudo team about your project.
        </p>
      </div>

      <Card className="flex flex-col" style={{ height: "calc(100vh - 250px)" }}>
        <CardHeader className="border-b border-border">
          <CardTitle className="text-lg">My Web Application</CardTitle>
        </CardHeader>

        {/* Messages area */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {demoMessages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col max-w-[80%]",
                message.role === "client" ? "ml-auto items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm",
                  message.role === "client"
                    ? "bg-orange text-white rounded-br-md"
                    : "bg-muted rounded-bl-md"
                )}
              >
                {message.content}
              </div>
              <span className="mt-1 text-xs text-muted-foreground">
                {message.senderName} &middot; {message.createdAt}
              </span>
            </div>
          ))}
        </CardContent>

        {/* Message input */}
        <div className="border-t border-border p-4">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (newMessage.trim()) setNewMessage("");
            }}
          >
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

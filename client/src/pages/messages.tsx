import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Message } from "@shared/schema";
import { ChevronRight, CircleUser, MessageSquarePlus, SearchIcon, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Messages() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [openSidebar, setOpenSidebar] = useState(!isMobile);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setOpenSidebar(!isMobile);
  }, [isMobile]);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/messages", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const response = await fetch(`/api/messages?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      
      return response.json();
    },
    enabled: !!user
  });

  const { data: contacts = [], isLoading: isLoadingContacts } = useQuery({
    queryKey: ["/api/doctors"],
    queryFn: async () => {
      const response = await fetch("/api/doctors");
      
      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }
      
      return response.json();
    }
  });

  // Get unique contacts from messages
  const getUniqueContacts = () => {
    const uniqueIds = new Set();
    const uniqueContacts: any[] = [];
    
    messages.forEach((message: Message) => {
      const contactId = message.senderId === user?.id ? message.receiverId : message.senderId;
      
      if (!uniqueIds.has(contactId)) {
        uniqueIds.add(contactId);
        
        // Find contact details
        const contactDetails = contacts.find((c: User) => c.id === contactId);
        
        if (contactDetails) {
          uniqueContacts.push({
            ...contactDetails,
            // Show last message
            lastMessage: message.content,
            lastMessageTime: message.createdAt,
            unread: message.senderId !== user?.id && !message.isRead
          });
        }
      }
    });
    
    return uniqueContacts;
  };

  const uniqueContacts = getUniqueContacts();
  
  // Filter contacts based on search query
  const filteredContacts = uniqueContacts.filter(contact => 
    `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get conversation with selected contact
  const conversation = selectedContact ? messages.filter((message: Message) => 
    (message.senderId === user?.id && message.receiverId === selectedContact.id) || 
    (message.senderId === selectedContact.id && message.receiverId === user?.id)
  ) : [];

  // Sort conversation by created time
  const sortedConversation = [...conversation].sort(
    (a: Message, b: Message) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;
    
    // This would be a mutation in a real app
    toast({
      title: "Feature not implemented",
      description: "Sending messages is not yet implemented in this demo.",
    });
    
    setNewMessage("");
  };

  const handleNewMessage = () => {
    setDialogOpen(true);
  };

  const handleSelectContact = (contact: User) => {
    setSelectedContact(contact);
    setDialogOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1">
        <Header title="Messages" />
        
        <main className="p-4 md:p-6 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Messages</h1>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleNewMessage} size="sm">
                  <MessageSquarePlus className="h-4 w-4 mr-2" />
                  New Message
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Message</DialogTitle>
                  <DialogDescription>
                    Select a contact to start a new conversation.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search contacts..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="max-h-[300px] overflow-y-auto space-y-2">
                    {isLoadingContacts ? (
                      <div className="py-4 text-center">Loading contacts...</div>
                    ) : contacts.length === 0 ? (
                      <div className="py-4 text-center">No contacts found</div>
                    ) : (
                      contacts
                        .filter((contact: User) => 
                          `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((contact: User) => (
                          <div
                            key={contact.id}
                            className="p-3 rounded-lg hover:bg-muted cursor-pointer flex items-center"
                            onClick={() => handleSelectContact(contact)}
                          >
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                              {contact.firstName[0]}{contact.lastName[0]}
                            </div>
                            <div>
                              <div className="font-medium">
                                {contact.firstName} {contact.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">{contact.role}</div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 border rounded-lg overflow-hidden">
              <div className="p-4 border-b bg-muted/40">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="divide-y max-h-[calc(100vh-250px)] overflow-y-auto">
                {isLoading ? (
                  <div className="py-20 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p className="text-muted-foreground">Loading messages...</p>
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="py-20 text-center">
                    <MessageSquarePlus className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-2">No messages found</p>
                    <Button size="sm" onClick={handleNewMessage}>Start a new conversation</Button>
                  </div>
                ) : (
                  filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`p-3 hover:bg-muted cursor-pointer ${selectedContact?.id === contact.id ? 'bg-muted' : ''}`}
                      onClick={() => setSelectedContact(contact)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            {contact.firstName[0]}{contact.lastName[0]}
                          </div>
                          {contact.unread && (
                            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary"></span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium truncate">
                              {contact.firstName} {contact.lastName}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {new Date(contact.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="lg:col-span-2 border rounded-lg flex flex-col overflow-hidden">
              {selectedContact ? (
                <>
                  <div className="p-4 border-b bg-muted/40 flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                      {selectedContact.firstName[0]}{selectedContact.lastName[0]}
                    </div>
                    <div>
                      <h3 className="font-medium">{selectedContact.firstName} {selectedContact.lastName}</h3>
                      <p className="text-sm text-muted-foreground">{selectedContact.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-350px)]">
                    {sortedConversation.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <MessageSquarePlus className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">No messages yet. Send a message to start the conversation.</p>
                        </div>
                      </div>
                    ) : (
                      sortedConversation.map((message: Message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.senderId === user?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p>{message.content}</p>
                            <div
                              className={`text-xs mt-1 ${
                                message.senderId === user?.id
                                  ? 'text-primary-foreground/70'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {new Date(message.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="p-4 border-t bg-background">
                    <div className="flex items-end gap-2">
                      <Textarea
                        placeholder="Type a message..."
                        className="min-h-[80px]"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center p-6">
                  <div className="text-center">
                    <CircleUser className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                    <p className="text-muted-foreground mb-4">
                      Choose a contact from the list or start a new conversation.
                    </p>
                    <Button onClick={handleNewMessage}>
                      <MessageSquarePlus className="h-4 w-4 mr-2" />
                      New Message
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
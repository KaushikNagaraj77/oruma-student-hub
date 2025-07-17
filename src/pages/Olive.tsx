import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Sparkles, 
  Send, 
  BookOpen, 
  DollarSign, 
  Scale, 
  GraduationCap,
  Copy,
  Share2,
  MessageSquareMore,
  Mic,
  Plus,
  ChevronRight
} from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  sources?: string[];
  followUps?: string[];
}

interface SuggestionCategory {
  category: string;
  icon: any;
  color: string;
  questions: string[];
}

const Olive = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);
  const { user } = useAuth();

  const suggestions: SuggestionCategory[] = [
    {
      category: "Research & Academic",
      icon: BookOpen,
      color: "from-blue-500 to-purple-500",
      questions: [
        "How do I write a literature review?",
        "Explain quantum physics in simple terms",
        "Help me cite sources in APA format",
        "What's the difference between qualitative and quantitative research?"
      ]
    },
    {
      category: "Taxes & Finance",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      questions: [
        "How do students file taxes?",
        "What education tax credits can I claim?",
        "Are scholarships taxable?",
        "Student loan interest deduction explained"
      ]
    },
    {
      category: "Legal & Rights",
      icon: Scale,
      color: "from-purple-500 to-pink-500",
      questions: [
        "What are my rights as a tenant?",
        "Understanding student loan protections",
        "Copyright law for students",
        "Employment rights for part-time workers"
      ]
    },
    {
      category: "Study & Life",
      icon: GraduationCap,
      color: "from-orange-500 to-red-500",
      questions: [
        "Create a study schedule for finals",
        "How to manage stress during exams",
        "Tips for group project collaboration",
        "Time management strategies"
      ]
    }
  ];

  const handleSendMessage = async (question?: string) => {
    const messageText = question || inputValue.trim();
    if (!messageText) return;

    setIsChatMode(true);
    setIsLoading(true);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I'd be happy to help you with "${messageText}". This is a mock response from Olive, your AI research assistant. In a real implementation, this would connect to a powerful AI service to provide comprehensive, accurate answers with proper citations and follow-up suggestions.`,
        isUser: false,
        timestamp: new Date(),
        sources: ["Academic Source 1", "Official Documentation", "Research Paper"],
        followUps: [
          "Can you explain this in more detail?",
          "What are the practical applications?",
          "Are there any alternatives to consider?"
        ]
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuestionClick = (question: string) => {
    setInputValue(question);
    handleSendMessage(question);
  };

  if (isChatMode) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Chat Header */}
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">Olive AI Assistant</h1>
                  <p className="text-sm text-muted-foreground">Your research companion</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsChatMode(false);
                  setMessages([]);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="container mx-auto px-4 py-6 pb-32">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-4 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                {!message.isUser && (
                  <Avatar className="w-8 h-8 bg-gradient-to-r from-primary to-secondary">
                    <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white">
                      <Sparkles className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[70%] ${message.isUser ? 'order-first' : ''}`}>
                  <div className={`rounded-lg px-4 py-3 ${
                    message.isUser 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-accent/30 text-foreground'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  
                  {!message.isUser && (
                    <div className="mt-3 space-y-3">
                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <Share2 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <MessageSquareMore className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      {/* Sources */}
                      {message.sources && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Sources:</p>
                          <div className="flex flex-wrap gap-2">
                            {message.sources.map((source, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {source}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Follow-ups */}
                      {message.followUps && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Ask follow-up:</p>
                          <div className="space-y-1">
                            {message.followUps.map((followUp, idx) => (
                              <Button 
                                key={idx}
                                variant="ghost" 
                                size="sm"
                                className="h-auto p-2 text-xs text-left justify-start w-full hover:bg-accent/50"
                                onClick={() => handleQuestionClick(followUp)}
                              >
                                <ChevronRight className="w-3 h-3 mr-1" />
                                {followUp}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {message.isUser && user && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4">
                <Avatar className="w-8 h-8 bg-gradient-to-r from-primary to-secondary">
                  <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white">
                    <Sparkles className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-accent/30 rounded-lg px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Input Area */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t">
          <div className="container mx-auto px-4 py-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask a follow-up question..."
                    className="pr-12"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                </div>
                <Button 
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-3xl lg:text-5xl font-bold mb-4">
              Ask <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Olive</span> Anything
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Your intelligent research and study companion
            </p>

            {/* Search Box */}
            <div className="max-w-4xl mx-auto mb-8">
              <Card className="overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-0">
                  <div className="flex">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask Olive anything - research, taxes, legal questions, study help..."
                      className="flex-1 border-0 text-lg py-6 px-6 focus-visible:ring-0"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button 
                      variant="hero"
                      size="lg"
                      className="m-2 px-8"
                      onClick={() => handleSendMessage()}
                      disabled={!inputValue.trim()}
                    >
                      <Send className="w-5 h-5 mr-2" />
                      Ask Olive
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
          <p className="text-muted-foreground">Choose a category to explore what Olive can help you with</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {suggestions.map((category) => (
            <Card key={category.category} className="hover:shadow-md transition-shadow group">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center`}>
                    <category.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg">{category.category}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {category.questions.map((question, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      className="w-full text-left justify-start h-auto p-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                      onClick={() => handleQuestionClick(question)}
                    >
                      <ChevronRight className="w-3 h-3 mr-2 flex-shrink-0" />
                      <span className="text-left">{question}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Preview */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold mb-6">Why Olive?</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-medium mb-2">Research Assistant</h4>
              <p className="text-sm text-muted-foreground">Get help with academic papers, citations, and research methodology</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-medium mb-2">Financial Guidance</h4>
              <p className="text-sm text-muted-foreground">Navigate student taxes, scholarships, and financial planning</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-medium mb-2">Study Companion</h4>
              <p className="text-sm text-muted-foreground">Create study plans, explain concepts, and improve your learning</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Olive;
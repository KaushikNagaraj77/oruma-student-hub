import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessaging } from '@/contexts/MessagingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare } from 'lucide-react';

interface MessageButtonProps {
  userId: string;
  userName: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export const MessageButton: React.FC<MessageButtonProps> = ({ 
  userId, 
  userName, 
  variant = 'outline', 
  size = 'sm',
  className = ''
}) => {
  const { user } = useAuth();
  const { startConversation, getConversationId } = useMessaging();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleMessage = () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to send messages.',
        variant: 'destructive',
      });
      navigate('/signin');
      return;
    }

    // Check if conversation already exists
    const existingConvId = getConversationId(userId);
    
    if (existingConvId) {
      navigate(`/messages/${existingConvId}`);
    } else {
      // Create new conversation
      const newConvId = startConversation(userId);
      navigate(`/messages/${newConvId}`);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleMessage}
      className={className}
    >
      <MessageSquare className="h-4 w-4 mr-2" />
      Message
    </Button>
  );
};
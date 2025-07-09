import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  // DialogDescription, // Removed as it's not used
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

import ImageUpload from "./ImageUpload";
import CaptionEditor from "./CaptionEditor";
import LocationPicker from "./LocationPicker";
import PostOptions, { PrivacySetting, PostType } from "./PostOptions";

export interface NewPostData {
  images: File[];
  caption: string;
  location: string | null;
  privacy: PrivacySetting;
  postType: PostType | null;
  isScheduled: boolean;
  author: string;
  username: string;
  university: string;
  time: string;
}

interface CreatePostModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onPostSubmit: (postData: NewPostData) => void;
  currentUser: { name: string; username: string; university: string };
}

const CreatePostModal = ({
  isOpen,
  onOpenChange,
  onPostSubmit,
  currentUser
}: CreatePostModalProps) => {
  const { toast } = useToast();

  const [images, setImages] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState<string | null>(null);
  const [customLocations, setCustomLocations] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<PrivacySetting>("public");
  const [postType, setPostType] = useState<PostType | null>(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const resetForm = () => {
    setImages([]);
    setCaption("");
    setLocation(null);
    setPrivacy("public");
    setPostType(null);
    setIsScheduled(false);
    setErrors({});
  };

  useEffect(() => {
    if (!isOpen) {
      setTimeout(resetForm, 300); // Delay to allow modal close animation
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (images.length === 0) {
      newErrors.images = "Please upload at least one image.";
    }
    if (caption.trim().length === 0) {
      newErrors.caption = "Caption cannot be empty.";
    } else if (caption.length > 500) { // Assuming CaptionEditor enforces this too
      newErrors.caption = "Caption exceeds 500 characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      // Find first error to focus, if possible, or just show toast
      const firstErrorKey = Object.keys(errors)[0];
      toast({
        title: "Heads up!",
        description: errors[firstErrorKey] || "Please check the form for errors and try again.",
        variant: "destructive",
      });
      return;
    }

    const postData: NewPostData = {
      images,
      caption,
      location,
      privacy,
      postType,
      isScheduled,
      author: currentUser.name,
      username: currentUser.username,
      university: currentUser.university,
      time: new Date().toISOString(),
    };

    onPostSubmit(postData);
    toast({
        title: "Post Created!",
        description: "Your new post is now live on the feed.",
        className: cn(
          "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0",
          "[&>button]:bg-transparent [&>button]:text-white [&>button]:border-white/20 [&>button]:hover:bg-white/10 [&>button]:hover:text-white"
        ),
        duration: 3000,
    });
    onOpenChange(false);
  };

  const handleAddCustomLocation = (newLoc: string) => {
    if (!customLocations.includes(newLoc)) {
      setCustomLocations(prev => [...prev, newLoc]);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl max-h-[90vh] flex flex-col bg-card/95 backdrop-blur-lg border-border/60 shadow-2xl rounded-lg">
        <DialogHeader className="p-4 sm:p-5 border-b border-border/60">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Create New Post
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-8 h-8">
                <X className="w-4 h-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="flex-1 grid md:grid-cols-2 gap-0 min-h-0"> {/* min-h-0 for flex child scroll */}
          {/* Left Side: Image Upload */}
          <div className="p-3 sm:p-4 md:border-r md:border-border/60 flex flex-col justify-center items-center overflow-y-auto custom-scrollbar">
            <div className="w-full max-w-sm mx-auto"> {/* Constrain width of image upload area */}
              <ImageUpload
                onImagesChange={setImages}
                maxFiles={5}
                maxSizeMb={5}
              />
              {errors.images && <p className="text-destructive text-xs mt-2 text-center">{errors.images}</p>}
            </div>
          </div>

          {/* Right Side: Form Details */}
          <div className="p-3 sm:p-4 space-y-4 overflow-y-auto custom-scrollbar">
            <div>
              <CaptionEditor
                value={caption}
                onChange={setCaption}
                maxLength={500}
                placeholder="Share your thoughts, add #hashtags @mentions..."
              />
              {errors.caption && <p className="text-destructive text-xs mt-1">{errors.caption}</p>}
            </div>

            <Separator className="my-3 sm:my-4 bg-border/60" />

            <LocationPicker
              selectedLocation={location}
              onLocationSelect={setLocation}
              customLocations={customLocations}
              onCustomLocationAdd={handleAddCustomLocation}
            />

            <Separator className="my-3 sm:my-4 bg-border/60" />

            <PostOptions
              privacy={privacy}
              onPrivacyChange={setPrivacy}
              postType={postType}
              onPostTypeChange={setPostType}
              isScheduled={isScheduled}
              onScheduledChange={setIsScheduled}
            />
          </div>
        </div>

        <DialogFooter className="p-3 sm:p-4 border-t border-border/60 flex flex-col sm:flex-row sm:justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            variant="hero"
            size="lg"
            className="w-full sm:w-auto"
            disabled={images.length === 0 || caption.trim().length === 0 || Object.keys(errors).length > 0}
          >
            Share Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;

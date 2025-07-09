import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Globe, Users, BookOpen, CalendarDays, Utensils, Trophy, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type PrivacySetting = "public" | "friends" | "group";
export type PostType = "study" | "event" | "food" | "achievement" | "other";

interface PostOptionsProps {
  privacy: PrivacySetting;
  onPrivacyChange: (privacy: PrivacySetting) => void;
  postType: PostType | null;
  onPostTypeChange: (postType: PostType | null) => void;
  isScheduled: boolean;
  onScheduledChange: (isScheduled: boolean) => void;
  // scheduledDateTime: Date | null; // For future use
  // onScheduledDateTimeChange: (date: Date | null) => void; // For future use
}

const privacyOptions = [
  { value: "public", label: "Public", icon: <Globe className="w-4 h-4 mr-2" /> },
  { value: "friends", label: "Friends", icon: <Users className="w-4 h-4 mr-2" /> },
  { value: "group", label: "Study Group Only", icon: <BookOpen className="w-4 h-4 mr-2" /> }, // Example
];

const postTypeTags: { value: PostType, label: string, icon: React.ReactNode }[] = [
  { value: "study", label: "Study", icon: <BookOpen className="w-3 h-3" /> },
  { value: "event", label: "Event", icon: <CalendarDays className="w-3 h-3" /> },
  { value: "food", label: "Food", icon: <Utensils className="w-3 h-3" /> },
  { value: "achievement", label: "Achievement", icon: <Trophy className="w-3 h-3" /> },
  { value: "other", label: "Other", icon: <Globe className="w-3 h-3" /> },
];


const PostOptions = ({
  privacy,
  onPrivacyChange,
  postType,
  onPostTypeChange,
  isScheduled,
  onScheduledChange,
}: PostOptionsProps) => {

  const handlePostTypeToggle = (value: string) => {
    if (value) {
      onPostTypeChange(value as PostType);
    } else {
      // If value is empty, it means it was deselected.
      // Depending on desired behavior, you might want to allow deselecting or keep one selected.
      // For now, let's allow full deselect by passing null.
      onPostTypeChange(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Privacy Settings */}
      <div>
        <Label className="text-base font-medium text-foreground mb-2 block">Privacy</Label>
        <RadioGroup
          value={privacy}
          onValueChange={(value) => onPrivacyChange(value as PrivacySetting)}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {privacyOptions.map((option) => (
            <Label
              key={option.value}
              htmlFor={`privacy-${option.value}`}
              className={cn(
                "flex items-center space-x-2 rounded-lg border p-3 cursor-pointer transition-all",
                "hover:border-primary/60 hover:bg-primary/5",
                privacy === option.value && "border-primary ring-2 ring-primary/50 bg-primary/10"
              )}
            >
              <RadioGroupItem value={option.value} id={`privacy-${option.value}`} className="sr-only" />
              {option.icon}
              <span className={cn("font-medium", privacy === option.value && "text-primary")}>{option.label}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      {/* Post Type Tags */}
      <div>
        <Label className="text-base font-medium text-foreground mb-2 block">Tag Post As</Label>
        <ToggleGroup
          type="single" // Allows only one to be selected, or none
          value={postType || ""} // Ensure value is a string for ToggleGroup
          onValueChange={handlePostTypeToggle}
          className="flex flex-wrap gap-2"
        >
          {postTypeTags.map((tag) => (
            <ToggleGroupItem
              key={tag.value}
              value={tag.value}
              aria-label={`Tag as ${tag.label}`}
              className={cn(
                "data-[state=on]:bg-primary/20 data-[state=on]:text-primary hover:bg-muted/80",
                "border border-input rounded-full px-3 py-1.5 text-sm flex items-center gap-1.5"
              )}
            >
              {tag.icon}
              {tag.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Schedule Post */}
      <div>
        <Label className="text-base font-medium text-foreground mb-2 block">Schedule Post</Label>
        <div className="flex items-center space-x-3 p-3 border rounded-lg hover:border-muted-foreground/50 transition-colors">
          <Switch
            id="schedule-post"
            checked={isScheduled}
            onCheckedChange={onScheduledChange}
          />
          <Label htmlFor="schedule-post" className="flex items-center cursor-pointer">
            <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
            <span>Post later</span>
          </Label>
        </div>
        {isScheduled && (
          <div className="mt-3 p-3 bg-muted/30 rounded-md text-sm text-muted-foreground">
            {/* Placeholder for date/time picker */}
            Scheduling options will appear here in a future update. For now, this toggle indicates intent.
          </div>
        )}
      </div>
    </div>
  );
};

export default PostOptions;

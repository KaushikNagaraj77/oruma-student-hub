import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Upload, X, ImagePlus, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useEvents } from "@/contexts/EventsContext";

interface CreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const eventCategories = [
  "Academic", "Social", "Sports", "Workshop", "Networking", "Career", "Cultural", "Other"
];

export const CreateEventModal = ({ open, onOpenChange }: CreateEventModalProps) => {
  const { toast } = useToast();
  const { createEvent } = useEvents();
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [eventDate, setEventDate] = useState<Date>();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    startTime: "",
    endTime: "",
    capacity: "",
    registrationRequired: "true"
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Generate time options for dropdowns
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) { // 15-minute intervals
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        times.push({ value: timeString, label: displayTime });
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Get filtered time options for end time (must be after start time)
  const getEndTimeOptions = () => {
    if (!formData.startTime) return timeOptions;
    
    const startTimeIndex = timeOptions.findIndex(time => time.value === formData.startTime);
    if (startTimeIndex === -1) return timeOptions;
    
    // Return times that are at least 15 minutes after start time
    return timeOptions.slice(startTimeIndex + 1);
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      setFormData({
        title: "",
        description: "",
        category: "",
        location: "",
        startTime: "",
        endTime: "",
        capacity: "",
        registrationRequired: "true"
      });
      setBannerImage(null);
      setEventDate(undefined);
      setErrors({});
      setHasSubmitted(false);
    } else {
      // Set default times when modal opens (if not already set)
      const now = new Date();
      const nextHour = new Date(now);
      nextHour.setHours(now.getHours() + 1, 0, 0, 0);
      const twoHoursLater = new Date(nextHour);
      twoHoursLater.setHours(nextHour.getHours() + 1);
      
      const defaultStartTime = `${nextHour.getHours().toString().padStart(2, '0')}:00`;
      const defaultEndTime = `${twoHoursLater.getHours().toString().padStart(2, '0')}:00`;
      
      setFormData(prev => ({
        ...prev,
        startTime: prev.startTime || defaultStartTime,
        endTime: prev.endTime || defaultEndTime
      }));
    }
  }, [open]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerImage(file);
    }
  };

  const removeBannerImage = () => {
    setBannerImage(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Only clear errors if the user has attempted to submit
    if (hasSubmitted && errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = "Event title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!eventDate) newErrors.date = "Event date is required";
    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";
    if (!formData.capacity.trim()) newErrors.capacity = "Capacity is required";
    if (isNaN(Number(formData.capacity)) || Number(formData.capacity) <= 0) {
      newErrors.capacity = "Please enter a valid capacity";
    }

    // Validate time order
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = "End time must be after start time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate form in real-time after first submission attempt
  useEffect(() => {
    if (hasSubmitted) {
      validateForm();
    }
  }, [formData, eventDate, hasSubmitted]);

  // Clear end time if it becomes invalid when start time changes
  useEffect(() => {
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      setFormData(prev => ({ ...prev, endTime: "" }));
    }
  }, [formData.startTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    
    if (!validateForm()) {
      toast({
        title: "Please fix the errors",
        description: "Check all required fields and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        date: eventDate!.toISOString().split('T')[0], // Convert to ISO date string
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        capacity: parseInt(formData.capacity),
        registrationRequired: formData.registrationRequired === "true",
        bannerImage: bannerImage || undefined,
      };

      await createEvent(eventData);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        location: "",
        startTime: "",
        endTime: "",
        capacity: "",
        registrationRequired: "true"
      });
      setBannerImage(null);
      setEventDate(undefined);
      setErrors({});
      setHasSubmitted(false);
      onOpenChange(false);
    } catch (error) {
      // Error is already handled by the context
      console.error('Failed to create event:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Create New Event
          </DialogTitle>
          <DialogDescription>
            Organize an event for your university community. All details will be visible to fellow students.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Banner Image Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Event Banner</Label>
            {bannerImage ? (
              <Card className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={URL.createObjectURL(bannerImage)}
                  alt="Event banner"
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeBannerImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </Card>
            ) : (
              <Card className="aspect-[16/9] border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
                <CardContent className="p-0 h-full">
                  <label className="flex flex-col items-center justify-center h-full cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <ImagePlus className="h-12 w-12 text-muted-foreground mb-4" />
                    <span className="text-sm text-muted-foreground text-center">
                      Upload event banner image<br/>
                      <span className="text-xs">(Recommended: 1200x675px)</span>
                    </span>
                  </label>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Python Workshop for Beginners"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {eventCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity *</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="50"
                value={formData.capacity}
                onChange={(e) => handleInputChange("capacity", e.target.value)}
                className={errors.capacity ? "border-destructive" : ""}
              />
              {errors.capacity && <p className="text-sm text-destructive">{errors.capacity}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your event, what attendees will learn or experience, and any requirements..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={`min-h-[120px] ${errors.description ? "border-destructive" : ""}`}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Event Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !eventDate && "text-muted-foreground",
                      errors.date && "border-destructive"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {eventDate ? format(eventDate, "PPP") : <span>Pick date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={eventDate}
                    onSelect={setEventDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
            </div>

            <div className="space-y-2">
              <Label>Start Time *</Label>
              <Select 
                value={formData.startTime} 
                onValueChange={(value) => handleInputChange("startTime", value)}
              >
                <SelectTrigger className={errors.startTime ? "border-destructive" : ""}>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select start time" />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {timeOptions.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.startTime && <p className="text-sm text-destructive">{errors.startTime}</p>}
            </div>

            <div className="space-y-2">
              <Label>End Time *</Label>
              <Select 
                value={formData.endTime} 
                onValueChange={(value) => handleInputChange("endTime", value)}
              >
                <SelectTrigger className={errors.endTime ? "border-destructive" : ""}>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select end time" />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {getEndTimeOptions().map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.endTime && <p className="text-sm text-destructive">{errors.endTime}</p>}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="e.g., Main Auditorium, Computer Science Building"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className={`pl-10 ${errors.location ? "border-destructive" : ""}`}
              />
            </div>
            {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
          </div>

          {/* Registration Settings */}
          <div className="space-y-2">
            <Label>Registration Required</Label>
            <Select value={formData.registrationRequired} onValueChange={(value) => handleInputChange("registrationRequired", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes - Students must register</SelectItem>
                <SelectItem value="false">No - Open to all</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero">
              <Upload className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
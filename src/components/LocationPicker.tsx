import * as React from "react";
import { MapPin, Check, ChevronsUpDown, PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface Location {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

const popularLocations: Location[] = [
  { value: "library", label: "Library" },
  { value: "dining_hall", label: "Dining Hall" },
  { value: "student_center", label: "Student Center" },
  { value: "quad", label: "Main Quad" },
  { value: "rec_center", label: "Recreation Center" },
  { value: "engineering_bldg", label: "Engineering Building" },
  { value: "arts_complex", label: "Arts Complex" },
  // Add more common locations
];

interface LocationPickerProps {
  selectedLocation: string | null;
  onLocationSelect: (locationValue: string | null) => void;
  customLocations?: string[]; // Allow passing in user-added custom locations
  onCustomLocationAdd?: (locationValue: string) => void; // Callback when a new custom one is made
}

const LocationPicker = ({
  selectedLocation,
  onLocationSelect,
  customLocations = [],
  onCustomLocationAdd
}: LocationPickerProps) => {
  const [open, setOpen] = React.useState(false);
  const [showCustomInput, setShowCustomInput] = React.useState(false);
  const [customLocationInput, setCustomLocationInput] = React.useState("");

  const allLocations: Location[] = [
    ...popularLocations,
    ...customLocations.map(loc => ({ value: loc.toLowerCase().replace(/\s+/g, "_"), label: loc }))
  ];

  const handleSelectLocation = (locationValue: string) => {
    onLocationSelect(locationValue);
    setOpen(false);
    setShowCustomInput(false);
    setCustomLocationInput("");
  };

  const handleAddCustomLocation = () => {
    if (customLocationInput.trim() !== "") {
      const newLocationValue = customLocationInput.trim();
      if (onCustomLocationAdd) {
        onCustomLocationAdd(newLocationValue);
      }
      onLocationSelect(newLocationValue.toLowerCase().replace(/\s+/g, "_")); // Use a generated value or the label itself
      setOpen(false);
      setShowCustomInput(false);
      setCustomLocationInput("");
    }
  };

  const currentSelection = allLocations.find(loc => loc.value === selectedLocation);

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-muted-foreground hover:text-foreground"
          >
            <div className="flex items-center">
              <MapPin className={cn("mr-2 h-4 w-4", currentSelection ? "text-primary" : "")} />
              {currentSelection?.label || "Select campus location..."}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Search location or add new..." />
            <CommandList>
              <CommandEmpty>
                {showCustomInput ? "Press Enter to add this location." : "No location found. Try adding a custom one."}
              </CommandEmpty>
              <CommandGroup heading="Popular Locations">
                {popularLocations.map((location) => (
                  <CommandItem
                    key={location.value}
                    value={location.label} // Use label for searchability
                    onSelect={() => handleSelectLocation(location.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedLocation === location.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {location.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              {customLocations.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Custom Locations">
                  {customLocations.map((locStr) => {
                    const locValue = locStr.toLowerCase().replace(/\s+/g, "_");
                    return (
                      <CommandItem
                        key={locValue}
                        value={locStr}
                        onSelect={() => handleSelectLocation(locValue)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedLocation === locValue ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {locStr}
                      </CommandItem>
                    );
                  })}
                  </CommandGroup>
                </>
              )}
              <CommandSeparator />
              <CommandGroup>
                {showCustomInput ? (
                  <div className="p-2">
                    <Input
                      autoFocus
                      placeholder="Enter custom location"
                      value={customLocationInput}
                      onChange={(e) => setCustomLocationInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddCustomLocation();
                        }
                        if (e.key === "Escape") {
                           setShowCustomInput(false);
                           setCustomLocationInput("");
                        }
                      }}
                      className="h-9"
                    />
                     <Button size="sm" variant="ghost" className="w-full mt-2 text-xs" onClick={handleAddCustomLocation}>
                        Add "{customLocationInput}"
                     </Button>
                  </div>
                ) : (
                  <CommandItem
                    onSelect={() => {
                      setShowCustomInput(true);
                      // CommandInput keeps focus, so we don't need to manually focus the new Input
                    }}
                    className="text-primary hover:bg-muted/50 cursor-pointer"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Custom Location
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LocationPicker;

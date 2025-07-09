import { useState, useCallback } from "react";
import { UploadCloud, X, ChevronLeft, ChevronRight, ImagePlus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";

interface ImageUploadProps {
  onImagesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMb?: number;
}

interface ImagePreviewFile extends File {
  preview: string;
  id: string;
}

const ImageUpload = ({ onImagesChange, maxFiles = 5, maxSizeMb = 5 }: ImageUploadProps) => {
  const [imageFiles, setImageFiles] = useState<ImagePreviewFile[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((acceptedFiles: File[]) => {
    setError(null);
    let newImageFilesArray: ImagePreviewFile[] = [...imageFiles];
    let filesAddedCount = 0;

    for (const file of acceptedFiles) {
      if (newImageFilesArray.length >= maxFiles) {
        setError(`You can upload a maximum of ${maxFiles} images.`);
        break;
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        setError(`File "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the ${maxSizeMb}MB size limit.`);
        continue;
      }
      if (!file.type.startsWith("image/")) {
        setError(`File "${file.name}" is not a valid image type.`);
        continue;
      }

      newImageFilesArray.push(Object.assign(file, {
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substring(7) + Date.now(),
      }));
      filesAddedCount++;
    }

    if (filesAddedCount > 0) {
        setImageFiles(newImageFilesArray);
        onImagesChange(newImageFilesArray.map(f => f as File));
        if (newImageFilesArray.length > 0 && currentImageIndex >= newImageFilesArray.length) {
          setCurrentImageIndex(newImageFilesArray.length - 1);
        }
    } else if (acceptedFiles.length > 0 && !error) {
        // This case might happen if all files were filtered out by size/type but no explicit error was set for the *last* file.
        // setError("No valid files were selected or files exceed limits.");
    }

  }, [imageFiles, maxFiles, maxSizeMb, onImagesChange, currentImageIndex]);


  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    handleFiles(acceptedFiles);
    if (rejectedFiles && rejectedFiles.length > 0) {
        // Prioritize error from handleFiles if one was set there for a specific file.
        // Otherwise, set a general error for rejected files by react-dropzone.
        if(!error) {
            const firstRejection = rejectedFiles[0];
            const firstError = firstRejection.errors[0];
            if (firstError.code === 'file-too-large') {
                setError(`File "${firstRejection.file.name}" is too large. Max ${maxSizeMb}MB.`);
            } else if (firstError.code === 'file-invalid-type') {
                setError(`File "${firstRejection.file.name}" has an invalid type.`);
            } else if (firstError.code === 'too-many-files') {
                setError(`Cannot upload more than ${maxFiles} files.`);
            } else {
                setError(firstError.message || "Some files could not be uploaded.");
            }
        }
    }
  }, [handleFiles, maxFiles, maxSizeMb, error]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    maxSize: maxSizeMb * 1024 * 1024,
    // maxFiles: maxFiles, // react-dropzone's maxFiles handled in onDrop for more granular control
    noClick: true,
    noKeyboard: true,
  });

  const handleRemoveImage = (idToRemove: string) => {
    const updatedFiles = imageFiles.filter(file => file.id !== idToRemove);
    setImageFiles(updatedFiles);
    onImagesChange(updatedFiles.map(f => f as File));
    if (currentImageIndex >= updatedFiles.length && updatedFiles.length > 0) {
      setCurrentImageIndex(updatedFiles.length - 1);
    } else if (updatedFiles.length === 0) {
      setCurrentImageIndex(0);
      setError(null); // Clear error when all images are removed
    }
  };

  const nextImage = () => {
    if (imageFiles.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % imageFiles.length);
    }
  };

  const prevImage = () => {
     if (imageFiles.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + imageFiles.length) % imageFiles.length);
    }
  };

  // Clean up object URLs
  useEffect(() => {
    return () => {
      imageFiles.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [imageFiles]);


  if (imageFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 h-full">
        <div
          {...getRootProps()}
          className={cn(
            "w-full border-2 border-dashed border-border/70 rounded-xl p-8 text-center cursor-pointer transition-colors aspect-square flex flex-col items-center justify-center",
            "hover:border-primary/70 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isDragActive && "border-primary bg-primary/10"
          )}
          tabIndex={0} // Make it focusable
        >
          <input {...getInputProps()} />
          <UploadCloud className="w-16 h-16 text-primary/70 mb-3" />
          <p className="text-lg font-medium text-foreground">
            {isDragActive ? "Drop images here..." : "Drag & drop images"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
        </div>
        <Button type="button" variant="outline" onClick={open} className="gap-2 w-full sm:w-auto">
            <ImagePlus className="w-4 h-4" />
            Choose Files
        </Button>
        <p className="text-xs text-muted-foreground px-2 text-center">Max {maxFiles} images, up to {maxSizeMb}MB each. Supports JPG, PNG, GIF, WEBP.</p>
        {error && (
            <div className="flex items-center text-destructive text-sm mt-2 p-2 bg-destructive/10 border border-destructive/30 rounded-md">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                <span>{error}</span>
            </div>
        )}
      </div>
    );
  }

  // Image Preview and Carousel
  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center text-destructive text-sm p-2 bg-destructive/10 border border-destructive/30 rounded-md">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            <span>{error}</span>
        </div>
      )}
      <div {...getRootProps({ onClick: e => e.preventDefault() })} className="relative group aspect-square bg-muted/30 rounded-xl overflow-hidden border border-border/50">
        <input {...getInputProps()} />
        {imageFiles.length > 0 && (
          <img
            src={imageFiles[currentImageIndex].preview}
            alt={`Preview ${imageFiles[currentImageIndex].name} ${currentImageIndex + 1}`}
            className="w-full h-full object-contain transition-opacity duration-300"
          />
        )}

        <Button
          type="button"
          variant="destructive"
          size="icon"
          aria-label="Remove current image"
          className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all rounded-full w-7 h-7 sm:w-8 sm:h-8"
          onClick={() => handleRemoveImage(imageFiles[currentImageIndex].id)}
        >
          <X className="w-4 h-4" />
        </Button>

        {imageFiles.length > 1 && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Previous image"
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Next image"
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5" />
            </Button>
          </>
        )}

        {imageFiles.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10" aria-label="Image pagination">
            {imageFiles.map((file, index) => (
              <button
                key={file.id}
                type="button"
                aria-label={`Go to image ${index + 1}`}
                onClick={() => setCurrentImageIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300 ease-in-out",
                  index === currentImageIndex ? "bg-primary scale-125" : "bg-white/50 hover:bg-white/80"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {imageFiles.length < maxFiles && (
         <div className="flex items-center justify-center pt-1">
            <Button type="button" variant="secondary" onClick={open} className="gap-2 w-full sm:w-auto text-sm py-2 h-auto">
                <ImagePlus className="w-3.5 h-3.5" />
                Add or Change Images
            </Button>
         </div>
      )}
    </div>
  );
};

export default ImageUpload;

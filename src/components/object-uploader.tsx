"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, FileImage, FileText, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ObjectUploaderProps {
  onUploadComplete?: (url: string) => void;
  accept?: string;
  maxFileSize?: number;
  buttonText?: string;
  currentFileUrl?: string | null;
  onRemove?: () => void;
}

export function ObjectUploader({
  onUploadComplete,
  accept = "image/*,.pdf",
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  buttonText = "+ Upload Bukti",
  currentFileUrl,
  onRemove,
}: ObjectUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileType, setUploadedFileType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxFileSize) {
      toast({
        title: "File terlalu besar",
        description: `Ukuran maksimal file adalah ${Math.round(maxFileSize / 1024 / 1024)}MB`,
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Jenis file tidak didukung",
        description: "Hanya file gambar (JPG, PNG, GIF, WebP) dan PDF yang diperbolehkan",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Get presigned URL from server
      const response = await fetch("/api/objects/upload", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get upload URL");
      }

      const { uploadURL } = await response.json();

      // Upload file directly to storage
      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      // Extract the file path from the presigned URL
      const url = new URL(uploadURL);
      const objectPath = url.pathname;

      setUploadedFileName(file.name);
      setUploadedFileType(file.type);

      // Notify parent component
      onUploadComplete?.(objectPath);

      toast({
        title: "Upload berhasil",
        description: `File "${file.name}" berhasil diupload`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload gagal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    setUploadedFileName(null);
    setUploadedFileType(null);
    onRemove?.();
  };

  const hasUploadedFile = uploadedFileName || currentFileUrl;

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-upload"
      />
      
      {hasUploadedFile ? (
        <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
          {uploadedFileType?.startsWith("image/") || currentFileUrl?.includes("image") ? (
            <FileImage className="h-4 w-4 text-blue-500" />
          ) : (
            <FileText className="h-4 w-4 text-orange-500" />
          )}
          <span className="flex-1 text-sm truncate">
            {uploadedFileName || "File bukti"}
          </span>
          <CheckCircle className="h-4 w-4 text-green-500" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleRemove}
            data-testid="button-remove-file"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full"
          data-testid="button-upload-proof"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Mengupload...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              {buttonText}
            </>
          )}
        </Button>
      )}
    </div>
  );
}

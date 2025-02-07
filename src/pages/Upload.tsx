
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, Scan, Play } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Upload = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [lidarFile, setLidarFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUpload = async () => {
    try {
      setIsUploading(true);

      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload assets",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Prepare form data
      const formData = new FormData();
      if (videoFile) formData.append("video", videoFile);
      if (lidarFile) formData.append("lidar", lidarFile);
      formData.append("title", title);
      formData.append("description", description);

      // Call upload function
      const response = await fetch("/functions/v1/upload-asset", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload asset");
      }

      toast({
        title: "Success!",
        description: "Your asset has been uploaded and is pending validation.",
      });

      // Navigate to dashboard or validation page
      navigate("/");
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Document Your Asset</h1>

        <div className="space-y-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Asset Details</CardTitle>
              <CardDescription>
                Provide information about your asset
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <Input
                    id="title"
                    placeholder="Enter asset title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Describe your asset"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        
          <div className="grid md:grid-cols-2 gap-6">
            {/* Video Upload Card */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Video Documentation
                </CardTitle>
                <CardDescription>
                  Upload a video showcasing your asset from multiple angles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                    {videoFile ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">{videoFile.name}</p>
                        <Button 
                          variant="outline"
                          onClick={() => setVideoFile(null)}
                        >
                          Remove Video
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div>
                          <label htmlFor="video-upload" className="cursor-pointer">
                            <Input
                              id="video-upload"
                              type="file"
                              className="hidden"
                              accept="video/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setVideoFile(file);
                              }}
                            />
                            <Button variant="outline">Select Video</Button>
                          </label>
                        </div>
                        <p className="text-sm text-gray-500">
                          Upload a video file (MP4, MOV, etc.)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LiDAR Scan Card */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="w-5 h-5" />
                  LiDAR Scan
                </CardTitle>
                <CardDescription>
                  Upload LiDAR scan data of your asset
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                    {lidarFile ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">{lidarFile.name}</p>
                        <Button 
                          variant="outline"
                          onClick={() => setLidarFile(null)}
                        >
                          Remove Scan
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Scan className="mx-auto h-12 w-12 text-gray-400" />
                        <div>
                          <label htmlFor="lidar-upload" className="cursor-pointer">
                            <Input
                              id="lidar-upload"
                              type="file"
                              className="hidden"
                              accept=".ply,.pts,.xyz"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setLidarFile(file);
                              }}
                            />
                            <Button variant="outline">Select Scan File</Button>
                          </label>
                        </div>
                        <p className="text-sm text-gray-500">
                          Upload LiDAR scan data (PLY, PTS, XYZ formats)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 flex justify-end">
            <Button 
              size="lg"
              disabled={(!videoFile && !lidarFile) || !title || isUploading}
              onClick={handleUpload}
              className="bg-primary hover:bg-primary/90"
            >
              {isUploading ? "Uploading..." : "Upload Asset"}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Upload;

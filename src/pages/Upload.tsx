
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, Scan, Play } from "lucide-react";
import { useState } from "react";

const Upload = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [lidarFile, setLidarFile] = useState<File | null>(null);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Document Your Asset</h1>
        
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
            disabled={!videoFile && !lidarFile}
            className="bg-accent hover:bg-accent/90"
          >
            Continue to Validation
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Upload;

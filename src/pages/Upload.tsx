
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, Scan, Play, Camera } from "lucide-react";
import { useState, useRef, useEffect } from "react";
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    analysis: string;
    estimatedValue: number | null;
    confidenceScore: number;
  } | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let stream: MediaStream | null = null;

    const setupCamera = async () => {
      try {
        if (showCamera && videoRef.current) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }, // Use rear camera
            audio: false
          });
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        toast({
          title: "Camera Error",
          description: "Unable to access the camera. Please check permissions.",
          variant: "destructive",
        });
      }
    };

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showCamera]);

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg');
    setIsAnalyzing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to analyze assets",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const response = await fetch(`${supabase.functions.url}/analyze-asset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const analysisResult = await response.json();
      setAiAnalysis(analysisResult);
      
      if (analysisResult.analysis) {
        setDescription(prev => 
          prev ? `${prev}\n\nAI Analysis:\n${analysisResult.analysis}` : 
          `AI Analysis:\n${analysisResult.analysis}`
        );
      }

      toast({
        title: "Analysis Complete",
        description: "AI has analyzed your asset. Review the suggested description below.",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setShowCamera(false);
    }
  };

  const handleUpload = async () => {
    try {
      setIsUploading(true);

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

      let videoPath, lidarPath;

      if (videoFile) {
        const videoExt = videoFile.name.split('.').pop();
        videoPath = `${crypto.randomUUID()}.${videoExt}`;
        const { error: videoUploadError } = await supabase.storage
          .from('asset_videos')
          .upload(videoPath, videoFile);

        if (videoUploadError) {
          throw new Error(`Failed to upload video: ${videoUploadError.message}`);
        }
      }

      if (lidarFile) {
        const lidarExt = lidarFile.name.split('.').pop();
        lidarPath = `${crypto.randomUUID()}.${lidarExt}`;
        const { error: lidarUploadError } = await supabase.storage
          .from('asset_lidar')
          .upload(lidarPath, lidarFile);

        if (lidarUploadError) {
          throw new Error(`Failed to upload LiDAR scan: ${lidarUploadError.message}`);
        }
      }

      // Create asset record
      const { data: asset, error: assetError } = await supabase
        .from('assets')
        .insert({
          title: title || 'Untitled Asset',
          description,
          video_path: videoPath,
          lidar_path: lidarPath,
          status: 'pending',
          validation_status: 'pending',
          user_id: session.user.id
        })
        .select()
        .single();

      if (assetError) {
        throw new Error(`Failed to create asset record: ${assetError.message}`);
      }

      // Store AI analysis if available
      if (aiAnalysis && asset) {
        const { error: analysisError } = await supabase
          .from('asset_analysis')
          .insert({
            asset_id: asset.id,
            analysis_text: aiAnalysis.analysis,
            estimated_value: aiAnalysis.estimatedValue,
            confidence_score: aiAnalysis.confidenceScore,
            user_id: session.user.id
          });

        if (analysisError) {
          console.error('Failed to save analysis:', analysisError);
        }
      }

      toast({
        title: "Success!",
        description: "Your asset has been uploaded and is pending validation.",
      });

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
          {showCamera ? (
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Capture Asset Image</CardTitle>
                <CardDescription>
                  Position your asset in the frame and capture an image for AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={() => setShowCamera(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={captureImage}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? "Analyzing..." : "Capture & Analyze"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              onClick={() => setShowCamera(true)}
              className="w-full"
              size="lg"
            >
              <Camera className="mr-2 h-5 w-5" />
              Open Camera for AI Analysis
            </Button>
          )}

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
                    className="min-h-[150px]"
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

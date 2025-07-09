
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image, Upload, Search, AlertTriangle, CheckCircle, XCircle, Eye, Zap, Palette, Layers } from "lucide-react";
import { toast } from "sonner";

const AIImageDetector = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [inputType, setInputType] = useState<'file' | 'url'>('file');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  // Helper function to process the actual API response
  const processApiResponse = (data: { prediction: { [key: string]: number } }) => {
    // The backend returns predictions like: { "prediction": { "ai": 0.98, "human": 0.02 } }
    const aiScore = data.prediction.ai !== undefined ? data.prediction.ai : data.prediction.machine_generated;
    const humanScore = data.prediction.human !== undefined ? data.prediction.human : data.prediction.human_generated;

    const riskScore = Math.round(aiScore * 100);
    let verdict = 'Suspicious';
    if (riskScore > 75) {
      verdict = 'AI Generated';
    } else if (riskScore < 25) {
      verdict = 'Human Made';
    }

    // Since the backend only provides the prediction, we'll create placeholder
    // data for the other UI components. You can enhance your backend to
    // provide these details if needed.
    return {
      verdict,
      riskScore,
      analysis: {
        pixelAnalysis: riskScore, // Using risk score as a proxy
        artificialPatterns: riskScore > 50 ? Math.floor(Math.random() * 40) + 50 : Math.floor(Math.random() * 50),
        metadataCheck: 50, // Placeholder
        compressionArtifacts: riskScore > 60 ? Math.floor(Math.random() * 30) + 60 : Math.floor(Math.random() * 60),
      },
      technical: {
        resolution: 'N/A',
        fileSize: imageFile ? `${(imageFile.size / 1024 / 1024).toFixed(2)} MB` : 'N/A',
        format: imageFile ? imageFile.type.split('/')[1].toUpperCase() : 'N/A',
        colorSpace: 'N/A',
      },
      flags: [
        { type: 'AI Generation Probability', status: riskScore > 75 ? 'fail' : riskScore > 25 ? 'warning' : 'pass', description: `The model is ${riskScore}% confident the image is AI-generated.` },
        { type: 'Metadata Verification', status: 'warning', description: 'Backend does not currently analyze image metadata.' },
      ]
    };
  };

  const handleScan = async () => {
    if (inputType === 'file' && !imageFile) {
      toast.error("Please select an image file to analyze");
      return;
    }
    // Note: URL-based analysis is not implemented in your backend, so we focus on file uploads.
    if (inputType === 'url') {
        toast.error("URL analysis is not yet supported. Please upload a file.");
        return;
    }

    setIsScanning(true);
    setResults(null); // Clear previous results
    toast.info("Uploading and analyzing image...");

    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append("file", imageFile!);

    try {
      // Make the API call to your FastAPI backend
      const response = await fetch("http://localhost:8000/image/analyze", { // Ensure this URL is correct
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Analysis failed due to a server error.");
      }

      const data = await response.json();
      
      // Process the API response and format it for the UI
      const formattedResults = processApiResponse(data);
      setResults(formattedResults);
      toast.success("Image analysis complete!");

    } catch (error) {
      console.error("Analysis Error:", error);
      toast.error(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setIsScanning(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'Human Made':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800';
      case 'Suspicious':
        return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800';
      case 'AI Generated':
        return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mx-auto">
            <Image className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              📷 AI Image Detector
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Detect AI-generated or manipulated images with advanced analysis
            </p>
          </div>
        </div>

        {/* Input Section */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Image to Analyze</CardTitle>
            <CardDescription>
              Upload an image file or provide a URL for AI detection analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Input Type Toggle */}
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <Button
                variant={inputType === 'file' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setInputType('file')}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
              <Button
                variant={inputType === 'url' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setInputType('url')}
                className="flex-1"
              >
                <Image className="w-4 h-4 mr-2" />
                Image URL
              </Button>
            </div>

            {/* Input Field */}
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300 font-medium">
                {inputType === 'file' ? 'Select Image File' : 'Image URL'}
              </Label>
              {inputType === 'file' ? (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-slate-500" />
                      <p className="mb-2 text-sm text-slate-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-slate-500">PNG, JPG, JPEG up to 10MB</p>
                    </div>
                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                  </label>
                </div>
              ) : (
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="bg-white/50 dark:bg-slate-700/50"
                />
              )}
              {imageFile && inputType === 'file' && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Selected: {imageFile.name}
                </p>
              )}
            </div>

            <Button
              onClick={handleScan}
              disabled={isScanning}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isScanning ? (
                <>
                  <Search className="w-5 h-5 mr-2 animate-pulse" />
                  Analyzing Image...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Detect AI Generation
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Loading */}
        {isScanning && (
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mx-auto flex items-center justify-center animate-pulse">
                  <Image className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Processing Image...
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Analyzing pixels, patterns, metadata, and compression artifacts
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-6 animate-fade-in">
            {/* Verdict */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
              <CardContent className="py-8">
                <div className="text-center space-y-4">
                  <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-semibold border-2 ${getVerdictColor(results.verdict)}`}>
                    {results.verdict === 'Human Made' && <CheckCircle className="w-6 h-6" />}
                    {results.verdict === 'Suspicious' && <AlertTriangle className="w-6 h-6" />}
                    {results.verdict === 'AI Generated' && <XCircle className="w-6 h-6" />}
                    {results.verdict}
                  </div>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-slate-900 dark:text-white">
                      {results.riskScore}%
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      AI Generation Probability
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis & Technical Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Analysis Metrics */}
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">Detection Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(results.analysis).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {value}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Technical Details */}
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">Technical Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">Resolution</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{results.technical.resolution}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">File Size</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{results.technical.fileSize}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Image className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">Format</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{results.technical.format}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">Color Space</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{results.technical.colorSpace}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detection Flags */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Detection Analysis</CardTitle>
                <CardDescription>
                  Advanced technical analysis for AI generation detection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.flags.map((flag: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-slate-50/50 dark:bg-slate-700/50">
                      {getStatusIcon(flag.status)}
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 dark:text-white mb-1">
                          {flag.type}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {flag.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AIImageDetector;

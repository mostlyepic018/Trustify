import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Link2, Search, AlertTriangle, CheckCircle, XCircle, Globe, Calendar, User, Eye } from "lucide-react";
import { toast } from "sonner";

const FakeNewsDetector = () => {
  const [inputType, setInputType] = useState<'url' | 'text'>('url');
  const [inputValue, setInputValue] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleScan = async () => {
    if (!inputValue.trim()) {
      toast.error("Please enter a URL or text to analyze");
      return;
    }

    setIsScanning(true);
    toast.info("Starting fake news analysis...");

    try {
      const response = await fetch("http://localhost:8000/news/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: inputValue })
      });
      if (!response.ok) {
        throw new Error("Failed to verify news");
      }
      const data = await response.json();
      // Map backend response to frontend format
      const verificationResult = data.result;
      let parsedResult;
      try {
        if (typeof verificationResult === 'string') {
          // Try to find the first JSON object in the string (in case Gemini returns text + JSON)
          const match = verificationResult.match(/\{[\s\S]*\}/);
          if (match) {
            parsedResult = JSON.parse(match[0]);
          } else {
            parsedResult = { status: 'error', verification_result: verificationResult };
          }
        } else {
          parsedResult = verificationResult;
        }
      } catch (e) {
        parsedResult = { status: 'error', verification_result: 'Could not parse verification result.' };
      }
      setResults(parsedResult);
      toast.success("Analysis complete!");
    } catch (error) {
      toast.error("Failed to verify news. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'Safe':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800';
      case 'Suspicious':
        return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800';
      case 'Fake':
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
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              📰 Fake News Detector
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Analyze news articles and content for misinformation and bias
            </p>
          </div>
        </div>

        {/* Input Section */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Content to Analyze</CardTitle>
            <CardDescription>
              Enter a news article URL or paste the content directly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Input Type Toggle */}
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <Button
                variant={inputType === 'url' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setInputType('url')}
                className="flex-1"
              >
                <Link2 className="w-4 h-4 mr-2" />
                URL
              </Button>
              <Button
                variant={inputType === 'text' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setInputType('text')}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                Text
              </Button>
            </div>

            {/* Input Field */}
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300 font-medium">
                {inputType === 'url' ? 'News Article URL' : 'Article Content'}
              </Label>
              {inputType === 'url' ? (
                <Input
                  placeholder="https://example.com/news-article"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="bg-white/50 dark:bg-slate-700/50"
                />
              ) : (
                <Textarea
                  placeholder="Paste the news article content here..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="bg-white/50 dark:bg-slate-700/50 min-h-[120px]"
                />
              )}
            </div>

            <Button
              onClick={handleScan}
              disabled={isScanning}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isScanning ? (
                <>
                  <Search className="w-5 h-5 mr-2 animate-pulse" />
                  Analyzing Content...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Start Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Loading Animation */}
        {isScanning && (
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full mx-auto flex items-center justify-center animate-pulse">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Analyzing Content...
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Checking sources, verifying facts, and analyzing language patterns
                  </p>
                </div>
                <div className="flex justify-center space-x-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results && (
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
            <CardContent className="py-8 text-center space-y-4">
              <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Verification Result</h2>
              {results.status && (
                <div className="text-base font-semibold text-slate-700 dark:text-slate-200">Status: {results.status}</div>
              )}
              {results.verification_result && (
                <div className="text-lg font-bold text-slate-900 dark:text-white">{results.verification_result}</div>
              )}
              {results.confidence && (
                <div className="text-base text-slate-700 dark:text-slate-200">Confidence: {results.confidence}</div>
              )}
              {results.reason && (
                <div className="text-base text-slate-700 dark:text-slate-200">Reason: {results.reason}</div>
              )}
              {results.timestamp && (
                <div className="text-sm text-slate-500 dark:text-slate-400">Checked at: {results.timestamp}</div>
              )}
              {results.status === 'error' && !results.verification_result && (
                <div className="text-base text-red-600">Could not parse verification result.</div>
              )}
              </CardContent>
            </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FakeNewsDetector;

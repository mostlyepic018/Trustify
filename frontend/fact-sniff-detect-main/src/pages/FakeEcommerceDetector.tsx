
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Search, CheckCircle, XCircle, Globe, Shield, CreditCard, Star } from "lucide-react";
import { toast } from "sonner";

const FakeEcommerceDetector = () => {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleScan = async () => {
    if (!url.trim()) {
      toast.error("Please enter a website URL to analyze");
      return;
    }

    setIsScanning(true);
    toast.info("Analyzing e-commerce website...");

    setTimeout(() => {
      const mockResults = {
        verdict: Math.random() > 0.6 ? 'Suspicious' : Math.random() > 0.3 ? 'Safe' : 'Fake',
        riskScore: Math.floor(Math.random() * 100),
        checks: {
          domainAge: Math.floor(Math.random() * 100),
          sslCertificate: Math.floor(Math.random() * 100),
          contactInfo: Math.floor(Math.random() * 100),
          customerReviews: Math.floor(Math.random() * 100),
          paymentSecurity: Math.floor(Math.random() * 100),
        },
        flags: [
          { type: 'Domain Registration', status: Math.random() > 0.5 ? 'pass' : 'fail', description: 'Domain age and registration details' },
          { type: 'SSL Security', status: Math.random() > 0.5 ? 'pass' : 'warning', description: 'HTTPS encryption and certificate validity' },
          { type: 'Contact Information', status: Math.random() > 0.5 ? 'pass' : 'fail', description: 'Verifiable business contact details' },
          { type: 'Customer Reviews', status: Math.random() > 0.5 ? 'pass' : 'warning', description: 'Authentic customer feedback verification' },
        ]
      };
      
      setResults(mockResults);
      setIsScanning(false);
      toast.success("Analysis complete!");
    }, 3000);
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
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mx-auto">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              🛍️ Fake E-commerce Detector
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Verify online store authenticity and detect fraudulent websites
            </p>
          </div>
        </div>

        {/* Input Section */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Website to Analyze</CardTitle>
            <CardDescription>
              Enter the e-commerce website URL you want to verify
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300 font-medium">
                Website URL
              </Label>
              <Input
                placeholder="https://suspicious-deals-store.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-white/50 dark:bg-slate-700/50"
              />
            </div>

            <Button
              onClick={handleScan}
              disabled={isScanning}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isScanning ? (
                <>
                  <Search className="w-5 h-5 mr-2 animate-pulse" />
                  Analyzing Website...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Check Website Safety
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
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full mx-auto flex items-center justify-center animate-pulse">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Scanning Website...
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Checking domain, SSL, reviews, and security indicators
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
                    {results.verdict === 'Safe' && <CheckCircle className="w-6 h-6" />}
                    {results.verdict === 'Suspicious' && <AlertTriangle className="w-6 h-6" />}
                    {results.verdict === 'Fake' && <XCircle className="w-6 h-6" />}
                    {results.verdict}
                  </div>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-slate-900 dark:text-white">
                      {results.riskScore}%
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      Risk Score
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Checks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(results.checks).map(([key, value]) => (
                <Card key={key} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
                  <CardContent className="p-4 text-center space-y-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl mx-auto">
                      {key === 'domainAge' && <Globe className="w-6 h-6 text-amber-600" />}
                      {key === 'sslCertificate' && <Shield className="w-6 h-6 text-amber-600" />}
                      {key === 'contactInfo' && <Globe className="w-6 h-6 text-amber-600" />}
                      {key === 'customerReviews' && <Star className="w-6 h-6 text-amber-600" />}
                      {key === 'paymentSecurity' && <CreditCard className="w-6 h-6 text-amber-600" />}
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">{value}%</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Detailed Flags */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Security Assessment</CardTitle>
                <CardDescription>
                  Comprehensive analysis of website authenticity indicators
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

export default FakeEcommerceDetector;

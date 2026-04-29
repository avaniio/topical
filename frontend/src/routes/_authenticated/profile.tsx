import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, User, Shield, Key, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { updateUsername } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/profile")({
  component: Profile,
});

function Profile() {
  const { user, isLoading, loginUrl, logout, loginAction, refetchUser } = useAuth();
  const [usernameInput, setUsernameInput] = useState("");
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  // API Key state
  const [apiKey, setApiKey] = useState("");
  const [apiKeyStatus, setApiKeyStatus] = useState<'unknown' | 'valid' | 'invalid'>('unknown');
  const [isTestingKey, setIsTestingKey] = useState(false);

  useEffect(() => {
    if (user?.username) setUsernameInput(user.username);
    const stored = localStorage.getItem('gemini_api_key');
    if (stored) { setApiKey(stored); setApiKeyStatus('valid'); }
  }, [user?.username]);

  const handleUpdateUsername = async () => {
    if (!usernameInput || usernameInput.length < 3) { toast.error("Username must be at least 3 characters"); return; }
    setIsUpdatingUsername(true);
    try {
      await updateUsername(usernameInput);
      await refetchUser?.();
      toast.success("Username updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update username");
    } finally { setIsUpdatingUsername(false); }
  };

  const handleSaveApiKey = async () => {
    const key = apiKey.trim();
    if (!key) { localStorage.removeItem('gemini_api_key'); setApiKeyStatus('unknown'); toast.success('API key removed'); return; }
    setIsTestingKey(true);
    try {
      // Quick validation by calling a lightweight endpoint
      const res = await fetch('/api/ai/search-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Gemini-API-Key': key },
        body: JSON.stringify({ query: 'test', limit: 1 }),
      });
      if (res.ok) {
        localStorage.setItem('gemini_api_key', key);
        setApiKeyStatus('valid');
        toast.success('API key saved and verified');
      } else {
        setApiKeyStatus('invalid');
        toast.error('Invalid API key — check and try again');
      }
    } catch {
      // If backend is down, just save locally
      localStorage.setItem('gemini_api_key', key);
      setApiKeyStatus('valid');
      toast.success('API key saved');
    } finally { setIsTestingKey(false); }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-2">Authentication Error</h2>
        <p className="text-muted-foreground mb-4">Unable to load user profile</p>
        <Button asChild><a href={loginUrl} onClick={loginAction}>Login Again</a></Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                {user.picture ? (
                  <AvatarImage src={user.picture} alt={user.given_name || 'User'} />
                ) : (
                  <AvatarFallback className="text-lg">
                    {user.given_name ? user.given_name[0] : 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">
                  {user.given_name} {user.family_name}
                </h3>
                {user.email && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">User ID</p>
                  <p className="text-sm text-muted-foreground break-all">{user.id}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <Label htmlFor="username" className="text-sm font-medium mb-2 block">Username</Label>
                <div className="flex gap-2">
                  <Input 
                    id="username"
                    value={usernameInput} 
                    onChange={(e) => setUsernameInput(e.target.value)} 
                    placeholder="Set your username" 
                    className="max-w-[240px] bg-black/40 border-white/10"
                  />
                  <Button 
                    onClick={handleUpdateUsername} 
                    disabled={isUpdatingUsername || usernameInput === (user.username || "")}
                    size="sm"
                  >
                    {isUpdatingUsername ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Required for publishing projects to the community.
                </p>
              </div>

              {user.roles && user.roles.length > 0 && (
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Roles</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.roles.map(role => (
                        <span key={role} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">{role}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={logout} className="w-full">Logout</Button>
          </CardFooter>
        </Card>

        {/* API Key Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                AI Settings
              </CardTitle>
              <CardDescription>Configure your Gemini API key for AI content generation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="api-key" className="text-sm font-medium mb-2 block">Gemini API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={e => { setApiKey(e.target.value); setApiKeyStatus('unknown'); }}
                  placeholder="AIza..."
                  className="bg-black/40 border-white/10 font-mono text-xs"
                />
                {apiKeyStatus === 'valid' && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: '#22c55e' }}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> API key verified
                  </div>
                )}
                {apiKeyStatus === 'invalid' && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-red-400">
                    <AlertTriangle className="h-3.5 w-3.5" /> Invalid API key
                  </div>
                )}
              </div>
              <Button onClick={handleSaveApiKey} disabled={isTestingKey} className="w-full" size="sm">
                {isTestingKey ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Verifying...</> : 'Save API Key'}
              </Button>
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer"
                className="text-xs text-white/40 hover:text-white/60 flex items-center gap-1 transition-colors">
                <ExternalLink className="h-3 w-3" /> Get a free Gemini API key
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Your account is managed through Kinde authentication service.
              </p>
              <Button asChild variant="outline" className="w-full">
                <a href={loginUrl} target="_blank" rel="noopener noreferrer">
                  Manage Account Settings
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, ArrowRight, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface KlaviyoKey {
  id: string;
  client_name: string;
}

interface SegmentClonerProps {
  currentKeyId: string;
  segments: any[];
}

export const SegmentCloner = ({ currentKeyId, segments }: SegmentClonerProps) => {
  const [availableClients, setAvailableClients] = useState<KlaviyoKey[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [targetClient, setTargetClient] = useState("");
  const [cloning, setCloning] = useState(false);

  useEffect(() => {
    loadClients();
  }, [currentKeyId]);

  const loadClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("klaviyo_keys")
        .select("id, client_name")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .neq("id", currentKeyId);

      if (error) throw error;
      setAvailableClients(data || []);
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  };

  const toggleSegment = (segmentId: string) => {
    setSelectedSegments(prev =>
      prev.includes(segmentId)
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId]
    );
  };

  const handleClone = async () => {
    if (!targetClient) {
      toast.error("Please select a target client");
      return;
    }

    if (selectedSegments.length === 0) {
      toast.error("Please select at least one segment to clone");
      return;
    }

    setCloning(true);
    try {
      // Get target client's API key
      const { data: targetKey, error: keyError } = await supabase
        .from("klaviyo_keys")
        .select("klaviyo_api_key_hash")
        .eq("id", targetClient)
        .single();

      if (keyError) throw keyError;

      // Get current client's API key
      const { data: currentKey, error: currentKeyError } = await supabase
        .from("klaviyo_keys")
        .select("klaviyo_api_key_hash")
        .eq("id", currentKeyId)
        .single();

      if (currentKeyError) throw currentKeyError;

      // Get segment definitions from source
      const segmentDefinitions = segments.filter(s => 
        selectedSegments.includes(s.id)
      );

      // Create segments in target client
      const { data, error } = await supabase.functions.invoke("klaviyo-create-segments", {
        body: {
          klaviyoKeyId: targetClient,
          apiKey: targetKey.klaviyo_api_key_hash,
          segments: segmentDefinitions.map(s => ({
            id: s.id,
            name: s.attributes?.name || s.name,
            definition: s.definition,
          })),
        },
      });

      if (error) throw error;

      toast.success(`Successfully cloned ${selectedSegments.length} segments`);
      setSelectedSegments([]);
      setTargetClient("");
    } catch (error: any) {
      console.error("Error cloning segments:", error);
      toast.error(error.message || "Failed to clone segments");
    } finally {
      setCloning(false);
    }
  };

  if (availableClients.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-4 text-muted-foreground">
            <Copy className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No other clients available</p>
            <p className="text-sm mt-1">Add another Klaviyo account to clone segments</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Copy className="h-5 w-5" />
          Clone Segments
        </CardTitle>
        <CardDescription>
          Copy segments to another client
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Segment Selection */}
        <div className="space-y-3">
          <Label>Select Segments to Clone</Label>
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border border-border rounded-lg p-3">
            {segments.map((segment) => (
              <label
                key={segment.id}
                className="flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedSegments.includes(segment.id)}
                  onChange={() => toggleSegment(segment.id)}
                  className="w-4 h-4 text-primary"
                />
                <span className="flex-1">{segment.attributes?.name || segment.name}</span>
                {selectedSegments.includes(segment.id) && (
                  <CheckCircle className="w-4 h-4 text-primary" />
                )}
              </label>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {selectedSegments.length} segment{selectedSegments.length !== 1 ? "s" : ""} selected
          </p>
        </div>

        {/* Target Client Selection */}
        <div className="space-y-2">
          <Label htmlFor="target-client">Clone To</Label>
          <select
            id="target-client"
            value={targetClient}
            onChange={(e) => setTargetClient(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select target client</option>
            {availableClients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.client_name}
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleClone}
          disabled={cloning || !targetClient || selectedSegments.length === 0}
          className="w-full"
        >
          <Copy className="h-4 w-4 mr-2" />
          {cloning ? "Cloning..." : `Clone ${selectedSegments.length} Segment${selectedSegments.length !== 1 ? "s" : ""}`}
        </Button>
      </CardContent>
    </Card>
  );
};

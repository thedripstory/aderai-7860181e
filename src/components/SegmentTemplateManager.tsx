import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, FileText } from "lucide-react";
import { toast } from "sonner";

interface SegmentDefinition {
  name: string;
  conditions: any[];
}

interface SegmentTemplateManagerProps {
  currentSegment?: SegmentDefinition;
  onSave?: (template: any) => void;
}

export const SegmentTemplateManager = ({
  currentSegment,
  onSave,
}: SegmentTemplateManagerProps) => {
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    if (!currentSegment) {
      toast.error("No segment selected to save as template");
      return;
    }

    setSaving(true);
    try {
      const template = {
        name: templateName,
        description: templateDescription,
        segment_definition: currentSegment,
        created_at: new Date().toISOString(),
      };

      // Save to localStorage for now (will be database later)
      const templates = JSON.parse(
        localStorage.getItem("segment-templates") || "[]"
      );
      templates.push(template);
      localStorage.setItem("segment-templates", JSON.stringify(templates));

      toast.success("Template saved successfully!");
      setTemplateName("");
      setTemplateDescription("");

      onSave?.(template);
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Save as Template
        </CardTitle>
        <CardDescription>
          Save this segment configuration to reuse later
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="template-name">Template Name</Label>
          <Input
            id="template-name"
            placeholder="e.g., High Value VIP Segment"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="template-description">Description (Optional)</Label>
          <Textarea
            id="template-description"
            placeholder="Describe when to use this template..."
            value={templateDescription}
            onChange={(e) => setTemplateDescription(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          onClick={handleSaveTemplate}
          disabled={saving || !currentSegment}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Template"}
        </Button>
      </CardContent>
    </Card>
  );
};
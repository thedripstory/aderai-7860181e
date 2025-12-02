import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Zap, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Playbook {
  id: string;
  name: string;
  segmentName: string;
  trigger: string;
  threshold: number;
  action: string;
  isActive: boolean;
}

export const AutomationPlaybooks = () => {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newPlaybook, setNewPlaybook] = useState({
    name: "",
    segmentName: "",
    trigger: "growth",
    threshold: 10,
    action: "email",
  });

  const handleAddPlaybook = () => {
    if (!newPlaybook.name || !newPlaybook.segmentName) {
      toast.error("Please fill in all required fields");
      return;
    }

    const playbook: Playbook = {
      id: crypto.randomUUID(),
      name: newPlaybook.name,
      segmentName: newPlaybook.segmentName,
      trigger: newPlaybook.trigger,
      threshold: newPlaybook.threshold,
      action: newPlaybook.action,
      isActive: true,
    };

    setPlaybooks([...playbooks, playbook]);
    setShowForm(false);
    setNewPlaybook({
      name: "",
      segmentName: "",
      trigger: "growth",
      threshold: 10,
      action: "email",
    });
    toast.success("Playbook created successfully!");
  };

  const togglePlaybook = (id: string) => {
    setPlaybooks(
      playbooks.map((p) =>
        p.id === id ? { ...p, isActive: !p.isActive } : p
      )
    );
  };

  const deletePlaybook = (id: string) => {
    setPlaybooks(playbooks.filter((p) => p.id !== id));
    toast.success("Playbook deleted");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Automated Playbooks
            </CardTitle>
            <CardDescription>
              Set up automatic actions based on segment changes
            </CardDescription>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            New Playbook
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <Card className="border-2 border-primary/20">
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Playbook Name *</Label>
                  <Input
                    placeholder="e.g., VIP Growth Alert"
                    value={newPlaybook.name}
                    onChange={(e) =>
                      setNewPlaybook({ ...newPlaybook, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Segment Name *</Label>
                  <Input
                    placeholder="e.g., VIP Customers"
                    value={newPlaybook.segmentName}
                    onChange={(e) =>
                      setNewPlaybook({
                        ...newPlaybook,
                        segmentName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Trigger</Label>
                  <Select
                    value={newPlaybook.trigger}
                    onValueChange={(value) =>
                      setNewPlaybook({ ...newPlaybook, trigger: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="decline">Decline</SelectItem>
                      <SelectItem value="threshold">Reaches Threshold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Threshold (%)</Label>
                  <Input
                    type="number"
                    value={newPlaybook.threshold}
                    onChange={(e) =>
                      setNewPlaybook({
                        ...newPlaybook,
                        threshold: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Action</Label>
                  <Select
                    value={newPlaybook.action}
                    onValueChange={(value) =>
                      setNewPlaybook({ ...newPlaybook, action: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Send Email</SelectItem>
                      <SelectItem value="slack">Slack Notification</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddPlaybook} className="flex-1">
                  Create Playbook
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {playbooks.length === 0 && !showForm && (
          <div className="text-center py-12 text-muted-foreground">
            <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No playbooks configured yet</p>
            <p className="text-sm">Create your first automation playbook above</p>
          </div>
        )}

        <div className="space-y-3">
          {playbooks.map((playbook) => (
            <Card key={playbook.id} className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{playbook.name}</h4>
                      <Badge variant="outline">{playbook.segmentName}</Badge>
                      <Badge variant={playbook.isActive ? "default" : "secondary"}>
                        {playbook.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      When {playbook.segmentName} {playbook.trigger}s by{" "}
                      {playbook.threshold}%, {playbook.action}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={playbook.isActive}
                      onCheckedChange={() => togglePlaybook(playbook.id)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePlaybook(playbook.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
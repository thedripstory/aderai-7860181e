import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AuditLog {
  id: string;
  action_type: string;
  target_table?: string;
  created_at: string;
  old_values?: any;
  new_values?: any;
}

interface AdminAuditTabProps {
  auditLogs: AuditLog[];
}

export const AdminAuditTab = ({ auditLogs }: AdminAuditTabProps) => {
  const getActionColor = (actionType: string) => {
    if (actionType.includes('delete')) return 'destructive';
    if (actionType.includes('create') || actionType.includes('insert')) return 'default';
    if (actionType.includes('update')) return 'secondary';
    return 'outline';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Audit Trail</CardTitle>
        <CardDescription>Complete history of all administrative actions</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action Type</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Changes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-xs">
                  {new Date(log.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant={getActionColor(log.action_type)}>
                    {log.action_type.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {log.target_table || 'N/A'}
                </TableCell>
                <TableCell className="max-w-md">
                  <div className="space-y-1">
                    {log.old_values && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Old: </span>
                        <code className="text-destructive">
                          {JSON.stringify(log.old_values)}
                        </code>
                      </div>
                    )}
                    {log.new_values && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">New: </span>
                        <code className="text-primary">
                          {JSON.stringify(log.new_values)}
                        </code>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

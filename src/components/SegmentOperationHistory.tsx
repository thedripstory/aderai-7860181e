import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  History, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  Download,
  Trash2,
  Plus,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SegmentOperation {
  id: string;
  segment_name: string;
  segment_klaviyo_id: string | null;
  operation_type: string;
  operation_status: string;
  error_message: string | null;
  metadata: any;
  created_at: string;
}

interface SegmentOperationHistoryProps {
  klaviyoKeyId: string;
}

export const SegmentOperationHistory: React.FC<SegmentOperationHistoryProps> = ({ klaviyoKeyId }) => {
  const [operations, setOperations] = useState<SegmentOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchOperations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('segment_operations')
        .select('*')
        .eq('klaviyo_key_id', klaviyoKeyId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setOperations(data || []);
    } catch (error) {
      console.error('Error fetching operations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();
  }, [klaviyoKeyId]);

  const filteredOperations = operations.filter(op => {
    const matchesSearch = op.segment_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || op.operation_type === filterType;
    const matchesStatus = filterStatus === 'all' || op.operation_status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Success</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Failed</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>;
    }
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <Plus className="w-4 h-4 text-emerald-500" />;
      case 'deleted':
        return <Trash2 className="w-4 h-4 text-red-500" />;
      default:
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
    }
  };

  const exportHistory = () => {
    const csv = [
      ['Date', 'Segment Name', 'Operation', 'Status', 'Error'],
      ...filteredOperations.map(op => [
        format(new Date(op.created_at), 'yyyy-MM-dd HH:mm:ss'),
        op.segment_name,
        op.operation_type,
        op.operation_status,
        op.error_message || '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `segment-operations-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <Card className="border-2 border-border/50 bg-gradient-to-br from-card to-card/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <History className="w-5 h-5 text-primary" />
              Segment Operation History
            </CardTitle>
            <CardDescription className="mt-1">
              Audit log of all segment operations
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportHistory} className="rounded-full">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search segments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-full"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px] rounded-full">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
              <SelectItem value="modified">Modified</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px] rounded-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Operations List */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredOperations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No operations found</p>
            <p className="text-sm">Segment operations will appear here after you create segments.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {filteredOperations.map((op) => (
              <div
                key={op.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-background">
                    {getOperationIcon(op.operation_type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{op.segment_name}</p>
                      {getStatusBadge(op.operation_status)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground capitalize">
                        {op.operation_type}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(op.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {op.error_message && (
                      <p className="text-xs text-red-500 mt-1">{op.error_message}</p>
                    )}
                  </div>
                </div>
                {getStatusIcon(op.operation_status)}
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {operations.length > 0 && (
          <div className="flex gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-500">
                {operations.filter(o => o.operation_status === 'success').length}
              </p>
              <p className="text-xs text-muted-foreground">Successful</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">
                {operations.filter(o => o.operation_status === 'failed').length}
              </p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-foreground">
                {operations.length}
              </p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
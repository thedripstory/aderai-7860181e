import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, X, Filter } from "lucide-react";
import { format } from "date-fns";

interface FilterConfig {
  search?: boolean;
  dateRange?: boolean;
  status?: string[];
  accountType?: string[];
  customFilters?: { label: string; options: string[] }[];
}

interface AdminTableFiltersProps {
  config: FilterConfig;
  onFilterChange: (filters: any) => void;
}

export const AdminTableFilters = ({ config, onFilterChange }: AdminTableFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedAccountType, setSelectedAccountType] = useState<string[]>([]);
  const [customFilterValues, setCustomFilterValues] = useState<Record<string, string[]>>({});

  const applyFilters = () => {
    onFilterChange({
      search: searchTerm,
      dateFrom,
      dateTo,
      status: selectedStatus,
      accountType: selectedAccountType,
      custom: customFilterValues
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDateFrom(undefined);
    setDateTo(undefined);
    setSelectedStatus([]);
    setSelectedAccountType([]);
    setCustomFilterValues({});
    onFilterChange({});
  };

  const toggleArrayFilter = (value: string, current: string[], setter: (val: string[]) => void) => {
    if (current.includes(value)) {
      setter(current.filter(v => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  const activeFilterCount = [
    searchTerm ? 1 : 0,
    dateFrom || dateTo ? 1 : 0,
    selectedStatus.length,
    selectedAccountType.length,
    Object.values(customFilterValues).reduce((sum, arr) => sum + arr.length, 0)
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount} active</Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        {config.search && (
          <div>
            <label className="text-sm font-medium mb-2 block">Search</label>
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {/* Date Range */}
        {config.dateRange && (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">From Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">To Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </>
        )}

        {/* Status Filter */}
        {config.status && (
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select
              value={selectedStatus[0] || "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  setSelectedStatus([]);
                } else {
                  toggleArrayFilter(value, selectedStatus, setSelectedStatus);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {config.status.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Account Type Filter */}
        {config.accountType && (
          <div>
            <label className="text-sm font-medium mb-2 block">Account Type</label>
            <Select
              value={selectedAccountType[0] || "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  setSelectedAccountType([]);
                } else {
                  toggleArrayFilter(value, selectedAccountType, setSelectedAccountType);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {config.accountType.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={applyFilters}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

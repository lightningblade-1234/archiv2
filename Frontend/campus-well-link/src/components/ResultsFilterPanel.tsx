import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface FilterValues {
  assessmentType: string;
  riskLevel: string;
  startDate?: Date;
  endDate?: Date;
  minScore: string;
  maxScore: string;
}

interface ResultsFilterPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  onApply: () => void;
  onClear: () => void;
}

export const ResultsFilterPanel: React.FC<ResultsFilterPanelProps> = ({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onApply,
  onClear,
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Results</SheetTitle>
          <SheetDescription>
            Apply filters to narrow down assessment results
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Assessment Type */}
          <div className="space-y-2">
            <Label>Assessment Type</Label>
            <Select
              value={filters.assessmentType}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, assessmentType: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assessment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="phq9">Depression Screening (PHQ-9)</SelectItem>
                <SelectItem value="gad7">Anxiety Assessment (GAD-7)</SelectItem>
                <SelectItem value="stress">Stress Level Evaluation</SelectItem>
                <SelectItem value="sleep">Sleep Quality Index</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Risk Level */}
          <div className="space-y-2">
            <Label>Risk Level</Label>
            <Select
              value={filters.riskLevel}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, riskLevel: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select risk level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Mild">Mild</SelectItem>
                <SelectItem value="Moderate">Moderate</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="grid gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'justify-start text-left font-normal',
                      !filters.startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate ? (
                      format(filters.startDate, 'PPP')
                    ) : (
                      <span>Start date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.startDate}
                    onSelect={(date) =>
                      onFiltersChange({ ...filters, startDate: date })
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'justify-start text-left font-normal',
                      !filters.endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate ? (
                      format(filters.endDate, 'PPP')
                    ) : (
                      <span>End date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.endDate}
                    onSelect={(date) =>
                      onFiltersChange({ ...filters, endDate: date })
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Score Range */}
          <div className="space-y-2">
            <Label>Score Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minScore}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, minScore: e.target.value })
                  }
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxScore}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, maxScore: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={onApply} className="flex-1">
              Apply Filters
            </Button>
            <Button onClick={onClear} variant="outline" className="flex-1">
              Clear Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

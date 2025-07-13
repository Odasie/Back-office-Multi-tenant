import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRightLeft, Users, DollarSign, Headphones, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DepartmentHandoffProps {
  currentDepartment: 'sales' | 'operations' | 'customer_service' | 'finance';
  entityType: 'lead' | 'task' | 'ticket';
  entityId?: string;
  onHandoff: (department: string, notes?: string) => void;
}

const departmentConfig = {
  sales: {
    name: 'Sales',
    icon: DollarSign,
    color: 'bg-green-500',
    availableHandoffs: ['operations', 'customer_service']
  },
  operations: {
    name: 'Operations',
    icon: Settings,
    color: 'bg-blue-500',
    availableHandoffs: ['sales', 'customer_service', 'finance']
  },
  customer_service: {
    name: 'Customer Service',
    icon: Headphones,
    color: 'bg-purple-500',
    availableHandoffs: ['sales', 'operations']
  },
  finance: {
    name: 'Finance',
    icon: DollarSign,
    color: 'bg-yellow-500',
    availableHandoffs: ['sales', 'operations']
  }
};

export function DepartmentHandoff({ 
  currentDepartment, 
  entityType, 
  entityId, 
  onHandoff 
}: DepartmentHandoffProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [handoffNotes, setHandoffNotes] = useState("");
  const { toast } = useToast();

  const currentConfig = departmentConfig[currentDepartment];
  const CurrentIcon = currentConfig.icon;

  const handleHandoffClick = (department: string) => {
    setSelectedDepartment(department);
    setShowDialog(true);
  };

  const confirmHandoff = () => {
    onHandoff(selectedDepartment, handoffNotes);
    
    toast({
      title: "Handoff initiated",
      description: `${entityType} has been handed off to ${departmentConfig[selectedDepartment as keyof typeof departmentConfig].name}`,
    });

    setShowDialog(false);
    setHandoffNotes("");
    setSelectedDepartment("");
  };

  const getDepartmentButton = (deptKey: string) => {
    const dept = departmentConfig[deptKey as keyof typeof departmentConfig];
    const Icon = dept.icon;
    
    return (
      <DropdownMenuItem 
        key={deptKey}
        onClick={() => handleHandoffClick(deptKey)}
        className="flex items-center gap-2"
      >
        <div className={`w-2 h-2 rounded-full ${dept.color}`} />
        <Icon className="h-4 w-4" />
        <span>Transfer to {dept.name}</span>
      </DropdownMenuItem>
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <CurrentIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{currentConfig.name}</span>
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Department Handoff
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {currentConfig.availableHandoffs.map(getDepartmentButton)}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Department Handoff</DialogTitle>
            <DialogDescription>
              You are about to transfer this {entityType} to the{" "}
              {selectedDepartment && departmentConfig[selectedDepartment as keyof typeof departmentConfig]?.name} department.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <CurrentIcon className="h-5 w-5" />
                <span className="font-medium">{currentConfig.name}</span>
              </div>
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-3">
                {selectedDepartment && (
                  <>
                    {(() => {
                      const TargetIcon = departmentConfig[selectedDepartment as keyof typeof departmentConfig]?.icon;
                      return TargetIcon ? <TargetIcon className="h-5 w-5" /> : null;
                    })()}
                    <span className="font-medium">
                      {departmentConfig[selectedDepartment as keyof typeof departmentConfig]?.name}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="handoff-notes">Handoff Notes (Optional)</Label>
              <Textarea
                id="handoff-notes"
                placeholder="Add any important context or instructions for the receiving department..."
                value={handoffNotes}
                onChange={(e) => setHandoffNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmHandoff}>
              Confirm Handoff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
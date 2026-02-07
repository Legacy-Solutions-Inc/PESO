"use client";

import { useState } from "react";
import { Edit, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { updateUserRole, updateUserStatus } from "../actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

interface UserActionsMenuProps {
  userId: string;
  currentRole: "admin" | "encoder";
  currentStatus: "active" | "pending" | "inactive";
  userEmail: string;
}

export function UserActionsMenu({
  userId,
  currentRole,
  currentStatus,
  userEmail,
}: UserActionsMenuProps) {
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRoleChange = async () => {
    if (selectedRole === currentRole) {
      setIsRoleDialogOpen(false);
      return;
    }

    setIsLoading(true);
    const result = await updateUserRole(userId, selectedRole);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Role updated",
        description: `User role changed to ${selectedRole}`,
      });
      setIsRoleDialogOpen(false);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update role",
      });
    }
  };

  const handleStatusToggle = async () => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    setIsLoading(true);
    const result = await updateUserStatus(userId, newStatus);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Status updated",
        description: `User ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
      });
      setIsStatusDialogOpen(false);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update status",
      });
    }
  };

  const handleActivatePending = async () => {
    setIsLoading(true);
    const result = await updateUserStatus(userId, "active");
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "User activated",
        description: `${userEmail} can now access the system`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to activate user",
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => setIsRoleDialogOpen(true)}
          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-dashboard-primary dark:hover:bg-slate-800"
          title="Edit Role"
        >
          <Edit className="h-4 w-4" />
        </button>

        {currentStatus === "pending" ? (
          <button
            onClick={handleActivatePending}
            disabled={isLoading}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50 dark:hover:bg-emerald-900/20"
            title="Activate User"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
          </button>
        ) : (
          <button
            onClick={() => setIsStatusDialogOpen(true)}
            className={`rounded-md p-1.5 text-slate-400 transition-colors ${
              currentStatus === "active"
                ? "hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                : "hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20"
            }`}
            title={currentStatus === "active" ? "Deactivate User" : "Activate User"}
          >
            {currentStatus === "active" ? (
              <XCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Role Change Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for <span className="font-medium text-slate-900 dark:text-white">{userEmail}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <RadioGroup value={selectedRole} onValueChange={(value) => setSelectedRole(value as "admin" | "encoder")}>
              <div className="flex items-center space-x-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                <RadioGroupItem value="admin" id="role-admin" />
                <Label htmlFor="role-admin" className="flex-1 cursor-pointer">
                  <div className="font-medium">Admin</div>
                  <div className="text-sm text-slate-500">Full access to all features including user management</div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                <RadioGroupItem value="encoder" id="role-encoder" />
                <Label htmlFor="role-encoder" className="flex-1 cursor-pointer">
                  <div className="font-medium">Encoder</div>
                  <div className="text-sm text-slate-500">Can encode and edit jobseeker data</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange} disabled={isLoading || selectedRole === currentRole}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Toggle Alert Dialog */}
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {currentStatus === "active" ? "Deactivate User?" : "Activate User?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {currentStatus === "active" ? (
                <>
                  This will prevent <span className="font-medium text-slate-900 dark:text-white">{userEmail}</span> from
                  accessing the system. They will be signed out on their next request.
                </>
              ) : (
                <>
                  This will allow <span className="font-medium text-slate-900 dark:text-white">{userEmail}</span> to
                  access the system.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusToggle} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {currentStatus === "active" ? "Deactivate" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

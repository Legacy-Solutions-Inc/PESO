"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleBadge } from "./role-badge";
import { StatusBadge } from "./status-badge";
import { UserActionsMenu } from "./user-actions-menu";
import type { UserListItem } from "../actions";

interface UsersTableProps {
  initialUsers: UserListItem[];
  initialTotal: number;
  initialPage: number;
  pageSize: number;
}

export function UsersTable({
  initialUsers,
  initialTotal,
  initialPage,
  pageSize,
}: UsersTableProps) {
  const [users] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "encoder">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "inactive">("all");

  // Client-side filtering
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !search ||
      (user.email && user.email.toLowerCase().includes(search.toLowerCase())) ||
      user.profile.full_name?.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "all" || user.profile.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.profile.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getInitials = (user: UserListItem) => {
    const name = user.email || user.profile.full_name?.trim();
    if (name) return name.slice(0, 2).toUpperCase();
    return "—";
  };

  const getDisplayName = (user: UserListItem) =>
    user.email || user.profile.full_name?.trim() || "—";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/50 dark:bg-slate-900/30">
      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 p-5 dark:border-slate-700/50">
        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition-colors group-focus-within:text-dashboard-primary">
            <Search className="h-5 w-5" />
          </div>
          <Input
            className="block w-full border-none bg-slate-100/50 pl-10 pr-3 text-sm font-medium placeholder-slate-500 focus:bg-white focus:ring-2 focus:ring-dashboard-primary/20 dark:bg-slate-800/50"
            placeholder="Search users by name or email..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex w-full items-center gap-3 overflow-x-auto pb-2 sm:w-auto sm:pb-0">
          <div className="flex min-w-fit items-center gap-2 rounded-lg border border-transparent bg-slate-100/50 px-3 py-2 transition-colors hover:border-slate-200 dark:bg-slate-800/50">
            <Filter className="h-5 w-5 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter</span>
          </div>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}>
            <SelectTrigger className="w-35 border-none bg-slate-100/50 text-sm font-medium focus:ring-2 focus:ring-dashboard-primary/20">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="encoder">Encoder</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-35 border-none bg-slate-100/50 text-sm font-medium focus:ring-2 focus:ring-dashboard-primary/20">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200/60 bg-slate-50/30 dark:border-slate-700/50 dark:bg-slate-800/30">
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">
                Email
              </th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">
                Role
              </th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">
                Status
              </th>
              <th className="py-4 px-6 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/50 text-sm dark:divide-slate-700/50">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="group transition-colors hover:bg-white/60 dark:hover:bg-slate-800/50"
                >
                  <td className="py-4 px-6 align-middle">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700">
                        <AvatarFallback className="bg-linear-to-br from-dashboard-primary/20 to-dashboard-primary/5 text-xs font-bold text-dashboard-primary">
                          {getInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {getDisplayName(user)}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6 align-middle">
                    <RoleBadge role={user.profile.role} />
                  </td>
                  <td className="py-4 px-6 align-middle">
                    <StatusBadge status={user.profile.status} />
                  </td>
                  <td className="py-4 px-6 align-middle text-right">
                    <UserActionsMenu
                      userId={user.id}
                      currentRole={user.profile.role}
                      currentStatus={user.profile.status}
                      userEmail={user.email}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="mt-auto flex flex-col items-center justify-between gap-4 border-t border-slate-200/60 bg-slate-50/30 p-4 dark:border-slate-700/50 dark:bg-slate-800/30 sm:flex-row">
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-900 dark:text-white">{filteredUsers.length}</span> of{" "}
          <span className="font-semibold text-slate-900 dark:text-white">{initialTotal}</span> users
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-300 bg-white text-slate-500 hover:bg-slate-50"
            disabled={initialPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            disabled={filteredUsers.length < pageSize}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

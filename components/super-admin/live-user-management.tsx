"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  assignUserRoleBySuperAdminAction,
  changePrimaryRoleBySuperAdminAction,
  convertUserToSingleRoleBySuperAdminAction,
  deleteAuthUserBySuperAdminAction,
  listSuperAdminUsersAction,
  resetUserPasswordBySuperAdminAction,
  revokeUserRoleBySuperAdminAction,
  suspendUserBySuperAdminAction,
  type SuperAdminUserDirectoryItem,
  upsertFmsProfileBySuperAdminAction,
} from "@/app/super-admin/users/actions";
import { ROUTES } from "@/config/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const roleFilters = [
  "all",
  "importer",
  "fms",
  "agent",
  "admin",
  "project_manager",
  "super_admin",
  "factory_future",
];

const statusFilters = [
  "all",
  "active",
  "pending",
  "suspended",
  "revoked",
  "hidden_future",
];

const assignableRoleOptions = [
  "importer",
  "fms",
  "agent",
  "admin",
  "project_manager",
  "super_admin",
  "factory_future",
];

function getPasswordHint(password: string) {
  const checks = [
    password.length >= 10,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /(?:\d|[^A-Za-z0-9])/.test(password),
  ];
  const passed = checks.filter(Boolean).length;

  if (!password) {
    return "Minimum 10 characters with uppercase, lowercase, and a number or symbol.";
  }

  return `${passed}/4 strength checks passed.`;
}

type LiveUserManagementProps = {
  mode?: "directory" | "role-controls";
};

export function LiveUserManagement({
  mode = "directory",
}: LiveUserManagementProps) {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<SuperAdminUserDirectoryItem[]>([]);
  const [selectedUser, setSelectedUser] =
    useState<SuperAdminUserDirectoryItem | null>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleToAssign, setRoleToAssign] = useState("importer");
  const [makePrimaryRole, setMakePrimaryRole] = useState(true);
  const [confirmedPrivilegedRole, setConfirmedPrivilegedRole] =
    useState(false);
  const [primaryRoleToSet, setPrimaryRoleToSet] = useState("importer");
  const [ensurePrimaryAssignment, setEnsurePrimaryAssignment] = useState(true);
  const [roleToRevoke, setRoleToRevoke] = useState("importer");
  const [singleRoleToKeep, setSingleRoleToKeep] = useState("importer");
  const [confirmSelfLockout, setConfirmSelfLockout] = useState(false);
  const [revokeRolesOnSuspend, setRevokeRolesOnSuspend] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [confirmSelfDelete, setConfirmSelfDelete] = useState(false);
  const [fmsCode, setFmsCode] = useState("");
  const [fmsTier, setFmsTier] = useState("bronze");
  const [fmsCityProvince, setFmsCityProvince] = useState("");
  const [fmsCategories, setFmsCategories] = useState(
    "general sourcing, consumer products, packaging",
  );
  const [fmsAcademyStatus, setFmsAcademyStatus] = useState("not_started");
  const [fmsQualityScore, setFmsQualityScore] = useState("80");
  const [fmsProfileStatus, setFmsProfileStatus] = useState("active");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const requestedUserId =
    mode === "role-controls" ? searchParams.get("user") ?? "" : "";

  const selectUser = useCallback((user: SuperAdminUserDirectoryItem) => {
    setSelectedUser(user);
    setMessage("");
    setError("");
    setTemporaryPassword("");
    setConfirmed(false);
    setConfirmedPrivilegedRole(false);
    setPrimaryRoleToSet(user.primaryRoleRaw ?? "importer");
    setRoleToAssign(user.primaryRoleRaw ?? "importer");
    setRoleToRevoke(user.activeRoles[0] ?? "importer");
    setSingleRoleToKeep(user.activeRoles[0] ?? "importer");
    setFmsCode(user.fmsCode !== "Not set" ? user.fmsCode : "");
    setFmsTier(user.fmsTier !== "Not set" ? user.fmsTier : "bronze");
    setFmsCityProvince(
      user.fmsCityProvince !== "Not set" ? user.fmsCityProvince : "",
    );
    setFmsCategories(
      user.fmsCategories.length > 0
        ? user.fmsCategories.join(", ")
        : "general sourcing, consumer products, packaging",
    );
    setFmsAcademyStatus(
      user.fmsAcademyStatus !== "Not set"
        ? user.fmsAcademyStatus
        : "not_started",
    );
    setFmsQualityScore(
      user.qualityScore !== "Not set" ? user.qualityScore : "80",
    );
    setFmsProfileStatus(user.fmsStatusRaw ?? "active");
    setConfirmSelfDelete(false);
    setConfirmSelfLockout(false);
    setDeleteConfirmation("");
  }, []);

  async function getAccessToken() {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      throw new Error("Please login as Super Admin.");
    }

    return session.access_token;
  }

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      try {
        const accessToken = await getAccessToken();
        const result = await listSuperAdminUsersAction(accessToken);

        if (!isMounted) {
          return;
        }

        if (!result.ok) {
          setError(result.message);
          setIsLoading(false);
          return;
        }

        setUsers(result.data);
        const initialUser =
          result.data.find((user) => user.userProfileId === requestedUserId) ??
          result.data[0] ??
          null;
        if (initialUser) {
          selectUser(initialUser);
        } else {
          setSelectedUser(null);
        }
        setIsLoading(false);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "User directory could not be loaded.",
        );
        setIsLoading(false);
      }
    }

    void loadUsers();

    return () => {
      isMounted = false;
    };
  }, [requestedUserId, selectUser]);

  useEffect(() => {
    if (!selectedUser) {
      return;
    }

    setPrimaryRoleToSet(selectedUser.primaryRoleRaw ?? "importer");
    setRoleToAssign(selectedUser.primaryRoleRaw ?? "importer");
    setRoleToRevoke(selectedUser.activeRoles[0] ?? "importer");
    setSingleRoleToKeep(selectedUser.activeRoles[0] ?? "importer");
    setFmsCode(selectedUser.fmsCode !== "Not set" ? selectedUser.fmsCode : "");
    setFmsTier(selectedUser.fmsTier !== "Not set" ? selectedUser.fmsTier : "bronze");
    setFmsCityProvince(
      selectedUser.fmsCityProvince !== "Not set"
        ? selectedUser.fmsCityProvince
        : "",
    );
    setFmsCategories(
      selectedUser.fmsCategories.length > 0
        ? selectedUser.fmsCategories.join(", ")
        : "general sourcing, consumer products, packaging",
    );
    setFmsAcademyStatus(
      selectedUser.fmsAcademyStatus !== "Not set"
        ? selectedUser.fmsAcademyStatus
        : "not_started",
    );
    setFmsQualityScore(
      selectedUser.qualityScore !== "Not set" ? selectedUser.qualityScore : "80",
    );
    setFmsProfileStatus(selectedUser.fmsStatusRaw ?? "active");
  }, [selectedUser]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesQuery =
        !normalizedQuery || user.searchableText.includes(normalizedQuery);
      const matchesRole =
        roleFilter === "all" ||
        user.activeRoles.includes(roleFilter) ||
        user.primaryRole.toLowerCase().replaceAll(" ", "_") === roleFilter;
      const matchesStatus =
        statusFilter === "all" ||
        user.profileStatus.toLowerCase().replaceAll(" ", "_") === statusFilter;

      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [query, roleFilter, statusFilter, users]);

  async function refreshUsers(accessToken: string, selectedProfileId?: string) {
    const refreshed = await listSuperAdminUsersAction(accessToken);

    if (!refreshed.ok) {
      setMessage("Action completed. Refresh the page to see the latest data.");
      return false;
    }

    setUsers(refreshed.data);
    setSelectedUser(
      refreshed.data.find(
        (user) => user.userProfileId === selectedProfileId,
      ) ??
        refreshed.data[0] ??
        null,
    );
    return true;
  }

  async function runManagedAction(
    actionName: string,
    action: (
      accessToken: string,
    ) => Promise<{ ok: boolean; message?: string }>,
  ) {
    if (!selectedUser) {
      setError("Select a user first.");
      return;
    }

    setBusyAction(actionName);
    setMessage("");
    setError("");

    try {
      const accessToken = await getAccessToken();
      const result = await action(accessToken);

      if (!result.ok) {
        setError(result.message ?? "Super Admin action could not be completed.");
        return;
      }

      await refreshUsers(accessToken, selectedUser.userProfileId);
      setMessage(result.message ?? "Super Admin action completed.");
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Super Admin action could not be completed.",
      );
    } finally {
      setBusyAction("");
    }
  }

  async function assignRole() {
    if (!selectedUser) {
      setError("Select a user first.");
      return;
    }

    await runManagedAction("assign-role", (accessToken) =>
      assignUserRoleBySuperAdminAction(accessToken, {
        confirmedPrivilegedRole,
        makePrimaryRole,
        role: roleToAssign,
        userProfileId: selectedUser.userProfileId,
      }),
    );
  }

  async function changePrimaryRole() {
    if (!selectedUser) {
      setError("Select a user first.");
      return;
    }

    await runManagedAction("change-primary-role", (accessToken) =>
      changePrimaryRoleBySuperAdminAction(accessToken, {
        ensureActiveAssignment: ensurePrimaryAssignment,
        role: primaryRoleToSet,
        userProfileId: selectedUser.userProfileId,
      }),
    );
  }

  async function revokeRole() {
    if (!selectedUser) {
      setError("Select a user first.");
      return;
    }

    await runManagedAction("revoke-role", (accessToken) =>
      revokeUserRoleBySuperAdminAction(accessToken, {
        confirmSelfLockout,
        role: roleToRevoke,
        userProfileId: selectedUser.userProfileId,
      }),
    );
  }

  async function convertToSingleRole() {
    if (!selectedUser) {
      setError("Select a user first.");
      return;
    }

    await runManagedAction("single-role", (accessToken) =>
      convertUserToSingleRoleBySuperAdminAction(accessToken, {
        confirmSelfLockout,
        keepRole: singleRoleToKeep,
        userProfileId: selectedUser.userProfileId,
      }),
    );
  }

  async function upsertFmsProfile() {
    if (!selectedUser) {
      setError("Select a user first.");
      return;
    }

    await runManagedAction("fms-profile", (accessToken) =>
      upsertFmsProfileBySuperAdminAction(accessToken, {
        academyStatus: fmsAcademyStatus,
        categories: fmsCategories,
        cityProvince: fmsCityProvince,
        fmsCode,
        qualityScore: fmsQualityScore,
        status: fmsProfileStatus,
        tier: fmsTier,
        userProfileId: selectedUser.userProfileId,
      }),
    );
  }

  async function suspendUser() {
    if (!selectedUser) {
      setError("Select a user first.");
      return;
    }

    await runManagedAction("suspend-user", (accessToken) =>
      suspendUserBySuperAdminAction(accessToken, {
        confirmSelfLockout,
        revokeActiveRoles: revokeRolesOnSuspend,
        userProfileId: selectedUser.userProfileId,
      }),
    );
  }

  async function softDeleteAuthUser() {
    if (!selectedUser) {
      setError("Select a user first.");
      return;
    }

    await runManagedAction("delete-user", (accessToken) =>
      deleteAuthUserBySuperAdminAction(accessToken, {
        authUserId: selectedUser.authUserId,
        confirmSelfDelete,
        confirmationText: deleteConfirmation,
        userProfileId: selectedUser.userProfileId,
      }),
    );
  }

  async function resetPassword() {
    if (!selectedUser) {
      setError("Select a user first.");
      return;
    }

    if (!confirmed) {
      setError("Confirm that this will replace the user's current password.");
      return;
    }

    setIsResetting(true);
    setMessage("");
    setError("");

    try {
      const accessToken = await getAccessToken();
      const result = await resetUserPasswordBySuperAdminAction(accessToken, {
        authUserId: selectedUser.authUserId,
        temporaryPassword,
        userProfileId: selectedUser.userProfileId,
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setMessage(result.message ?? "Temporary password was set.");
      setTemporaryPassword("");
      setConfirmed(false);
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Password reset could not be completed.",
      );
    } finally {
      setIsResetting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-semibold text-brand-muted shadow-sm">
        Loading Super Admin user directory...
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="rounded-lg border border-brand-error bg-red-50 p-6 text-sm leading-7 text-brand-error shadow-sm">
        {error}
      </div>
    );
  }

  const isRoleControlsMode = mode === "role-controls";

  return (
    <div
      className={`grid gap-6 ${
        isRoleControlsMode
          ? "xl:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]"
          : "xl:grid-cols-[minmax(0,1fr)_380px]"
      }`}
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_160px_160px]">
          <div>
            <label
              className="block text-sm font-semibold text-brand-navy"
              htmlFor="user-search"
            >
              Search users
            </label>
            <input
              className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text"
              id="user-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, email, role, FMS code, business name..."
              type="search"
              value={query}
            />
          </div>
          <div>
            <label
              className="block text-sm font-semibold text-brand-navy"
              htmlFor="role-filter"
            >
              Role
            </label>
            <select
              className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-brand-text"
              id="role-filter"
              onChange={(event) => setRoleFilter(event.target.value)}
              value={roleFilter}
            >
              {roleFilters.map((role) => (
                <option key={role} value={role}>
                  {role === "all" ? "All roles" : role}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-semibold text-brand-navy"
              htmlFor="status-filter"
            >
              Status
            </label>
            <select
              className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-brand-text"
              id="status-filter"
              onChange={(event) => setStatusFilter(event.target.value)}
              value={statusFilter}
            >
              {statusFilters.map((status) => (
                <option key={status} value={status}>
                  {status === "all" ? "All statuses" : status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-brand-navy text-white">
                <tr>
                  {[
                    "Name",
                    "Email",
                    "Roles",
                    "Status",
                    "FMS",
                    "Importer/Agent",
                    "Updated",
                    "Actions",
                  ].map((heading) => (
                    <th className="px-4 py-3 font-semibold" key={heading}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr
                    className={`cursor-pointer transition hover:bg-emerald-50 ${
                      selectedUser?.userProfileId === user.userProfileId
                        ? "bg-emerald-50"
                        : "bg-white"
                    }`}
                    key={user.userProfileId}
                    onClick={() => selectUser(user)}
                  >
                    <td className="px-4 py-4">
                      <div className="font-bold text-brand-navy">
                        {user.displayName}
                      </div>
                      {user.badges.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {user.badges.map((badge) => (
                            <span
                              className="rounded-full border border-brand-gold bg-amber-50 px-2 py-1 text-[11px] font-bold text-brand-navy"
                              key={badge}
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-brand-muted">{user.email}</td>
                    <td className="px-4 py-4 text-brand-muted">
                      {user.activeRoles.length > 0
                        ? user.activeRoles.join(", ")
                        : user.primaryRole}
                    </td>
                    <td className="px-4 py-4 text-brand-muted">
                      {user.profileStatus}
                    </td>
                    <td className="px-4 py-4 text-brand-muted">
                      {user.fmsCode}
                      {user.fmsCode !== "Not set" ? ` / ${user.fmsTier}` : ""}
                    </td>
                    <td className="px-4 py-4 text-brand-muted">
                      {user.importerBusinessName !== "Not set"
                        ? user.importerBusinessName
                        : user.agentCode}
                    </td>
                    <td className="px-4 py-4 text-brand-muted">
                      {user.updatedAt}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <button
                          className="rounded-lg border border-brand-navy bg-white px-3 py-2 text-xs font-bold text-brand-navy transition hover:border-brand-emerald hover:text-brand-emerald"
                          onClick={(event) => {
                            event.stopPropagation();
                            selectUser(user);
                          }}
                          type="button"
                        >
                          View/Edit
                        </button>
                        <Link
                          className="rounded-lg bg-brand-emerald px-3 py-2 text-center text-xs font-bold text-white no-underline transition hover:bg-brand-navy"
                          href={`${ROUTES.superAdminRoleControls}?user=${user.userProfileId}`}
                          onClick={(event) => event.stopPropagation()}
                        >
                          Manage Roles
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-3 text-xs font-semibold text-brand-muted">
          Showing {filteredUsers.length} of {users.length} safe directory rows.
          Password hashes, tokens, refresh tokens, and auth internals are never
          exposed here.
        </p>
      </section>

      <aside className="space-y-5">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          {isRoleControlsMode ? (
            <div className="mb-4 rounded-lg border border-brand-gold bg-amber-50 p-3 text-sm font-semibold leading-6 text-brand-navy">
              Role changes are high-risk operations. Server actions still
              enforce active super_admin access, privileged-role confirmation,
              audit logging, and last-super-admin protection.
            </div>
          ) : null}
          <h2 className="text-xl font-bold text-brand-navy">
            Selected account
          </h2>
          {selectedUser ? (
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="font-semibold text-brand-muted">Name</dt>
                <dd className="text-brand-navy">{selectedUser.displayName}</dd>
              </div>
              <div>
                <dt className="font-semibold text-brand-muted">Email</dt>
                <dd className="break-all text-brand-navy">
                  {selectedUser.email}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-brand-muted">Roles</dt>
                <dd className="text-brand-navy">
                  {selectedUser.roleStatuses}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-brand-muted">Profile ID</dt>
                <dd className="break-all text-brand-navy">
                  {selectedUser.userProfileId}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-brand-muted">Auth User ID</dt>
                <dd className="break-all text-brand-navy">
                  {selectedUser.authUserId}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-brand-muted">Primary role</dt>
                <dd className="text-brand-navy">{selectedUser.primaryRole}</dd>
              </div>
              <div>
                <dt className="font-semibold text-brand-muted">
                  Profile status
                </dt>
                <dd className="text-brand-navy">{selectedUser.profileStatus}</dd>
              </div>
              <div>
                <dt className="font-semibold text-brand-muted">
                  Inactive/revoked roles
                </dt>
                <dd className="text-brand-navy">
                  {selectedUser.inactiveRoles.length > 0
                    ? selectedUser.inactiveRoles.join(", ")
                    : "None"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-brand-muted">
                  Importer profile
                </dt>
                <dd className="text-brand-navy">
                  {selectedUser.hasImporterProfile
                    ? `${selectedUser.importerBusinessName} / ${selectedUser.importerCity}`
                    : "Missing"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-brand-muted">FMS profile</dt>
                <dd className="text-brand-navy">
                  {selectedUser.hasFmsProfile
                    ? `${selectedUser.fmsCode} / ${selectedUser.fmsTier} / ${selectedUser.fmsStatus}`
                    : "Missing"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-brand-muted">Agent profile</dt>
                <dd className="text-brand-navy">
                  {selectedUser.hasAgentProfile
                    ? `${selectedUser.agentCode} / ${selectedUser.agentStatus}`
                    : "Missing"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-brand-muted">Created</dt>
                <dd className="text-brand-navy">{selectedUser.createdAt}</dd>
              </div>
              <div>
                <dt className="font-semibold text-brand-muted">Updated</dt>
                <dd className="text-brand-navy">{selectedUser.updatedAt}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-sm text-brand-muted">Select a user row.</p>
          )}
        </section>

        {isRoleControlsMode ? (
          <>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-brand-navy">
            Change primary role
          </h2>
          <p className="mt-2 text-sm leading-7 text-brand-muted">
            Primary role is a display/default value. Access still depends on
            active role_assignments.
          </p>
          <label
            className="mt-4 block text-sm font-semibold text-brand-navy"
            htmlFor="primary-role-to-set"
          >
            New primary role
          </label>
          <select
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-brand-text"
            disabled={Boolean(busyAction) || !selectedUser}
            id="primary-role-to-set"
            onChange={(event) => setPrimaryRoleToSet(event.target.value)}
            value={primaryRoleToSet}
          >
            {assignableRoleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <label className="mt-4 flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold leading-6 text-brand-navy">
            <input
              checked={ensurePrimaryAssignment}
              className="mt-1 h-4 w-4 accent-brand-emerald"
              disabled={Boolean(busyAction) || !selectedUser}
              onChange={(event) =>
                setEnsurePrimaryAssignment(event.target.checked)
              }
              type="checkbox"
            />
            <span>Also ensure matching active role assignment.</span>
          </label>
          <button
            className="mt-4 min-h-12 w-full rounded-lg bg-brand-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-emerald disabled:cursor-not-allowed disabled:opacity-55"
            disabled={Boolean(busyAction) || !selectedUser}
            onClick={() => void changePrimaryRole()}
            type="button"
          >
            {busyAction === "change-primary-role"
              ? "Updating..."
              : "Change Primary Role"}
          </button>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-brand-navy">
            Activate role assignment
          </h2>
          <p className="mt-2 text-sm leading-7 text-brand-muted">
            Super Admin can ensure an active role assignment for manual account
            setup. This does not create role-specific profile rows such as
            FMS/agent profiles.
          </p>
          {(message || error) && (
            <div
              className={`mt-4 rounded-lg border p-3 text-sm font-semibold ${
                error
                  ? "border-brand-error bg-red-50 text-brand-error"
                  : "border-brand-emerald bg-emerald-50 text-brand-emerald"
              }`}
            >
              {error || message}
            </div>
          )}
          <label
            className="mt-4 block text-sm font-semibold text-brand-navy"
            htmlFor="role-to-assign"
          >
            Role to activate
          </label>
          <select
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-brand-text"
            disabled={Boolean(busyAction) || !selectedUser}
            id="role-to-assign"
            onChange={(event) => setRoleToAssign(event.target.value)}
            value={roleToAssign}
          >
            {assignableRoleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <label className="mt-4 flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold leading-6 text-brand-navy">
            <input
              checked={makePrimaryRole}
              className="mt-1 h-4 w-4 accent-brand-emerald"
              disabled={Boolean(busyAction) || !selectedUser}
              onChange={(event) => setMakePrimaryRole(event.target.checked)}
              type="checkbox"
            />
            <span>Also set this as user_profiles.primary_role.</span>
          </label>
          <label className="mt-4 flex gap-3 rounded-lg border border-brand-gold bg-amber-50 p-3 text-sm font-semibold leading-6 text-brand-navy">
            <input
              checked={confirmedPrivilegedRole}
              className="mt-1 h-4 w-4 accent-brand-emerald"
              disabled={Boolean(busyAction) || !selectedUser}
              onChange={(event) =>
                setConfirmedPrivilegedRole(event.target.checked)
              }
              type="checkbox"
            />
            <span>
              I confirm privileged role changes are intentional and approved.
            </span>
          </label>
          <button
            className="mt-4 min-h-12 w-full rounded-lg bg-brand-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-emerald disabled:cursor-not-allowed disabled:opacity-55"
            disabled={Boolean(busyAction) || !selectedUser}
            onClick={() => void assignRole()}
            type="button"
          >
            {busyAction === "assign-role" ? "Activating..." : "Ensure Active Role"}
          </button>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-brand-navy">
            Revoke or simplify roles
          </h2>
          <p className="mt-2 text-sm leading-7 text-brand-muted">
            Revocation marks role assignments revoked instead of deleting role
            history.
          </p>
          <label
            className="mt-4 block text-sm font-semibold text-brand-navy"
            htmlFor="role-to-revoke"
          >
            Role to revoke
          </label>
          <select
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-brand-text"
            disabled={Boolean(busyAction) || !selectedUser}
            id="role-to-revoke"
            onChange={(event) => setRoleToRevoke(event.target.value)}
            value={roleToRevoke}
          >
            {assignableRoleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button
            className="mt-3 min-h-12 w-full rounded-lg border border-brand-error bg-red-50 px-5 py-3 text-sm font-bold text-brand-error transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-55"
            disabled={Boolean(busyAction) || !selectedUser}
            onClick={() => void revokeRole()}
            type="button"
          >
            {busyAction === "revoke-role" ? "Revoking..." : "Revoke Role"}
          </button>

          <label
            className="mt-5 block text-sm font-semibold text-brand-navy"
            htmlFor="single-role-to-keep"
          >
            Convert to single role
          </label>
          <select
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-brand-text"
            disabled={Boolean(busyAction) || !selectedUser}
            id="single-role-to-keep"
            onChange={(event) => setSingleRoleToKeep(event.target.value)}
            value={singleRoleToKeep}
          >
            {assignableRoleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button
            className="mt-3 min-h-12 w-full rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-brand-navy transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-55"
            disabled={Boolean(busyAction) || !selectedUser}
            onClick={() => void convertToSingleRole()}
            type="button"
          >
            {busyAction === "single-role"
              ? "Converting..."
              : "Keep One Role, Revoke Others"}
          </button>

          <label className="mt-4 flex gap-3 rounded-lg border border-brand-gold bg-amber-50 p-3 text-sm font-semibold leading-6 text-brand-navy">
            <input
              checked={confirmSelfLockout}
              className="mt-1 h-4 w-4 accent-brand-emerald"
              disabled={Boolean(busyAction) || !selectedUser}
              onChange={(event) => setConfirmSelfLockout(event.target.checked)}
              type="checkbox"
            />
            <span>
              I confirm this may affect my own Super Admin access if I selected
              my account.
            </span>
          </label>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-brand-navy">
            FMS profile setup
          </h2>
          <p className="mt-2 text-sm leading-7 text-brand-muted">
            Use only after adding an active FMS role. This creates or activates
            a basic FMS profile for assignment workflows.
          </p>
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-semibold leading-6 text-brand-muted">
            Importer profile: {selectedUser?.hasImporterProfile ? "exists" : "missing"}
            <br />
            FMS profile: {selectedUser?.hasFmsProfile ? "exists" : "missing"}
            <br />
            Agent profile: {selectedUser?.hasAgentProfile ? "exists" : "missing"}
          </div>
          <label
            className="mt-4 block text-sm font-semibold text-brand-navy"
            htmlFor="fms-code"
          >
            FMS code
          </label>
          <input
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text"
            disabled={Boolean(busyAction) || !selectedUser}
            id="fms-code"
            onChange={(event) => setFmsCode(event.target.value)}
            placeholder="FMS-CN-001"
            value={fmsCode}
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label
                className="block text-sm font-semibold text-brand-navy"
                htmlFor="fms-tier"
              >
                Tier
              </label>
              <select
                className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-brand-text"
                disabled={Boolean(busyAction) || !selectedUser}
                id="fms-tier"
                onChange={(event) => setFmsTier(event.target.value)}
                value={fmsTier}
              >
                {["bronze", "silver", "gold"].map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-sm font-semibold text-brand-navy"
                htmlFor="fms-profile-status"
              >
                Status
              </label>
              <select
                className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-brand-text"
                disabled={Boolean(busyAction) || !selectedUser}
                id="fms-profile-status"
                onChange={(event) => setFmsProfileStatus(event.target.value)}
                value={fmsProfileStatus}
              >
                {["pending", "active", "suspended", "revoked"].map(
                  (status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
          <label
            className="mt-4 block text-sm font-semibold text-brand-navy"
            htmlFor="fms-city-province"
          >
            City/province
          </label>
          <input
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text"
            disabled={Boolean(busyAction) || !selectedUser}
            id="fms-city-province"
            onChange={(event) => setFmsCityProvince(event.target.value)}
            placeholder="Zhejiang / Yiwu"
            value={fmsCityProvince}
          />
          <label
            className="mt-4 block text-sm font-semibold text-brand-navy"
            htmlFor="fms-categories"
          >
            Categories
          </label>
          <input
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text"
            disabled={Boolean(busyAction) || !selectedUser}
            id="fms-categories"
            onChange={(event) => setFmsCategories(event.target.value)}
            value={fmsCategories}
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label
                className="block text-sm font-semibold text-brand-navy"
                htmlFor="fms-academy-status"
              >
                Academy
              </label>
              <select
                className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-brand-text"
                disabled={Boolean(busyAction) || !selectedUser}
                id="fms-academy-status"
                onChange={(event) => setFmsAcademyStatus(event.target.value)}
                value={fmsAcademyStatus}
              >
                {["not_started", "in_progress", "certified", "suspended"].map(
                  (status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <label
                className="block text-sm font-semibold text-brand-navy"
                htmlFor="fms-quality-score"
              >
                Quality score
              </label>
              <input
                className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text"
                disabled={Boolean(busyAction) || !selectedUser}
                id="fms-quality-score"
                max="100"
                min="0"
                onChange={(event) => setFmsQualityScore(event.target.value)}
                type="number"
                value={fmsQualityScore}
              />
            </div>
          </div>
          <button
            className="mt-4 min-h-12 w-full rounded-lg bg-brand-emerald px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-navy disabled:cursor-not-allowed disabled:opacity-55"
            disabled={Boolean(busyAction) || !selectedUser}
            onClick={() => void upsertFmsProfile()}
            type="button"
          >
            {busyAction === "fms-profile"
              ? "Saving..."
              : "Create / Activate FMS Profile"}
          </button>
        </section>
          </>
        ) : null}

        {!isRoleControlsMode ? (
          <>
        <section className="rounded-lg border border-brand-error bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-brand-error">
            Deactivate or delete
          </h2>
          <p className="mt-2 text-sm leading-7 text-brand-muted">
            Suspension is preferred. Auth user deletion uses Supabase soft
            delete and historical app records may remain for audit/history.
          </p>
          <label className="mt-4 flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold leading-6 text-brand-navy">
            <input
              checked={revokeRolesOnSuspend}
              className="mt-1 h-4 w-4 accent-brand-emerald"
              disabled={Boolean(busyAction) || !selectedUser}
              onChange={(event) =>
                setRevokeRolesOnSuspend(event.target.checked)
              }
              type="checkbox"
            />
            <span>Also revoke all active roles when suspending.</span>
          </label>
          <button
            className="mt-4 min-h-12 w-full rounded-lg border border-brand-error bg-red-50 px-5 py-3 text-sm font-bold text-brand-error transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-55"
            disabled={Boolean(busyAction) || !selectedUser}
            onClick={() => void suspendUser()}
            type="button"
          >
            {busyAction === "suspend-user" ? "Suspending..." : "Suspend User"}
          </button>

          <label
            className="mt-5 block text-sm font-semibold text-brand-navy"
            htmlFor="delete-confirmation"
          >
            Type DELETE USER for Auth soft delete
          </label>
          <input
            className="mt-2 min-h-12 w-full rounded-lg border border-brand-error bg-white px-4 text-brand-text"
            disabled={Boolean(busyAction) || !selectedUser}
            id="delete-confirmation"
            onChange={(event) => setDeleteConfirmation(event.target.value)}
            placeholder="DELETE USER"
            value={deleteConfirmation}
          />
          <label className="mt-4 flex gap-3 rounded-lg border border-brand-gold bg-amber-50 p-3 text-sm font-semibold leading-6 text-brand-navy">
            <input
              checked={confirmSelfDelete}
              className="mt-1 h-4 w-4 accent-brand-emerald"
              disabled={Boolean(busyAction) || !selectedUser}
              onChange={(event) => setConfirmSelfDelete(event.target.checked)}
              type="checkbox"
            />
            <span>
              I confirm this is my own account if I selected myself.
            </span>
          </label>
          <button
            className="mt-4 min-h-12 w-full rounded-lg bg-brand-error px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-navy disabled:cursor-not-allowed disabled:opacity-55"
            disabled={
              Boolean(busyAction) ||
              !selectedUser ||
              deleteConfirmation !== "DELETE USER"
            }
            onClick={() => void softDeleteAuthUser()}
            type="button"
          >
            {busyAction === "delete-user"
              ? "Soft deleting..."
              : "Soft Delete Auth User"}
          </button>
        </section>

        <section className="rounded-lg border border-brand-error bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-brand-error">
            Reset password
          </h2>
          <p className="mt-2 text-sm leading-7 text-brand-muted">
            This replaces the current password for this user through the Supabase Admin
            Auth API. The password is not displayed later and is not stored in
            app metadata.
          </p>
          {(message || error) && (
            <div
              className={`mt-4 rounded-lg border p-3 text-sm font-semibold ${
                error
                  ? "border-brand-error bg-red-50 text-brand-error"
                  : "border-brand-emerald bg-emerald-50 text-brand-emerald"
              }`}
            >
              {error || message}
            </div>
          )}
          <label
            className="mt-4 block text-sm font-semibold text-brand-navy"
            htmlFor="temporary-password"
          >
            Temporary password
          </label>
          <input
            autoComplete="new-password"
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text"
            disabled={isResetting || !selectedUser}
            id="temporary-password"
            onChange={(event) => setTemporaryPassword(event.target.value)}
            placeholder="Do not store this in notes"
            type="password"
            value={temporaryPassword}
          />
          <p className="mt-2 text-xs font-semibold text-brand-muted">
            {getPasswordHint(temporaryPassword)}
          </p>
          <label className="mt-4 flex gap-3 rounded-lg border border-brand-gold bg-amber-50 p-3 text-sm font-semibold leading-6 text-brand-navy">
            <input
              checked={confirmed}
              className="mt-1 h-4 w-4 accent-brand-emerald"
              disabled={isResetting || !selectedUser}
              onChange={(event) => setConfirmed(event.target.checked)}
              type="checkbox"
            />
            <span>
              This will replace the current password for this user. I understand this
              action must be shared securely outside the platform.
            </span>
          </label>
          <button
            className="mt-4 min-h-12 w-full rounded-lg bg-brand-error px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-navy disabled:cursor-not-allowed disabled:opacity-55"
            disabled={
              isResetting || !selectedUser || !confirmed || !temporaryPassword
            }
            onClick={() => void resetPassword()}
            type="button"
          >
            {isResetting ? "Resetting..." : "Set Temporary Password"}
          </button>
        </section>
          </>
        ) : null}
      </aside>
    </div>
  );
}

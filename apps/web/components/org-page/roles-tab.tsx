'use client'

import { ALL_PERMISSIONS, PERMISSIONS } from '@app/db/schema'
import { Loader2, Lock, Pencil, Plus, Shield, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { hasPermission } from '@/lib/permissions-client'

type Role = {
  id: string
  name: string
  isSystem: boolean
  permissions: string[]
  createdAt: string
  updatedAt: string
}

const PERMISSION_LABELS: Record<string, string> = {
  create_order: 'Create orders',
  edit_order: 'Edit orders',
  place_order: 'Place orders',
  invite_members: 'Invite members',
  manage_roles: 'Manage roles',
  manage_agents: 'Manage agents',
  manage_products: 'Manage products',
  edit_org_details: 'Edit organization details',
}

export function RolesTab({
  organizationId,
  permissions,
  isAdmin,
}: {
  organizationId: string
  permissions: string[]
  isAdmin: boolean
}) {
  const [roles, setRoles] = useState<Role[]>([])
  const [isPending, setIsPending] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [roleName, setRoleName] = useState('')
  const [rolePerms, setRolePerms] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const canManage = isAdmin || hasPermission(permissions, 'manage_roles')

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch(`/api/organizations/${organizationId}/roles`)
      if (res.ok) {
        const data = await res.json()
        setRoles(data.roles ?? [])
      }
    } finally {
      setIsPending(false)
    }
  }, [organizationId])

  useEffect(() => {
    void fetchRoles()
  }, [fetchRoles])

  const openCreateDialog = () => {
    setEditingRole(null)
    setRoleName('')
    setRolePerms([])
    setError(null)
    setDialogOpen(true)
  }

  const openEditDialog = (role: Role) => {
    setEditingRole(role)
    setRoleName(role.name)
    setRolePerms([...role.permissions])
    setError(null)
    setDialogOpen(true)
  }

  const togglePerm = (perm: string) => {
    setRolePerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    const url = editingRole
      ? `/api/organizations/${organizationId}/roles/${editingRole.id}`
      : `/api/organizations/${organizationId}/roles`

    const res = await fetch(url, {
      method: editingRole ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: roleName, permissions: rolePerms }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Failed to save role')
      setIsSaving(false)
      return
    }

    setDialogOpen(false)
    setIsSaving(false)
    void fetchRoles()
  }

  const handleDelete = async (roleId: string) => {
    setDeleteError(null)
    const res = await fetch(
      `/api/organizations/${organizationId}/roles/${roleId}`,
      { method: 'DELETE' },
    )

    if (!res.ok) {
      const data = await res.json()
      setDeleteError(data.error ?? 'Failed to delete role')
      return
    }

    void fetchRoles()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Roles</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage roles and permissions for your organization
          </p>
        </div>
        {canManage && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openCreateDialog}>
                <Plus className="h-4 w-4" />
                Create role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingRole ? 'Edit role' : 'Create role'}
                </DialogTitle>
                <DialogDescription>
                  {editingRole
                    ? 'Update the role name and permissions.'
                    : 'Create a new role with specific permissions.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSave} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="role-name">Role name</Label>
                  <Input
                    id="role-name"
                    type="text"
                    placeholder="e.g. Manager"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Permissions</Label>
                  <div className="grid gap-2">
                    {ALL_PERMISSIONS.map((perm) => (
                      <label
                        key={perm}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={rolePerms.includes(perm)}
                          onCheckedChange={() => togglePerm(perm)}
                        />
                        {PERMISSION_LABELS[perm] ?? perm}
                      </label>
                    ))}
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <DialogFooter>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : editingRole ? (
                      'Save changes'
                    ) : (
                      'Create role'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Separator className="my-6" />

      {deleteError && (
        <p className="mb-4 text-sm text-destructive">{deleteError}</p>
      )}

      {isPending ? (
        <div className="space-y-3">
          <div className="h-12 animate-pulse rounded bg-muted" />
          <div className="h-12 animate-pulse rounded bg-muted" />
        </div>
      ) : roles.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">No roles found.</p>
      ) : (
        <div className="grid gap-3">
          {roles.map((role) => (
            <div
              key={role.id}
              className="flex items-center justify-between rounded-md border px-4 py-3"
            >
              <div className="flex items-center gap-3">
                {role.isSystem ? (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Shield className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{role.name}</span>
                    {role.isSystem && <Badge variant="secondary">System</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {role.isSystem
                      ? 'All permissions'
                      : role.permissions.length === 0
                        ? 'No permissions'
                        : `${role.permissions.length} permission${role.permissions.length === 1 ? '' : 's'}`}
                  </p>
                </div>
              </div>
              {canManage && !role.isSystem && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditDialog(role)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(role.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DropdownOption } from '@/types/task'
import { Plus, Edit, Trash2, Settings } from 'lucide-react'
import { showToast } from '@/components/toast'

interface AdminDropdownManagerProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminDropdownManager({ isOpen, onClose }: AdminDropdownManagerProps) {
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>([])
  const [loading, setLoading] = useState(false)
  const [editingOption, setEditingOption] = useState<DropdownOption | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedField, setSelectedField] = useState<string>('')

  const fieldNames = [
    'project',
    'stage_gates',
    'task_type', 
    'frequency',
    'priority',
    'status',
    'assigned_to'
  ]

  const fieldLabels: Record<string, string> = {
    project: 'Project',
    stage_gates: 'Stage Gates',
    task_type: 'Task Type',
    frequency: 'Frequency',
    priority: 'Priority',
    status: 'Status',
    assigned_to: 'Assigned To'
  }

  useEffect(() => {
    if (isOpen) {
      fetchDropdownOptions()
    }
  }, [isOpen])

  const fetchDropdownOptions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/dropdown-options')
      if (response.ok) {
        const data = await response.json()
        setDropdownOptions(data.options || [])
      } else {
        showToast.error('Failed to fetch dropdown options')
      }
    } catch (error) {
      console.error('Error fetching dropdown options:', error)
      showToast.error('Error fetching dropdown options')
    } finally {
      setLoading(false)
    }
  }

  const handleAddOption = async (formData: Partial<DropdownOption>) => {
    try {
      const response = await fetch('/api/admin/dropdown-options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        showToast.success('Dropdown option added successfully')
        fetchDropdownOptions()
        setIsAddDialogOpen(false)
      } else {
        showToast.error('Failed to add dropdown option')
      }
    } catch (error) {
      console.error('Error adding dropdown option:', error)
      showToast.error('Error adding dropdown option')
    }
  }

  const handleUpdateOption = async (formData: Partial<DropdownOption>) => {
    if (!editingOption) return

    try {
      const response = await fetch('/api/admin/dropdown-options', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, id: editingOption.id }),
      })

      if (response.ok) {
        showToast.success('Dropdown option updated successfully')
        fetchDropdownOptions()
        setIsEditDialogOpen(false)
        setEditingOption(null)
      } else {
        showToast.error('Failed to update dropdown option')
      }
    } catch (error) {
      console.error('Error updating dropdown option:', error)
      showToast.error('Error updating dropdown option')
    }
  }

  const handleDeleteOption = async (id: string) => {
    if (!confirm('Are you sure you want to delete this option?')) return

    try {
      const response = await fetch(`/api/admin/dropdown-options?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        showToast.success('Dropdown option deleted successfully')
        fetchDropdownOptions()
      } else {
        showToast.error('Failed to delete dropdown option')
      }
    } catch (error) {
      console.error('Error deleting dropdown option:', error)
      showToast.error('Error deleting dropdown option')
    }
  }

  const filteredOptions = selectedField && selectedField !== 'all'
    ? dropdownOptions.filter(option => option.field_name === selectedField)
    : dropdownOptions

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin - Dropdown Options Management
          </DialogTitle>
          <DialogDescription>
            Manage dropdown options for task fields. You can add, edit, or delete options for each field.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filter by field */}
          <div className="flex items-center gap-4">
            <Label htmlFor="field-filter">Filter by Field:</Label>
            <Select value={selectedField} onValueChange={setSelectedField}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Fields" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                {fieldNames.map(field => (
                  <SelectItem key={field} value={field}>
                    {fieldLabels[field]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Option
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Dropdown Option</DialogTitle>
                </DialogHeader>
                <AddOptionForm 
                  onSubmit={handleAddOption}
                  fieldNames={fieldNames}
                  fieldLabels={fieldLabels}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Options table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredOptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No dropdown options found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOptions.map((option) => (
                    <TableRow key={option.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {fieldLabels[option.field_name] || option.field_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {option.option_value}
                      </TableCell>
                      <TableCell>{option.option_label}</TableCell>
                      <TableCell>{option.sort_order}</TableCell>
                      <TableCell>
                        <Badge variant={option.is_active ? "default" : "secondary"}>
                          {option.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingOption(option)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteOption(option.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Dropdown Option</DialogTitle>
            </DialogHeader>
            {editingOption && (
              <EditOptionForm 
                option={editingOption}
                onSubmit={handleUpdateOption}
                fieldNames={fieldNames}
                fieldLabels={fieldLabels}
              />
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}

// Add Option Form Component
function AddOptionForm({ 
  onSubmit, 
  fieldNames, 
  fieldLabels 
}: { 
  onSubmit: (data: Partial<DropdownOption>) => void
  fieldNames: string[]
  fieldLabels: Record<string, string>
}) {
  const [formData, setFormData] = useState({
    field_name: '',
    option_value: '',
    option_label: '',
    sort_order: 0,
    is_active: true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="field_name">Field Name</Label>
        <Select value={formData.field_name} onValueChange={(value) => setFormData(prev => ({ ...prev, field_name: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            {fieldNames.map(field => (
              <SelectItem key={field} value={field}>
                {fieldLabels[field]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="option_value">Option Value</Label>
        <Input
          id="option_value"
          value={formData.option_value}
          onChange={(e) => setFormData(prev => ({ ...prev, option_value: e.target.value }))}
          placeholder="Enter option value"
          required
        />
      </div>

      <div>
        <Label htmlFor="option_label">Option Label</Label>
        <Input
          id="option_label"
          value={formData.option_label}
          onChange={(e) => setFormData(prev => ({ ...prev, option_label: e.target.value }))}
          placeholder="Enter option label"
          required
        />
      </div>

      <div>
        <Label htmlFor="sort_order">Sort Order</Label>
        <Input
          id="sort_order"
          type="number"
          value={formData.sort_order}
          onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
          placeholder="0"
        />
      </div>

      <DialogFooter>
        <Button type="submit">Add Option</Button>
      </DialogFooter>
    </form>
  )
}

// Edit Option Form Component
function EditOptionForm({ 
  option, 
  onSubmit, 
  fieldNames, 
  fieldLabels 
}: { 
  option: DropdownOption
  onSubmit: (data: Partial<DropdownOption>) => void
  fieldNames: string[]
  fieldLabels: Record<string, string>
}) {
  const [formData, setFormData] = useState({
    field_name: option.field_name,
    option_value: option.option_value,
    option_label: option.option_label,
    sort_order: option.sort_order,
    is_active: option.is_active
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="field_name">Field Name</Label>
        <Select value={formData.field_name} onValueChange={(value) => setFormData(prev => ({ ...prev, field_name: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            {fieldNames.map(field => (
              <SelectItem key={field} value={field}>
                {fieldLabels[field]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="option_value">Option Value</Label>
        <Input
          id="option_value"
          value={formData.option_value}
          onChange={(e) => setFormData(prev => ({ ...prev, option_value: e.target.value }))}
          placeholder="Enter option value"
          required
        />
      </div>

      <div>
        <Label htmlFor="option_label">Option Label</Label>
        <Input
          id="option_label"
          value={formData.option_label}
          onChange={(e) => setFormData(prev => ({ ...prev, option_label: e.target.value }))}
          placeholder="Enter option label"
          required
        />
      </div>

      <div>
        <Label htmlFor="sort_order">Sort Order</Label>
        <Input
          id="sort_order"
          type="number"
          value={formData.sort_order}
          onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
          placeholder="0"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <DialogFooter>
        <Button type="submit">Update Option</Button>
      </DialogFooter>
    </form>
  )
}

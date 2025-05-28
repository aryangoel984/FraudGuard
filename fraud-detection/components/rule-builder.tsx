"use client"

import { useState } from "react"
import { ChevronDown, Edit, Grip, Info, MoreHorizontal, Plus, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Rule {
  id: string
  name: string
  condition: string
  active: boolean
  description: string
}

interface RuleBuilderProps {
  ruleType: string
  initialRules: Rule[]
}

export function RuleBuilder({ ruleType, initialRules }: RuleBuilderProps) {
  const [rules, setRules] = useState<Rule[]>(initialRules)
  const [editingRule, setEditingRule] = useState<string | null>(null)
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false)
  const [newRule, setNewRule] = useState({ name: "", condition: "", description: "" })
  const [isSaving, setIsSaving] = useState(false)

  const toggleRuleActive = async (id: string) => {
    const updatedRules = rules.map((rule) => (rule.id === id ? { ...rule, active: !rule.active } : rule))
    setRules(updatedRules)

    // Save to backend
    try {
      const response = await fetch(`/api/rules/${id}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: updatedRules.find((r) => r.id === id)?.active }),
      })

      if (!response.ok) throw new Error("Failed to update rule status")
      toast({
        title: "Success",
        description: "Rule status updated",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error updating rule:", error)
      toast({
        title: "Error",
        description: "Failed to update rule status",
        variant: "destructive",
        duration: 3000,
      })
      // Revert on failure
      setRules(rules)
    }
  }

  const updateRuleCondition = (id: string, condition: string) => {
    setRules(rules.map((rule) => (rule.id === id ? { ...rule, condition } : rule)))
  }

  const saveRuleEdit = async (id: string) => {
    try {
      setIsSaving(true)
      const ruleToUpdate = rules.find((rule) => rule.id === id)

      if (!ruleToUpdate) return

      const response = await fetch(`/api/rules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ruleToUpdate),
      })

      if (!response.ok) throw new Error("Failed to save rule")

      setEditingRule(null)
      toast({
        title: "Success",
        description: "Rule updated successfully",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error saving rule:", error)
      toast({
        title: "Error",
        description: "Failed to save rule",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddRule = async () => {
    if (!newRule.name || !newRule.condition) {
      toast({
        title: "Validation Error",
        description: "Rule name and condition are required",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    try {
      setIsSaving(true)

      // In a real app, this would come from the backend
      const newId = `rule${Date.now()}`
      const ruleToAdd = {
        id: newId,
        name: newRule.name,
        condition: newRule.condition,
        description: newRule.description,
        active: true,
        ruleType,
      }

      const response = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ruleToAdd),
      })

      if (!response.ok) throw new Error("Failed to add rule")

      setRules([...rules, { ...ruleToAdd, id: newId }])
      setNewRule({ name: "", condition: "", description: "" })
      setIsAddRuleOpen(false)

      toast({
        title: "Success",
        description: "Rule added successfully",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error adding rule:", error)
      toast({
        title: "Error",
        description: "Failed to add rule",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteRule = async (id: string) => {
    try {
      const response = await fetch(`/api/rules/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete rule")

      setRules(rules.filter((rule) => rule.id !== id))
      toast({
        title: "Success",
        description: "Rule deleted successfully",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error deleting rule:", error)
      toast({
        title: "Error",
        description: "Failed to delete rule",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const updateRuleField = (id: string, field: string, value: string) => {
    setRules(rules.map((rule) => (rule.id === id ? { ...rule, [field]: value } : rule)))
  }

  return (
    <div className="space-y-2">
      {rules.map((rule) => (
        <Collapsible key={rule.id} className="rounded-md border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <Grip className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{rule.name}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{rule.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="text-xs text-muted-foreground">
                  {editingRule === rule.id ? (
                    <Input
                      value={rule.condition}
                      onChange={(e) => updateRuleCondition(rule.id, e.target.value)}
                      className="mt-1 h-8"
                    />
                  ) : (
                    rule.condition
                  )}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={rule.active}
                onCheckedChange={() => toggleRuleActive(rule.id)}
                aria-label={`Toggle ${rule.name}`}
              />
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ChevronDown className="h-4 w-4" />
                  <span className="sr-only">Toggle</span>
                </Button>
              </CollapsibleTrigger>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {editingRule === rule.id ? (
                    <DropdownMenuItem onClick={() => saveRuleEdit(rule.id)}>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => setEditingRule(rule.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleDeleteRule(rule.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <CollapsibleContent>
            <div className="border-t p-4">
              <div className="space-y-2">
                <div className="grid gap-2">
                  <Label htmlFor={`rule-${rule.id}-name`}>Rule Name</Label>
                  <Input
                    id={`rule-${rule.id}-name`}
                    value={rule.name}
                    onChange={(e) => updateRuleField(rule.id, "name", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`rule-${rule.id}-description`}>Description</Label>
                  <Input
                    id={`rule-${rule.id}-description`}
                    value={rule.description}
                    onChange={(e) => updateRuleField(rule.id, "description", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`rule-${rule.id}-condition`}>Condition</Label>
                  <Input
                    id={`rule-${rule.id}-condition`}
                    value={rule.condition}
                    onChange={(e) => updateRuleField(rule.id, "condition", e.target.value)}
                  />
                </div>
                <Button onClick={() => saveRuleEdit(rule.id)} disabled={isSaving} className="mt-2">
                  {isSaving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}

      <Dialog open={isAddRuleOpen} onOpenChange={setIsAddRuleOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Add Rule
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Rule</DialogTitle>
            <DialogDescription>Create a new rule for fraud detection</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rule-name">Rule Name</Label>
              <Input
                id="rule-name"
                placeholder="e.g., High Amount Transaction"
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rule-condition">Condition</Label>
              <Input
                id="rule-condition"
                placeholder="e.g., transaction_amount > 50000"
                value={newRule.condition}
                onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Use variables like transaction_amount, transaction_country, etc.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rule-description">Description</Label>
              <Textarea
                id="rule-description"
                placeholder="Describe what this rule detects"
                value={newRule.description}
                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddRule} disabled={isSaving}>
              {isSaving ? "Adding..." : "Add Rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


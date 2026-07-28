# Falcon Warriors - UI/UX Implementation Guide

## Overview
This guide explains how to use all the new UI/UX components and utilities that have been added to make admin and user workflows easier.

---

## 1. Radius and Shadow System

For new or edited components, follow this lightweight design system so the UI stays visually consistent without needing a full rewrite.

| Element type | Radius | Shadow | Notes |
| --- | --- | --- | --- |
| Button | `rounded-lg` | None | Keep it flat by default; use a color change on hover for interaction feedback. |
| Card | `rounded-xl` | `shadow-md` by default, `shadow-lg` on hover | Use for standard content cards and list items. |
| Modal / Dialog | `rounded-2xl` | `shadow-2xl` | Use for overlays and high-priority surfaces. |
| Avatar / Icon | `rounded-full` | None | Use for profile images, badges, and small icon containers. |
| Achievement / Winner Highlight | `rounded-xl` | `shadow-gold` | Use for premium emphasis, winner states, or featured achievements. |

### Usage Examples

```tsx
<button className="rounded-lg transition-colors hover:bg-gold/10">
  Save
</button>

<div className="rounded-xl border border-border bg-surface p-4 shadow-md transition-shadow hover:shadow-lg">
  Content card
</div>

<div className="rounded-2xl border border-border bg-surface p-6 shadow-2xl">
  Modal content
</div>

<div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
  A
</div>

<div className="rounded-xl bg-gold/10 p-4 shadow-gold">
  Featured achievement
</div>
```

> Apply this pattern to newly created components first. Existing components can be migrated gradually over time.

---

## 2. Validation System

### Location
`app/lib/utils/validation.ts`

### Features
- Real-time field validation
- Pre-built validation rules for common fields
- Custom validation support
- Batch form validation

### Usage Example

```typescript
import { validateField, fieldValidators, validateForm } from "@/app/lib/utils/validation";

// Single field validation
const result = validateField("tournament name", fieldValidators.tournamentName);
if (!result.isValid) {
  console.log(result.error); // "Tournament Name must be at least 3 characters"
}

// Form validation
const errors = validateForm(formData, {
  name: fieldValidators.tournamentName,
  date: fieldValidators.matchDate,
  title: fieldValidators.newsTitle,
});
```

### Available Validators
- `VALIDATION_RULES.required(fieldName)` - Required field
- `VALIDATION_RULES.minLength(length, fieldName)` - Minimum characters
- `VALIDATION_RULES.maxLength(length, fieldName)` - Maximum characters
- `VALIDATION_RULES.email()` - Email format
- `VALIDATION_RULES.url()` - URL format
- `VALIDATION_RULES.number(fieldName)` - Numeric value
- `VALIDATION_RULES.date()` - Valid date format
- `VALIDATION_RULES.futureDate()` - Date must be in future

### Pre-built Field Validators
- `fieldValidators.tournamentName`
- `fieldValidators.matchDate`
- `fieldValidators.newsTitle`
- `fieldValidators.newsContent`
- `fieldValidators.playerUsername`
- `fieldValidators.score`

---

## 2. Skeleton Loaders

### Location
`app/components/Skeletons.tsx`

### Available Skeletons
- `TextSkeleton` - Animated text placeholder
- `CardSkeleton` - Card layout placeholder
- `TableSkeleton` - Table layout placeholder
- `ImageSkeleton` - Image placeholder
- `MatchCardSkeleton` - Match card placeholder
- `TournamentCardSkeleton` - Tournament card placeholder
- `DashboardCardSkeleton` - Dashboard card placeholder
- `FormSkeleton` - Form placeholder
- `PageHeaderSkeleton` - Page header placeholder
- `GridSkeleton` - Grid of cards placeholder

### Usage Example

```typescript
import { CardSkeleton, TableSkeleton, GridSkeleton } from "@/app/components/Skeletons";

// Single card skeleton
<CardSkeleton />

// Table with 5 rows, 4 columns
<TableSkeleton rows={5} columns={4} />

// Grid of 6 card skeletons
<GridSkeleton items={6} />
```

---

## 3. Falcon Spinner Loader

### Location
`app/components/FalconSpinner.tsx`

### Features
- Branded falcon icon loader
- Multiple sizes (sm, md, lg, xl)
- Full-screen overlay option
- Customizable text
- Minimal variant for inline use

### Usage Examples

```typescript
import FalconSpinner, { FalconSpinnerInline, FalconSpinnerFullscreen } from "@/app/components/FalconSpinner";

// Default spinner with text
<FalconSpinner size="md" text="Loading tournaments..." />

// Inline spinner for buttons
<FalconSpinnerInline size="sm" />

// Full-screen overlay
<FalconSpinnerFullscreen text="Generating fixtures..." />
```

### Props
- `size`: "sm" | "md" | "lg" | "xl" (default: "md")
- `fullScreen`: boolean - Show as overlay
- `text`: string - Loading text
- `variant`: "default" | "minimal" - Display style

---

## 4. Toast Notifications

### Location
`app/components/Toast.tsx`

### Features
- Success, error, info, warning types
- Auto-dismiss with configurable duration
- Manual close button
- Stacked notifications
- Theme-aligned colors

### Usage Example

```typescript
import { useToast, ToastContainer } from "@/app/components/Toast";

export function MyComponent() {
  const { toasts, addToast, removeToast } = useToast();

  return (
    <>
      <button onClick={() => addToast("Tournament created!", "success")}>
        Create Tournament
      </button>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
```

### Toast Types
- `success` - Green/gold notification
- `error` - Gold warning notification
- `info` - Blue information notification
- `warning` - Gold warning notification

---

## 5. Confirmation Dialog

### Location
`app/components/ConfirmDialog.tsx`

### Features
- Modal confirmation dialog
- Customizable title, message, and buttons
- Dangerous action styling (red tint)
- Keyboard support (Escape to close)
- Loading state

### Usage Example

```typescript
import { ConfirmDialog } from "@/app/components/ConfirmDialog";
import { useState } from "react";

export function DeleteButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await deleteItem();
    setLoading(false);
    setOpen(false);
  }

  return (
    <>
      <button onClick={() => setOpen(true)}>Delete</button>
      <ConfirmDialog
        isOpen={open}
        title="Delete Tournament?"
        message="This action cannot be undone. All associated matches will be deleted."
        confirmText="Delete"
        isDangerous={true}
        isLoading={loading}
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
```

---

## 6. Empty State

### Location
`app/components/EmptyState.tsx`

### Features
- Centered empty state display
- Icon, title, description
- Optional action button
- Theme-aligned styling

### Usage Example

```typescript
import { EmptyState } from "@/app/components/EmptyState";
import { Trophy } from "lucide-react";

<EmptyState
  icon={Trophy}
  title="No tournaments yet"
  description="Create your first tournament to get started"
  action={{
    label: "Create Tournament",
    href: "/dashboard/tournaments/new",
  }}
/>
```

---

## 7. Breadcrumb Navigation

### Location
`app/components/Breadcrumb.tsx`

### Features
- Hierarchical navigation display
- Active page highlight
- Links for navigation
- Theme-aligned styling

### Usage Example

```typescript
import { Breadcrumb } from "@/app/components/Breadcrumb";

<Breadcrumb
  items={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Tournaments", href: "/dashboard/tournaments" },
    { label: "Create New", current: true },
  ]}
/>
```

---

## 8. Metadata & SEO

### Pages with Metadata
All main pages now have proper metadata:
- `/` - Home
- `/tournaments` - Tournaments list
- `/matches` - Matches list
- `/news` - News
- `/players` - Players roster
- `/leaderboards` - Rankings
- `/achievements` - Hall of Fame
- `/ballon-dor` - Ballon d'Or awards

### Favicon
The favicon is automatically set from `/public/favicon.png`

### OpenGraph Tags
All pages include OpenGraph tags for social media sharing

---

## 9. Theme Color System

All error messages and status indicators use the unified theme:
- **Gold**: Warnings, errors, important actions
- **Indigo**: Primary actions, information
- **White/Muted**: Secondary, disabled states

---

## Integration Checklist

### For Dashboard Forms
- [ ] Add validation rules to form submission
- [ ] Show validation errors real-time
- [ ] Display spinner while loading
- [ ] Show success/error toast after action
- [ ] Add confirmation for destructive actions

### For List Pages
- [ ] Show skeleton while loading data
- [ ] Display empty state when no data
- [ ] Add breadcrumb navigation
- [ ] Include page metadata

### For Admin Pages
- [ ] Use confirmation dialogs for delete/update
- [ ] Show inline help text for complex fields
- [ ] Add success notifications for actions
- [ ] Validate required fields before submit

---

## Example: Complete Tournament Form with All Features

```typescript
"use client";

import { useState } from "react";
import { useToast, ToastContainer } from "@/app/components/Toast";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";
import { validateForm, fieldValidators } from "@/app/lib/utils/validation";
import FalconSpinner from "@/app/components/FalconSpinner";

export function EnhancedTournamentForm() {
  const { toasts, addToast, removeToast } = useToast();
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validate
    const newErrors = validateForm(
      { name },
      { name: fieldValidators.tournamentName }
    );
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast("Please fix the errors", "error");
      return;
    }

    setConfirmOpen(true);
  }

  async function handleConfirm() {
    setLoading(true);
    try {
      await createTournament({ name });
      addToast("Tournament created successfully!", "success");
    } catch (err) {
      addToast("Failed to create tournament", "error");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
      {loading && <FalconSpinner fullScreen text="Creating tournament..." />}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1">Tournament Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full rounded border ${errors.name ? "border-gold bg-gold/5" : "border-white/10"} px-3 py-2`}
          />
          {errors.name && <p className="text-xs text-gold mt-1">{errors.name}</p>}
        </div>

        <button type="submit" className="px-4 py-2 bg-indigo/20 text-indigo-light rounded">
          Create Tournament
        </button>
      </form>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Create Tournament"
        message={`Create tournament "${name}"?`}
        confirmText="Create"
        isLoading={loading}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
```

---

## Performance Tips

1. **Lazy Load Components**: Use React.lazy() for heavy components
2. **Skeleton Loading**: Show skeletons while data loads
3. **Debounce Validation**: Avoid real-time validation on every keystroke
4. **Memoize Callbacks**: Use useCallback for form handlers
5. **Batch Updates**: Group state updates when possible

---

## Accessibility Notes

- All dialogs close with Escape key
- Toast notifications announce to screen readers
- Form error messages are associated with inputs
- Breadcrumb uses semantic nav element
- Color is not the only indicator (icons used too)

---

## Need to Add More?

To add new validation rules:
```typescript
// In app/lib/utils/validation.ts
export const VALIDATION_RULES = {
  myCustomRule: () => ({
    validate: (value) => myValidation(value) ? true : "Error message"
  })
}
```

To add new skeleton variants:
```typescript
// In app/components/Skeletons.tsx
export function MyCustomSkeleton() {
  return <div className="animate-pulse rounded bg-white/10 h-12" />;
}
```

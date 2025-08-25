# Feature Flags

This project uses environment-based feature flags to control which features are enabled or disabled. This is particularly useful for demo environments or gradual feature rollouts.

## Configuration

Feature flags are defined in `/lib/constants.ts` and controlled via environment variables in `.env.local`.

### Available Feature Flags

| Flag | Environment Variable | Default | Description |
|------|---------------------|---------|-------------|
| `DEMO_MODE` | `NEXT_PUBLIC_DEMO_MODE` | `false` | Enables demo mode (can be used to disable multiple features at once) |
| `EXPORT_SAMPLES` | `NEXT_PUBLIC_FEATURE_EXPORT_SAMPLES` | `true` | Controls the "Export Sample" button in Inverse Design |
| `USER_INVITES` | `NEXT_PUBLIC_FEATURE_USER_INVITES` | `true` | Controls user invitation functionality |
| `FILE_UPLOADS` | `NEXT_PUBLIC_FEATURE_FILE_UPLOADS` | `true` | Controls file upload capabilities |
| `FILE_DELETES` | `NEXT_PUBLIC_FEATURE_FILE_DELETES` | `true` | Controls file deletion capabilities |

## Usage

### Setting Feature Flags

Add to your `.env.local` file:

```bash
# Disable export functionality for demo
NEXT_PUBLIC_FEATURE_EXPORT_SAMPLES=false

# Disable user invitations
NEXT_PUBLIC_FEATURE_USER_INVITES=false

# Disable file deletion
NEXT_PUBLIC_FEATURE_FILE_DELETES=false

# Enable demo mode
NEXT_PUBLIC_DEMO_MODE=true
```

### Using in Components

#### Simple Show/Hide Pattern
```tsx
import { isFeatureEnabled } from "@/lib/constants"

export default function MyComponent() {
  return (
    <div>
      {isFeatureEnabled('EXPORT_SAMPLES') && (
        <button onClick={handleExport}>Export Data</button>
      )}
      
      {isFeatureEnabled('USER_INVITES') && (
        <button onClick={handleInvite}>Invite User</button>
      )}
    </div>
  )
}
```

#### Disabled Button with Tooltip Pattern
```tsx
import { isFeatureEnabled, getFeatureDisabledReason } from "@/lib/constants"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"

export default function MyComponent() {
  const exportDisabledReason = getFeatureDisabledReason('EXPORT_SAMPLES')
  
  return (
    <TooltipProvider>
      {isFeatureEnabled('EXPORT_SAMPLES') ? (
        <button onClick={handleExport}>Export Data</button>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-block">
              <button disabled className="cursor-not-allowed">
                Export Data
              </button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{exportDisabledReason || "Feature is disabled"}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </TooltipProvider>
  )
}
```

### Direct Flag Access

```tsx
import { FEATURE_FLAGS } from "@/lib/constants"

const isDemoMode = FEATURE_FLAGS.DEMO_MODE
const canExport = FEATURE_FLAGS.EXPORT_SAMPLES
```

## Implementation Examples

### Current Implementations

1. **Export Sample Button** (`/views/design/page.tsx`)
   - Controlled by `EXPORT_SAMPLES` flag
   - When disabled: Shows a disabled button with tooltip explaining why
   - Tooltip shows "This feature is disabled in demo mode" when `DEMO_MODE=true`
   - Uses `getFeatureDisabledReason()` to provide context-specific messages

2. **User Invite System** (`/settings/users/page.tsx`)
   - Controlled by `USER_INVITES` flag
   - Hides invite buttons and modal when disabled

3. **Upload File Button** (`/data/[id]/file-sidebar.tsx`)
   - Controlled by `FILE_UPLOADS` flag
   - When disabled: Shows a disabled button with tooltip explaining why
   - Tooltip shows "This feature is disabled in demo mode" when `DEMO_MODE=true`
   - Maintains consistent UX with Export Sample button

4. **Delete File Button** (`/data/[id]/file-sidebar-item.tsx`)
   - Controlled by `FILE_DELETES` flag
   - When disabled: Delete button is completely hidden from the file list
   - Automatically disabled when `DEMO_MODE=true`

## Adding New Feature Flags

1. **Add to constants file** (`/lib/constants.ts`):
```tsx
export const FEATURE_FLAGS = {
  // ... existing flags
  NEW_FEATURE: process.env.NEXT_PUBLIC_FEATURE_NEW_FEATURE !== 'false',
} as const
```

2. **Use in components**:
```tsx
{isFeatureEnabled('NEW_FEATURE') && <NewFeatureComponent />}
```

3. **Document the flag** in this file and add environment variable to `.env.local`

## Notes

- All feature flag environment variables must start with `NEXT_PUBLIC_` to be available in the browser
- Default behavior is `true` (enabled) unless explicitly set to `'false'`
- Flags are evaluated at build time, so changes require a restart of the development server
- Use feature flags sparingly to avoid code complexity
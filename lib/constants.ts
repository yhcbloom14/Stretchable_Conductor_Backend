export const FEASIBILITY_CUTOFF = 0.6
export const UNCERTAINTY_CUTOFF = 30
export const PRECISION = 3;

export const PROFILE_SLICE_NAME = "userProfile"
export const ORG_SLICE_NAME = "organization"
export const FILE_SLICE_NAME = "files"
export const TEMPLATE_SLICE_NAME = "templates"

export const NULL_ORG = 'null-organization'

export const BINDER_TEMPLATE_ID = '82676d1e-075f-45f6-bb52-1c2f172d5458'

// Feature Flags
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export const FEATURE_FLAGS = {
  // Demo mode - enables/disables features for demonstration purposes
  DEMO_MODE,
  
  // Individual feature toggles (disabled if demo mode is on OR explicitly disabled)
  EXPORT_SAMPLES: !DEMO_MODE && process.env.NEXT_PUBLIC_FEATURE_EXPORT_SAMPLES !== 'false',
  USER_INVITES: !DEMO_MODE && process.env.NEXT_PUBLIC_FEATURE_USER_INVITES !== 'false',
  FILE_UPLOADS: !DEMO_MODE && process.env.NEXT_PUBLIC_FEATURE_FILE_UPLOADS !== 'false',
  FILE_DELETES: !DEMO_MODE && process.env.NEXT_PUBLIC_FEATURE_FILE_DELETES !== 'false',
} as const

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[feature]
}

// Helper function to get the reason why a feature is disabled
export const getFeatureDisabledReason = (feature: keyof typeof FEATURE_FLAGS): string | null => {
  if (isFeatureEnabled(feature)) {
    return null
  }
  
  // Check if it's disabled due to demo mode
  if (FEATURE_FLAGS.DEMO_MODE) {
    return "This feature is disabled in demo mode"
  }
  
  // Check specific feature flags
  const featureEnvMap = {
    EXPORT_SAMPLES: 'NEXT_PUBLIC_FEATURE_EXPORT_SAMPLES',
    USER_INVITES: 'NEXT_PUBLIC_FEATURE_USER_INVITES',
    FILE_UPLOADS: 'NEXT_PUBLIC_FEATURE_FILE_UPLOADS',
    FILE_DELETES: 'NEXT_PUBLIC_FEATURE_FILE_DELETES',
    DEMO_MODE: 'NEXT_PUBLIC_DEMO_MODE'
  } as const
  
  const envVar = featureEnvMap[feature]
  if (envVar && process.env[envVar] === 'false') {
    return `Feature disabled via ${envVar} environment variable`
  }
  
  return "Feature is currently disabled"
}
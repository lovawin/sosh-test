# Frontend Type System Documentation

## Overview

This document provides comprehensive documentation for the type system used in the social media automation platform's frontend. The type system is designed to ensure type safety, improve development experience, and maintain consistency across the application.

## Type Categories

### 1. Platform Types

#### Platform
```typescript
type Platform = 'twitter' | 'instagram' | 'youtube' | 'tiktok';
```

The `Platform` type represents supported social media platforms. This is used throughout the application to ensure consistent platform identification.

**Usage Example:**
```typescript
function getPlatformIcon(platform: Platform): React.ReactNode {
  switch (platform) {
    case 'twitter': return <TwitterIcon />;
    case 'instagram': return <InstagramIcon />;
    case 'youtube': return <YouTubeIcon />;
    case 'tiktok': return <TikTokIcon />;
  }
}
```

#### PlatformCapabilities
Defines the capabilities and limitations of each platform.

**Key Properties:**
- `maxPostsPerDay`: Rate limiting for posts
- `contentTypes`: Supported content formats
- `rateLimits`: API request limitations
- `features`: Platform-specific features

### 2. Account Types

#### AccountStatus
```typescript
type AccountStatus = 'active' | 'inactive' | 'pending' | 'error';
```

Represents the current state of a social media account connection.

**Status Meanings:**
- `active`: Account is fully operational
- `inactive`: Account is connected but not being used
- `pending`: Account connection is being established
- `error`: Account has encountered an error

#### AccountType
```typescript
type AccountType = 'mother' | 'child';
```

Defines the role of an account in the mother-child strategy.

**Strategy Roles:**
- `mother`: Primary account that leads the strategy
- `child`: Secondary account that follows and amplifies the mother account

### 3. Automation Types

#### StrategyType
```typescript
type StrategyType = 'mother-child' | 'content-syndication' | 'engagement' | 'growth';
```

Defines different types of automation strategies.

**Strategy Types Explained:**
- `mother-child`: Coordinated posting and engagement between accounts
- `content-syndication`: Cross-platform content distribution
- `engagement`: Automated engagement with target audience
- `growth`: Focused on follower growth

#### AutomationStrategy
Complex type representing a complete automation strategy.

**Key Components:**
1. Basic Information:
   ```typescript
   {
     id: string;
     name: string;
     type: StrategyType;
     status: StrategyStatus;
   }
   ```

2. Configuration:
   ```typescript
   {
     postFrequency: number;
     targetAudience: string[];
     timing: {
       timezone: string;
       activeHours: { start: string; end: string };
       daysOfWeek: number[];
     };
   }
   ```

3. Metrics:
   ```typescript
   {
     successRate: number;
     engagementRate: number;
     growthRate: number;
     actions: number;
   }
   ```

## Best Practices

### 1. Type Guards

Always use type guards when working with data from external sources:

```typescript
function isAccount(obj: any): obj is Account {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.platform === 'string'
    // ... additional checks
  );
}

// Usage
const data = await fetchAccount();
if (isAccount(data)) {
  // TypeScript knows data is Account type
  console.log(data.metrics.followers);
}
```

### 2. Generic API Responses

Wrap API responses using the ApiResponse type:

```typescript
async function fetchAccounts(): Promise<ApiResponse<Account[]>> {
  try {
    const response = await api.get('/accounts');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: error.message
      }
    };
  }
}
```

### 3. Component Props

Define component props using the types:

```typescript
interface AccountCardProps {
  account: Account;
  onStatusChange: (id: string, status: AccountStatus) => void;
  metrics?: AccountMetrics;
}

const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onStatusChange,
  metrics
}) => {
  // Component implementation
};
```

## Type Relationships

### Account Hierarchy
```
Account
├── Platform
├── AccountStatus
├── AccountType
└── AccountMetrics
```

### Strategy Hierarchy
```
AutomationStrategy
├── StrategyType
├── StrategyStatus
├── StrategyConfig
└── Account[]
```

## Common Patterns

### 1. Status Management
```typescript
function useAccountStatus(account: Account) {
  return {
    isActive: account.status === 'active',
    isPending: account.status === 'pending',
    hasError: account.status === 'error',
    isOperational: ['active', 'inactive'].includes(account.status)
  };
}
```

### 2. Metrics Calculations
```typescript
function calculateEngagementRate(metrics: AccountMetrics): number {
  const { followers, posts } = metrics;
  return followers > 0 ? posts / followers : 0;
}
```

### 3. Platform-Specific Logic
```typescript
function getPlatformLimits(platform: Platform): PlatformCapabilities {
  const limits: Record<Platform, PlatformCapabilities> = {
    twitter: { maxPostsPerDay: 100, /* ... */ },
    instagram: { maxPostsPerDay: 25, /* ... */ },
    // ... other platforms
  };
  return limits[platform];
}
```

## Error Handling

### 1. Type-Safe Error Handling
```typescript
function handleApiError(error: ApiResponse<never>['error']) {
  if (error?.code === 'RATE_LIMIT') {
    // Handle rate limiting
  }
}
```

### 2. Null Checking
```typescript
function getAccountMetrics(account?: Account): AccountMetrics {
  return account?.metrics ?? {
    followers: 0,
    following: 0,
    posts: 0,
    engagement: 0,
    growth: 0
  };
}
```

## Testing

### 1. Mock Data Generation
```typescript
function createMockAccount(overrides?: Partial<Account>): Account {
  return {
    id: 'mock-1',
    platform: 'twitter',
    username: '@mock',
    status: 'active',
    accountType: 'mother',
    metrics: {
      followers: 1000,
      following: 500,
      posts: 100,
      engagement: 0.05,
      growth: 0.01
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}
```

### 2. Type Testing
```typescript
describe('Type Guards', () => {
  it('should validate Account objects', () => {
    const validAccount = createMockAccount();
    const invalidAccount = { id: 123 }; // wrong type

    expect(isAccount(validAccount)).toBe(true);
    expect(isAccount(invalidAccount)).toBe(false);
  });
});

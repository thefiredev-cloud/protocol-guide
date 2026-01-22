# Frontend Developer

## Role
Builds and maintains the React Native user interface for Protocol Guide, focusing on responsive components, intuitive navigation, and performant rendering for EMS professionals.

## Responsibilities

### React Native Component Development
- Build reusable UI components for protocol display
- Implement search interfaces with real-time suggestions
- Create interactive protocol viewers (expandable sections, tabs)
- Design accessible components for high-stress usage environments

### NativeWind Styling
- Implement consistent design system using Tailwind CSS classes
- Create responsive layouts for various device sizes
- Build dark mode support for low-light environments
- Optimize styles for performance and maintainability

### Expo Router Navigation
- Configure file-based routing structure
- Implement deep linking for protocol sharing
- Design navigation flows for common user journeys
- Handle navigation state persistence

### State Management and Data Fetching
- Integrate tRPC client with React Query
- Implement optimistic updates for user actions
- Design offline-first data strategies
- Manage global app state (user preferences, cache)

## Key Skills/Capabilities
- React Native and Expo SDK
- NativeWind/Tailwind CSS
- Expo Router navigation
- tRPC client and React Query
- TypeScript and type-safe development
- Accessibility (a11y) best practices
- Performance optimization (FlatList, memoization)
- Animations (Reanimated, Moti)

## Example Tasks

1. **Build Protocol Card Component**
   ```tsx
   // components/ProtocolCard.tsx
   export function ProtocolCard({ protocol }: { protocol: Protocol }) {
     return (
       <Pressable className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
         <Text className="text-lg font-semibold text-gray-900 dark:text-white">
           {protocol.title}
         </Text>
         <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
           {protocol.category}
         </Text>
         <View className="flex-row mt-3 gap-2">
           {protocol.tags.map(tag => (
             <Badge key={tag} label={tag} />
           ))}
         </View>
       </Pressable>
     )
   }
   ```

2. **Implement Search Screen**
   - Real-time search with debouncing
   - Recent searches and suggestions
   - Filter by category, certification level
   - Voice search integration

3. **Create Protocol Viewer**
   - Collapsible sections for long protocols
   - Medication dosing calculators inline
   - Quick-action buttons (bookmark, share)
   - Swipe gestures for navigation

4. **Add Offline Support**
   - Cache frequently accessed protocols
   - Show offline indicator
   - Queue actions for sync when online

## Constraints/Guidelines

- **Performance**: Maintain 60fps scrolling; optimize list rendering
- **Accessibility**: Support screen readers, dynamic type sizes, and high contrast
- **Offline-First**: Core features must work without network connectivity
- **Dark Mode**: Essential for ambulance/low-light environments
- **Touch Targets**: Minimum 44x44pt touch targets for gloved use
- **Loading States**: Always show meaningful loading indicators
- **Error Boundaries**: Graceful error handling with recovery options
- **Platform Parity**: Consistent experience across iOS and Android
- **Type Safety**: Full TypeScript coverage; no implicit any
- **Component Testing**: Unit tests for all reusable components
- **Memory Management**: Avoid memory leaks; clean up subscriptions

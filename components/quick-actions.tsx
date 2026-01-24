import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "./ui/icon-symbol";

type QuickAction = {
  id: string;
  label: string;
  query: string;
  icon: string;
  color: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "cardiac-arrest",
    label: "Cardiac Arrest",
    query: "cardiac arrest protocol",
    icon: "heart.fill",
    color: "#DC2626",
  },
  {
    id: "stroke",
    label: "Stroke",
    query: "stroke assessment and treatment",
    icon: "brain.head.profile",
    color: "#7C3AED",
  },
  {
    id: "overdose",
    label: "Overdose",
    query: "opioid overdose naloxone protocol",
    icon: "pills.fill",
    color: "#EA580C",
  },
  {
    id: "pediatric",
    label: "Pediatric",
    query: "pediatric medication dosing",
    icon: "figure.child",
    color: "#0891B2",
  },
  {
    id: "trauma",
    label: "Trauma",
    query: "trauma assessment primary survey",
    icon: "bandage.fill",
    color: "#059669",
  },
  {
    id: "airway",
    label: "Airway",
    query: "respiratory distress airway management",
    icon: "lungs.fill",
    color: "#2563EB",
  },
];

type QuickActionsProps = {
  onSelect: (query: string) => void;
  disabled?: boolean;
};

export function QuickActions({ onSelect, disabled }: QuickActionsProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.muted }]}>
        Quick Access
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.id}
            onPress={() => onSelect(action.query)}
            disabled={disabled}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`${action.label}: Search for ${action.query}`}
            accessibilityHint="Double tap to search for this protocol type"
            accessibilityState={{ disabled: disabled ?? false }}
            activeOpacity={0.8}
            style={[
              styles.actionButton,
              {
                backgroundColor: disabled ? colors.surface : `${action.color}08`,
                borderColor: disabled ? colors.border : `${action.color}25`,
                opacity: disabled ? 0.5 : 1,
              },
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${action.color}15` }]}>
              <IconSymbol 
                name={action.icon as any} 
                size={16} 
                color={disabled ? colors.muted : action.color} 
              />
            </View>
            <Text
              style={[
                styles.actionLabel,
                { color: disabled ? colors.muted : colors.foreground },
              ]}
            >
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export function SuggestedQueries({ onSelect, disabled }: QuickActionsProps) {
  const colors = useColors();

  const suggestions = [
    "What is the epinephrine dose for anaphylaxis?",
    "How do I treat hypoglycemia?",
    "Seizure management steps",
    "CHF treatment protocol",
  ];

  return (
    <View style={styles.suggestionsContainer}>
      <Text style={[styles.sectionTitle, { color: colors.muted }]}>
        Try asking
      </Text>
      <View style={styles.suggestionsList}>
        {suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onSelect(suggestion)}
            disabled={disabled}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Suggested query: ${suggestion}`}
            accessibilityHint="Double tap to search with this query"
            accessibilityState={{ disabled: disabled ?? false }}
            activeOpacity={0.7}
            style={[
              styles.suggestionButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: disabled ? 0.5 : 1,
              },
            ]}
          >
            <IconSymbol name="chevron.right" size={14} color={colors.primary} style={styles.suggestionIcon} />
            <Text style={[styles.suggestionText, { color: colors.foreground }]}>
              {suggestion}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  scrollContent: {
    paddingHorizontal: 2,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  suggestionsContainer: {
    marginTop: 8,
  },
  suggestionsList: {
    gap: 8,
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});

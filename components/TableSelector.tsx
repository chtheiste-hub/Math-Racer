import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface TableSelectorProps {
  selectedTables: Set<number>;
  onToggle: (table: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export default function TableSelector({
  selectedTables,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: TableSelectorProps) {
  const tables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const allSelected = tables.every((t) => selectedTables.has(t));

  const handleToggle = (table: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(table);
  };

  const handleBulkAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (allSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Multiplication Tables</Text>
        <Pressable onPress={handleBulkAction} style={styles.bulkButton}>
          <Text style={styles.bulkButtonText}>
            {allSelected ? "Clear All" : "Select All"}
          </Text>
        </Pressable>
      </View>
      <View style={styles.grid}>
        {tables.map((table) => {
          const isSelected = selectedTables.has(table);
          return (
            <Pressable
              key={table}
              onPress={() => handleToggle(table)}
              style={[
                styles.tableButton,
                isSelected && styles.tableButtonSelected,
              ]}
            >
              <Text
                style={[
                  styles.tableNumber,
                  isSelected && styles.tableNumberSelected,
                ]}
              >
                {table}
              </Text>
              <Text
                style={[
                  styles.tableLabel,
                  isSelected && styles.tableLabelSelected,
                ]}
              >
                x
              </Text>
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={10} color={Colors.white} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
    color: Colors.textSecondary,
  },
  bulkButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
  },
  bulkButtonText: {
    fontFamily: "Outfit_500Medium",
    fontSize: 13,
    color: Colors.accent,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tableButton: {
    width: "18%" as any,
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: Colors.backgroundCard,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    position: "relative",
    minWidth: 56,
    flexGrow: 1,
    maxWidth: 72,
  },
  tableButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tableNumber: {
    fontFamily: "Outfit_700Bold",
    fontSize: 22,
    color: Colors.textMuted,
  },
  tableNumberSelected: {
    color: Colors.white,
  },
  tableLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: -2,
  },
  tableLabelSelected: {
    color: "rgba(255,255,255,0.7)",
  },
  checkBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.successDark,
    justifyContent: "center",
    alignItems: "center",
  },
});

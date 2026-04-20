import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Expense } from "@/lib/types";

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.expenses
      .list({ limit: 5 })
      .then(setExpenses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalThisMonth = expenses
    .filter((e) => {
      const d = new Date(e.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>Welcome back</Text>
        <Text style={styles.emailText}>{user?.email}</Text>
        <TouchableOpacity
          onPress={() => Alert.alert("Sign out", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Sign out", style: "destructive", onPress: logout },
          ])}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Spent this month</Text>
        <Text style={styles.summaryAmount}>${totalThisMonth.toFixed(2)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Recent Expenses</Text>

      {loading ? (
        <ActivityIndicator color="#4f46e5" style={{ marginTop: 24 }} />
      ) : expenses.length === 0 ? (
        <Text style={styles.emptyText}>No expenses yet. Add one in the Expenses tab.</Text>
      ) : (
        expenses.slice(0, 5).map((expense) => (
          <View key={expense.id} style={styles.expenseRow}>
            <View style={styles.expenseLeft}>
              <Text style={styles.expenseTitle}>{expense.title}</Text>
              <Text style={styles.expenseMeta}>
                {expense.category.name} · {new Date(expense.date).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.expenseAmount}>${parseFloat(expense.amount).toFixed(2)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: { padding: 16, paddingBottom: 32 },
  welcomeCard: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  welcomeText: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  emailText: { color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 4 },
  signOutText: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 12 },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  summaryLabel: { color: "#6b7280", fontSize: 14 },
  summaryAmount: { color: "#111827", fontSize: 32, fontWeight: "700", marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 12 },
  emptyText: { color: "#9ca3af", fontSize: 14, textAlign: "center", marginTop: 16 },
  expenseRow: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  expenseLeft: { flex: 1 },
  expenseTitle: { fontSize: 15, fontWeight: "500", color: "#111827" },
  expenseMeta: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  expenseAmount: { fontSize: 16, fontWeight: "600", color: "#111827" },
});

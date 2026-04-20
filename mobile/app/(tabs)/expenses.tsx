import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/lib/api";
import type { Category, Expense, Project } from "@/lib/types";

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.expenses.list({ limit: 100 }),
      api.categories.list(),
      api.projects.list(),
    ])
      .then(([e, c, p]) => {
        setExpenses(e);
        setCategories(c);
        setProjects(p);
        if (c.length > 0 && !categoryId) setCategoryId(c[0].id);
      })
      .catch(() => Alert.alert("Error", "Failed to load expenses"))
      .finally(() => setLoading(false));
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      api.expenses.list({ limit: 100 }),
      api.categories.list(),
      api.projects.list(),
    ])
      .then(([e, c, p]) => {
        setExpenses(e);
        setCategories(c);
        setProjects(p);
      })
      .catch(() => Alert.alert("Error", "Failed to refresh expenses"))
      .finally(() => setRefreshing(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!title || !amount || !categoryId) {
      Alert.alert("Error", "Please fill in title, amount, and category");
      return;
    }
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert("Error", "Enter a valid amount");
      return;
    }
    setSaving(true);
    try {
      await api.expenses.create({
        title,
        amount: parsed,
        date: new Date().toISOString(),
        categoryId,
        projectId: projectId || undefined,
      });
      setTitle(""); setAmount(""); setProjectId("");
      setShowForm(false);
      load();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete expense", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await api.expenses.delete(id).catch(() => {});
          load();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {loading && !refreshing ? (
        <ActivityIndicator color="#4f46e5" style={styles.loader} />
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(e) => e.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No expenses yet.</Text>}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#4f46e5"
            />
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowMeta}>
                  {item.category.name}
                  {item.project ? ` · ${item.project.name}` : ""}
                  {" · "}{new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowAmount}>${parseFloat(item.amount).toFixed(2)}</Text>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setShowForm(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Expense</Text>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
          <TextInput
            style={styles.input}
            placeholder="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.chip, categoryId === c.id && styles.chipActive]}
                onPress={() => setCategoryId(c.id)}
              >
                <Text style={[styles.chipText, categoryId === c.id && styles.chipTextActive]}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {projects.length > 0 && (
            <>
              <Text style={styles.label}>Project (optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
                <TouchableOpacity
                  style={[styles.chip, !projectId && styles.chipActive]}
                  onPress={() => setProjectId("")}
                >
                  <Text style={[styles.chipText, !projectId && styles.chipTextActive]}>None</Text>
                </TouchableOpacity>
                {projects.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.chip, projectId === p.id && styles.chipActive]}
                    onPress={() => setProjectId(p.id)}
                  >
                    <Text style={[styles.chipText, projectId === p.id && styles.chipTextActive]}>
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          <TouchableOpacity style={styles.saveBtn} onPress={handleAdd} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Expense</Text>}
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  loader: { flex: 1, justifyContent: "center" },
  list: { padding: 16, paddingBottom: 80 },
  emptyText: { textAlign: "center", color: "#9ca3af", marginTop: 32, fontSize: 14 },
  row: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  rowLeft: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: "500", color: "#111827" },
  rowMeta: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  rowRight: { alignItems: "flex-end", gap: 6 },
  rowAmount: { fontSize: 16, fontWeight: "600", color: "#111827" },
  deleteBtn: { padding: 4 },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#4f46e5",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modal: { flex: 1, backgroundColor: "#fff" },
  modalContent: { padding: 24 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
    marginBottom: 16,
  },
  label: { fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 8 },
  chips: { marginBottom: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    marginRight: 8,
  },
  chipActive: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  chipText: { fontSize: 14, color: "#374151" },
  chipTextActive: { color: "#fff" },
  saveBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

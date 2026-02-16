import React, { useEffect, useState } from "react";
import {
  Box, Typography, Chip, Button, Card, CardContent, Grid, Alert
} from "@mui/material";
import CheckIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

const API_BASE = process.env.REACT_APP_API_URL || (process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : 'http://localhost:5001/api');

interface CreatorCategorySelectorProps {
  user: { role?: string | { name?: string } };
  creatorId: string;
  onSave?: () => void;
}

interface Category {
  _id: string;
  id?: string; // for backward compatibility, but prefer _id
  name: string;
  description: string;
  subcategories: { _id: string; name: string; description: string }[];
}

interface Selected {
  [mainCategoryId: string]: string[];
}

export default function CreatorCategorySelector({ user, creatorId, onSave }: CreatorCategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<Selected>({});
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/creator-categories`)
      .then(res => res.json())
      .then((data: Category[]) => setCategories(data));
  }, []);

  useEffect(() => {
    if (creatorId) {
      fetch(`${API_BASE}/users/${creatorId}/categories`)
        .then(res => res.json())
        .then((data: { categories: { mainCategoryId: string; subCategoryIds: string[] }[] }) => {
          const sel: Selected = {};
          (data.categories || []).forEach((item) => {
            sel[item.mainCategoryId] = item.subCategoryIds;
          });
          setSelected(sel);
        });
    }
  }, [creatorId]);

  const handleToggle = (mainId: string, subId: string) => {
    setSelected(sel => {
      const subs = sel[mainId] || [];
      return {
        ...sel,
        [mainId]: subs.includes(subId)
          ? subs.filter(id => id !== subId)
          : [...subs, subId]
      };
    });
  };

  const handleSave = () => {
    setError(null);
    const categoriesToSave = Object.entries(selected)
      .filter(([mainCategoryId, subCategoryIds]) =>
        subCategoryIds.length > 0 &&
        mainCategoryId &&
        mainCategoryId !== 'undefined' &&
        /^[a-fA-F0-9]{24}$/.test(mainCategoryId)
      )
      .map(([mainCategoryId, subCategoryIds]) => ({ mainCategoryId, subCategoryIds }));
    if (categoriesToSave.length === 0) {
      setError('Please select at least one category and subcategory.');
      return;
    }
    fetch(`${API_BASE}/users/${creatorId}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories: categoriesToSave })
    }).then(() => {
      setEditMode(false);
      if (typeof onSave === 'function') onSave();
    });
  };

  // Support both string and object role
  const roleName = typeof user.role === "object" ? user.role?.name : user.role;
  if (!user || roleName !== "Creator") return null;

  return (
    <Card sx={{ mt: 3, background: "rgba(60,60,80,0.7)", borderRadius: 4, boxShadow: 6 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" sx={{ color: "#fff" }}>
            Categories & Subcategories
          </Typography>
          {!editMode ? (
            <Button
              startIcon={<EditIcon />}
              onClick={() => setEditMode(true)}
              variant="outlined"
              sx={{ color: "#6C63FF", borderColor: "#6C63FF" }}
            >
              Edit
            </Button>
          ) : (
            <Box>
              <Button
                startIcon={<SaveIcon />}
                onClick={handleSave}
                variant="contained"
                sx={{ mr: 1, background: "linear-gradient(90deg,#6C63FF,#8F6FFF)" }}
              >
                Save
              </Button>
              <Button
                startIcon={<CancelIcon />}
                onClick={() => setEditMode(false)}
                variant="outlined"
                sx={{ color: "#fff", borderColor: "#fff" }}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>
        {error && <Alert severity="warning" sx={{ mt: 2 }}>{error}</Alert>}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {categories.map((cat) => (
            <Grid item xs={12} md={6} key={cat._id}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle1" sx={{ color: "#6C63FF", fontWeight: 700 }}>
                  {cat.name}
                </Typography>
                <Typography variant="body2" sx={{ color: "#aaa", mb: 1 }}>
                  {cat.description}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {cat.subcategories.map((sub) => {
                    const isSelected = selected[cat._id]?.includes(sub._id);
                    return (
                      <Chip
                        key={sub._id}
                        label={sub.name}
                        icon={isSelected ? <CheckIcon sx={{ color: "#6C63FF" }} /> : undefined}
                        clickable={editMode}
                        color={isSelected ? "primary" : "default"}
                        onClick={editMode ? () => handleToggle(cat._id, sub._id) : undefined}
                        sx={{
                          background: isSelected
                            ? "linear-gradient(90deg,#6C63FF,#8F6FFF)"
                            : "rgba(255,255,255,0.08)",
                          color: isSelected ? "#fff" : "#ccc",
                          fontWeight: isSelected ? 700 : 400,
                          border: isSelected ? "2px solid #6C63FF" : "1px solid #444",
                          transition: "all 0.2s"
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
} 
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Paper,
  Divider,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Note } from '../../types/course';

interface NotesComponentProps {
  lessonId: string;
  onNoteAdded?: (note: Note) => void;
  onNoteUpdated?: (note: Note) => void;
  onNoteDeleted?: (noteId: string) => void;
}

const NotesComponent: React.FC<NotesComponentProps> = ({
  lessonId,
  onNoteAdded,
  onNoteUpdated,
  onNoteDeleted
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editText, setEditText] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Load notes from localStorage
  const loadNotes = () => {
    try {
      const storedNotes = localStorage.getItem(`notes_${lessonId}`);
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  // Save notes to localStorage
  const saveNotes = (notesList: Note[]) => {
    try {
      localStorage.setItem(`notes_${lessonId}`, JSON.stringify(notesList));
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  // Add new note
  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: `note-${Date.now()}`,
      lessonId,
      userId: 'current-user',
      content: newNote.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: []
    };

    const updatedNotes = [note, ...notes];
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    setNewNote('');
    setShowAddDialog(false);
    onNoteAdded?.(note);
  };

  // Update note
  const handleUpdateNote = () => {
    if (!editingNote || !editText.trim()) return;

    const updatedNote: Note = {
      ...editingNote,
      content: editText.trim(),
      updatedAt: new Date().toISOString()
    };

    const updatedNotes = notes.map(note => 
      note.id === editingNote.id ? updatedNote : note
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    setEditingNote(null);
    setEditText('');
    setShowEditDialog(false);
    onNoteUpdated?.(updatedNote);
  };

  // Delete note
  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    setAnchorEl(null);
    setSelectedNote(null);
    onNoteDeleted?.(noteId);
  };

  // Add tag to note
  const handleAddTag = (noteId: string, tag: string) => {
    const updatedNotes = notes.map(note => 
      note.id === noteId 
        ? { ...note, tags: [...note.tags, tag], updatedAt: new Date().toISOString() }
        : note
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  // Remove tag from note
  const handleRemoveTag = (noteId: string, tagToRemove: string) => {
    const updatedNotes = notes.map(note => 
      note.id === noteId 
        ? { ...note, tags: note.tags.filter(tag => tag !== tagToRemove), updatedAt: new Date().toISOString() }
        : note
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, note: Note) => {
    setAnchorEl(event.currentTarget);
    setSelectedNote(note);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNote(null);
  };

  // Handle edit click
  const handleEditClick = () => {
    if (selectedNote) {
      setEditingNote(selectedNote);
      setEditText(selectedNote.content);
      setShowEditDialog(true);
    }
    handleMenuClose();
  };

  // Handle delete click
  const handleDeleteClick = () => {
    if (selectedNote) {
      handleDeleteNote(selectedNote.id);
    }
  };

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || note.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  // Get all unique tags
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, [lessonId]);

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notes ({notes.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddDialog(true)}
              sx={{
                background: 'linear-gradient(135deg, #6C63FF 0%, #00FFC6 100%)',
                px: 3
              }}
            >
              Add Note
            </Button>
          </Box>

          {/* Search and Filter */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              }}
              size="small"
            />
            {allTags.length > 0 && (
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setSelectedTag(selectedTag ? null : allTags[0])}
                size="small"
              >
                {selectedTag ? `Filter: ${selectedTag}` : 'Filter by Tag'}
              </Button>
            )}
          </Box>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label="All"
                size="small"
                color={!selectedTag ? 'primary' : 'default'}
                onClick={() => setSelectedTag(null)}
                variant={!selectedTag ? 'filled' : 'outlined'}
              />
              {allTags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  color={selectedTag === tag ? 'primary' : 'default'}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  variant={selectedTag === tag ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {searchQuery || selectedTag ? 'No notes match your search' : 'No notes yet'}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setShowAddDialog(true)}
            >
              Add Your First Note
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {filteredNotes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(note.updatedAt)}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, note)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {note.content}
                  </Typography>

                  {/* Tags */}
                  {note.tags.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {note.tags.map(tag => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          onDelete={() => handleRemoveTag(note.id, tag)}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  )}

                  {/* Add Tag */}
                  <TextField
                    size="small"
                    placeholder="Add tag..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const tag = (e.target as HTMLInputElement).value.trim();
                        if (tag && !note.tags.includes(tag)) {
                          handleAddTag(note.id, tag);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                    sx={{ mt: 1, width: 200 }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>
      )}

      {/* Add Note Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Note</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={6}
            placeholder="Write your note here..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddNote}
            disabled={!newNote.trim()}
            sx={{
              background: 'linear-gradient(135deg, #6C63FF 0%, #00FFC6 100%)'
            }}
          >
            Add Note
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Note</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={6}
            placeholder="Write your note here..."
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateNote}
            disabled={!editText.trim()}
            sx={{
              background: 'linear-gradient(135deg, #6C63FF 0%, #00FFC6 100%)'
            }}
          >
            Update Note
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default NotesComponent;

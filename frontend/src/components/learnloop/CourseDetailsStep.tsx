import React from 'react';
import { Box, Stack, TextField, Button, Typography, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Chip } from '@mui/material';

const categories = ['Business', 'Technology', 'Design', 'Marketing', 'Personal Development', 'Health', 'Other'];
const levels = ['Beginner', 'Intermediate', 'Advanced'];
const languages = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Other'];
const visibilities = ['Public', 'Unlisted', 'Private'];
const allTags = ['AI', 'Web', 'Startup', 'Productivity', 'Coding', 'Art', 'Finance', 'Growth'];

const CourseDetailsStep = ({
  title, subtitle, description, cover, coverFile, category, level, language, tags, visibility, errors, saving,
  setTitle, setSubtitle, setDescription, setCover, setCoverFile, setCategory, setLevel, setLanguage, setTags, setVisibility,
  handleCoverChange, handleSaveDraft, handleNext
}: any) => (
  <Box component="form" noValidate autoComplete="off" sx={{ width: '100%' }}>
    <Stack spacing={3}>
      <TextField
        label="Course Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
        error={!!errors.title}
        helperText={errors.title}
        fullWidth
      />
      <TextField
        label="Subtitle"
        value={subtitle}
        onChange={e => setSubtitle(e.target.value)}
        fullWidth
      />
      <TextField
        label="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        multiline
        minRows={3}
        fullWidth
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
        <Box>
          <Button variant="outlined" component="label">
            Upload Cover Image
            <input type="file" accept="image/*" hidden onChange={handleCoverChange} />
          </Button>
          {cover && (
            <Box mt={1}>
              <img src={cover} alt="cover preview" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, boxShadow: '0 2px 8px #00FFC622' }} />
            </Box>
          )}
        </Box>
        <FormControl sx={{ minWidth: 180 }} error={!!errors.category}>
          <InputLabel>Category *</InputLabel>
          <Select
            value={category}
            onChange={e => setCategory(e.target.value)}
            label="Category *"
            required
          >
            {categories.map(cat => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
          {errors.category && <Typography color="error" variant="caption">{errors.category}</Typography>}
        </FormControl>
        <FormControl sx={{ minWidth: 160 }} error={!!errors.level}>
          <InputLabel>Level *</InputLabel>
          <Select
            value={level}
            onChange={e => setLevel(e.target.value)}
            label="Level *"
            required
          >
            {levels.map(lvl => (
              <MenuItem key={lvl} value={lvl}>{lvl}</MenuItem>
            ))}
          </Select>
          {errors.level && <Typography color="error" variant="caption">{errors.level}</Typography>}
        </FormControl>
        <FormControl sx={{ minWidth: 160 }} error={!!errors.language}>
          <InputLabel>Language *</InputLabel>
          <Select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            label="Language *"
            required
          >
            {languages.map(lang => (
              <MenuItem key={lang} value={lang}>{lang}</MenuItem>
            ))}
          </Select>
          {errors.language && <Typography color="error" variant="caption">{errors.language}</Typography>}
        </FormControl>
      </Stack>
      <FormControl fullWidth>
        <InputLabel>Tags</InputLabel>
        <Select
          multiple
          value={tags}
          onChange={e => setTags(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[])}
          input={<OutlinedInput label="Tags" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as string[]).map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
        >
          {allTags.map(tag => (
            <MenuItem key={tag} value={tag}>{tag}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 180 }}>
        <InputLabel>Visibility</InputLabel>
        <Select
          value={visibility}
          onChange={e => setVisibility(e.target.value)}
          label="Visibility"
        >
          {visibilities.map(vis => (
            <MenuItem key={vis} value={vis}>{vis}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
    <Stack direction="row" spacing={2} justifyContent="flex-end" mt={4}>
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleSaveDraft}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save as Draft'}
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleNext}
      >
        Next
      </Button>
    </Stack>
  </Box>
);

export default CourseDetailsStep; 
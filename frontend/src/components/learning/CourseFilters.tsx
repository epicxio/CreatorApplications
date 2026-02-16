import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Slider,
  FormControlLabel,
  Checkbox,
  Paper
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Clear as ClearIcon } from '@mui/icons-material';
import { CourseFilters as CourseFiltersType } from '../../types/course';
import { courseService } from '../../services/courseService';

interface CourseFiltersProps {
  filters: CourseFiltersType;
  onFiltersChange: (_filters: CourseFiltersType) => void;
  onClearFilters: () => void;
}

const CourseFiltersComponent: React.FC<CourseFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [categoriesData, levelsData, languagesData] = await Promise.all([
          courseService.getCategories(),
          courseService.getLevels(),
          courseService.getLanguages()
        ]);
        
        setCategories(categoriesData);
        setLevels(levelsData);
        setLanguages(languagesData);
      } catch {
        // Filter options failed to load
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      searchQuery: event.target.value
    });
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: filters.category === category ? undefined : category
    });
  };

  const handleLevelChange = (level: string) => {
    onFiltersChange({
      ...filters,
      level: filters.level === level ? undefined : level
    });
  };

  const handleLanguageChange = (language: string) => {
    onFiltersChange({
      ...filters,
      language: filters.language === language ? undefined : language
    });
  };

  const _handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined
    });
  };

  const handlePriceRangeChange = (event: Event, newValue: number | number[]) => {
    const [min, max] = newValue as number[];
    onFiltersChange({
      ...filters,
      priceRange: { min, max }
    });
  };

  const handleDurationChange = (event: Event, newValue: number | number[]) => {
    const [min, max] = newValue as number[];
    onFiltersChange({
      ...filters,
      duration: { min, max }
    });
  };

  const handleCertificateToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      certificateEnabled: event.target.checked ? true : undefined
    });
  };

  const hasActiveFilters = () => {
    return !!(
      filters.searchQuery ||
      filters.category ||
      filters.level ||
      filters.language ||
      (filters.tags && filters.tags.length > 0) ||
      filters.priceRange ||
      filters.duration ||
      filters.certificateEnabled !== undefined
    );
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography>Loading filters...</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Filters
        </Typography>
        {hasActiveFilters() && (
          <Button
            startIcon={<ClearIcon />}
            onClick={onClearFilters}
            size="small"
            sx={{ textTransform: 'none' }}
          >
            Clear All
          </Button>
        )}
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search courses..."
        value={filters.searchQuery || ''}
        onChange={handleSearchChange}
        sx={{ mb: 2 }}
        size="small"
      />

      {/* Category Filter */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Category
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {categories.map((category) => (
              <Chip
                key={category}
                label={category}
                clickable
                color={filters.category === category ? 'primary' : 'default'}
                onClick={() => handleCategoryChange(category)}
                size="small"
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Level Filter */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Level
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {levels.map((level) => (
              <Chip
                key={level}
                label={level}
                clickable
                color={filters.level === level ? 'primary' : 'default'}
                onClick={() => handleLevelChange(level)}
                size="small"
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Language Filter */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Language
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {languages.map((language) => (
              <Chip
                key={language}
                label={language}
                clickable
                color={filters.language === language ? 'primary' : 'default'}
                onClick={() => handleLanguageChange(language)}
                size="small"
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Price Range Filter */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Price Range
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ px: 2 }}>
            <Slider
              value={[filters.priceRange?.min || 0, filters.priceRange?.max || 10000]}
              onChange={handlePriceRangeChange}
              valueLabelDisplay="auto"
              min={0}
              max={10000}
              step={100}
              valueLabelFormat={(value) => `₹${value}`}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                ₹{filters.priceRange?.min || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ₹{filters.priceRange?.max || 10000}
              </Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Duration Filter */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Duration (hours)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ px: 2 }}>
            <Slider
              value={[filters.duration?.min || 0, filters.duration?.max || 50]}
              onChange={handleDurationChange}
              valueLabelDisplay="auto"
              min={0}
              max={50}
              step={1}
              valueLabelFormat={(value) => `${value}h`}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                {filters.duration?.min || 0}h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filters.duration?.max || 50}h
              </Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Certificate Filter */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Features
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.certificateEnabled === true}
                onChange={handleCertificateToggle}
                size="small"
              />
            }
            label="Certificate Available"
          />
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default CourseFiltersComponent;

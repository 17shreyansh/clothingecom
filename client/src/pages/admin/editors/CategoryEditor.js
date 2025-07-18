import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  DragIndicator as DragIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { updateHomepageSection, uploadHomepageImage } from '../../../services/homepageService';
import api from '../../../services/api';

const CategoryEditor = ({ data, onUpdate, onRefresh }) => {
  const [formData, setFormData] = useState({
    title: data?.title || 'Shop by Category',
    subtitle: data?.subtitle || 'Discover timeless elegance in our curated selection of traditional wear',
    categories: data?.categories || [],
    layout: data?.layout || 'grid',
    maxDisplay: data?.maxDisplay || 4
  });
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', image: '', productCount: 0 });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      if (response.data.success) {
        setAvailableCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    setUploading(true);
    try {
      const response = await uploadHomepageImage(file);
      if (response.success) {
        setNewCategory(prev => ({ ...prev, image: response.imageUrl }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddCategory = (category) => {
    if (!category.image) {
      alert('Please select an image for the category');
      return;
    }
    
    const newCategory = {
      name: category.name,
      image: category.image,
      link: `/products?category=${category.name.toLowerCase()}`,
      count: category.productCount ? `${category.productCount}+ Styles` : '',
      order: formData.categories.length
    };

    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory]
    }));
    setCategoryDialog(false);
  };

  const removeCategory = (index) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateHomepageSection('categoryShowcase', formData);
      if (response.success) {
        onUpdate(formData);
        onRefresh();
      }
    } catch (error) {
      console.error('Error saving category showcase:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Category Showcase Editor
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Basic Settings</Typography>
              
              <TextField
                fullWidth
                label="Section Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Section Subtitle"
                value={formData.subtitle}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                margin="normal"
                multiline
                rows={2}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Display Settings</Typography>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Layout</InputLabel>
                <Select
                  value={formData.layout}
                  onChange={(e) => handleInputChange('layout', e.target.value)}
                  label="Layout"
                >
                  <MenuItem value="grid">Grid</MenuItem>
                  <MenuItem value="carousel">Carousel</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Max Categories to Display"
                type="number"
                value={formData.maxDisplay}
                onChange={(e) => handleInputChange('maxDisplay', parseInt(e.target.value))}
                margin="normal"
                inputProps={{ min: 1, max: 12 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Categories</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCategoryDialog(true)}
                >
                  Add Category
                </Button>
              </Box>

              <List>
                {formData.categories.map((category, index) => (
                  <ListItem key={index} sx={{ border: '1px solid #e0e0e0', mb: 1, borderRadius: 1 }}>
                    <IconButton size="small" sx={{ mr: 1 }}>
                      <DragIcon />
                    </IconButton>
                    <Box sx={{ mr: 2, width: 50, height: 50 }}>
                      <img
                        src={category.image}
                        alt={category.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                        onError={(e) => {
                          e.target.src = '/api/placeholder/50/50';
                        }}
                      />
                    </Box>
                    <ListItemText
                      primary={category.name}
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip size="small" label={category.count || 'No count'} />
                          <Chip size="small" label={`Order: ${category.order}`} variant="outlined" />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => removeCategory(index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>

              {formData.categories.length === 0 && (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No categories added yet. Click "Add Category" to select from available categories.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              size="large"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Dialog open={categoryDialog} onClose={() => setCategoryDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Category</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Add Custom Category</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Category Name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Product Count"
                  type="number"
                  value={newCategory.productCount}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, productCount: parseInt(e.target.value) || 0 }))}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  {newCategory.image && (
                    <img src={newCategory.image} alt="Preview" style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'contain', mb: 2 }} />
                  )}
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="category-image-upload"
                    type="file"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="category-image-upload">
                    <Button variant="outlined" component="span" startIcon={<UploadIcon />} disabled={uploading}>
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </Button>
                  </label>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => handleAddCategory(newCategory)}
                  disabled={!newCategory.name || !newCategory.image}
                  sx={{ mt: 2, width: '100%' }}
                >
                  Add Category
                </Button>
              </Grid>
            </Grid>
          </Box>
          
          <Typography variant="h6" gutterBottom>Or Select from Existing Categories</Typography>
          <Grid container spacing={2}>
            {availableCategories.filter(cat => cat.isActive).map((category) => (
              <Grid item xs={12} sm={6} md={4} key={category._id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 3 }
                  }}
                  onClick={() => handleAddCategory(category)}
                >
                  <Box sx={{ height: 120, overflow: 'hidden' }}>
                    <img
                      src={category.image}
                      alt={category.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = '/api/placeholder/200/120';
                      }}
                    />
                  </Box>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{category.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.productCount || 0} products
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryEditor;
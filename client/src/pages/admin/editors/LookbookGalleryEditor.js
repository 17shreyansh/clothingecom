import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography, Grid,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemSecondaryAction, Chip
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import { updateHomepageSection, uploadHomepageImage } from '../../../services/homepageService';

const LookbookGalleryEditor = ({ data, onUpdate, onRefresh }) => {
  const [formData, setFormData] = useState({
    title: data?.title || 'Style Lookbook',
    subtitle: data?.subtitle || 'Discover endless style possibilities with our curated fashion gallery',
    items: data?.items || []
  });
  const [itemDialog, setItemDialog] = useState(false);
  const [newItem, setNewItem] = useState({ id: 0, title: '', category: '', src: '' });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

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
        setNewItem(prev => ({ ...prev, src: response.imageUrl }));
      }
    } catch (error) {
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddItem = () => {
    if (!newItem.title.trim()) {
      alert('Please enter a title for the gallery item');
      return;
    }
    if (!newItem.category.trim()) {
      alert('Please enter a category for the gallery item');
      return;
    }
    if (!newItem.src) {
      alert('Please upload an image for the gallery item');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { ...newItem, id: Date.now() }]
    }));
    setNewItem({ id: 0, title: '', category: '', src: '' });
    setItemDialog(false);
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateHomepageSection('lookbookGallery', formData);
      if (response.success) {
        onUpdate(formData);
        onRefresh();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Lookbook Gallery Editor</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
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
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setItemDialog(true)}
                fullWidth
              >
                Add Gallery Item
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <List>
                {formData.items.map((item, index) => (
                  <ListItem key={item.id || index}>
                    <Box sx={{ mr: 2, width: 60, height: 60 }}>
                      <img src={item.src} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                    </Box>
                    <ListItemText
                      primary={item.title}
                      secondary={<Chip size="small" label={item.category} />}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => removeItem(index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Grid>
      </Grid>

      <Dialog open={itemDialog} onClose={() => setItemDialog(false)}>
        <DialogTitle>Add Gallery Item</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={newItem.title}
            onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Category"
            value={newItem.category}
            onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
            margin="normal"
          />
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="gallery-image-upload"
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="gallery-image-upload">
            <Button variant="outlined" component="span" startIcon={<UploadIcon />} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Image'}
            </Button>
          </label>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemDialog(false)}>Cancel</Button>
          <Button onClick={handleAddItem} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LookbookGalleryEditor;
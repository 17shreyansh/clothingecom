import React, { useState } from 'react';
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
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { updateHomepageSection, uploadHomepageImage } from '../../../services/homepageService';

const ImageShowcaseEditor = ({ data, onUpdate, onRefresh }) => {
  const [formData, setFormData] = useState({
    title: data?.title || 'Our Collection',
    subtitle: data?.subtitle || 'Discover the beauty of traditional Indian wear',
    images: data?.images || []
  });
  const [imageDialog, setImageDialog] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [newImage, setNewImage] = useState({
    src: '',
    hoverSrc: '',
    title: ''
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (event, field) => {
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
        setNewImage(prev => ({
          ...prev,
          [field]: response.imageUrl
        }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddImage = () => {
    if (editingImage !== null) {
      const updatedImages = [...formData.images];
      updatedImages[editingImage] = newImage;
      setFormData(prev => ({ ...prev, images: updatedImages }));
    } else {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage]
      }));
    }
    
    setNewImage({ src: '', hoverSrc: '', title: '' });
    setEditingImage(null);
    setImageDialog(false);
  };

  const handleEditImage = (index) => {
    setNewImage(formData.images[index]);
    setEditingImage(index);
    setImageDialog(true);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateHomepageSection('imageShowcase', formData);
      if (response.success) {
        onUpdate(formData);
        onRefresh();
      }
    } catch (error) {
      console.error('Error saving image showcase:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Image Showcase Editor
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Section Settings</Typography>
              
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
              <Typography variant="h6" gutterBottom>Showcase Images</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add images for the showcase grid. Each image needs both main and hover images for the effect.
              </Typography>
              
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setImageDialog(true)}
                fullWidth
              >
                Add Showcase Image
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Current Images</Typography>

              <List>
                {formData.images.map((image, index) => (
                  <ListItem key={index} sx={{ border: '1px solid #e0e0e0', mb: 1, borderRadius: 1 }}>
                    <Box sx={{ mr: 2, display: 'flex', gap: 1 }}>
                      <Box sx={{ width: 60, height: 60 }}>
                        <img
                          src={image.src}
                          alt={image.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                        />
                      </Box>
                      {image.hoverSrc && (
                        <Box sx={{ width: 60, height: 60 }}>
                          <img
                            src={image.hoverSrc}
                            alt={`${image.title} hover`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4, opacity: 0.7 }}
                          />
                        </Box>
                      )}
                    </Box>
                    <ListItemText
                      primary={image.title || `Image ${index + 1}`}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            Main: {image.src}
                          </Typography>
                          {image.hoverSrc && (
                            <Typography variant="caption" display="block">
                              Hover: {image.hoverSrc}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => handleEditImage(index)} sx={{ mr: 1 }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => removeImage(index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>

              {formData.images.length === 0 && (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No showcase images added yet. Click "Add Showcase Image" to upload images.
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

      <Dialog open={imageDialog} onClose={() => setImageDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingImage !== null ? 'Edit Showcase Image' : 'Add Showcase Image'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image Title"
                value={newImage.title}
                onChange={(e) => setNewImage(prev => ({ ...prev, title: e.target.value }))}
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Main Image</Typography>
              <Box sx={{ textAlign: 'center', border: '2px dashed #ccc', p: 2, borderRadius: 1 }}>
                {newImage.src ? (
                  <Box>
                    <img
                      src={newImage.src}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Click to change image
                    </Typography>
                  </Box>
                ) : (
                  <Typography color="text.secondary">No image selected</Typography>
                )}
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="main-image-upload"
                  type="file"
                  onChange={(e) => handleImageUpload(e, 'src')}
                />
                <label htmlFor="main-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    disabled={uploading}
                    sx={{ mt: 1 }}
                  >
                    {uploading ? 'Uploading...' : 'Upload Main Image'}
                  </Button>
                </label>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Hover Image (Optional)</Typography>
              <Box sx={{ textAlign: 'center', border: '2px dashed #ccc', p: 2, borderRadius: 1 }}>
                {newImage.hoverSrc ? (
                  <Box>
                    <img
                      src={newImage.hoverSrc}
                      alt="Hover Preview"
                      style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Click to change hover image
                    </Typography>
                  </Box>
                ) : (
                  <Typography color="text.secondary">No hover image selected</Typography>
                )}
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="hover-image-upload"
                  type="file"
                  onChange={(e) => handleImageUpload(e, 'hoverSrc')}
                />
                <label htmlFor="hover-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    disabled={uploading}
                    sx={{ mt: 1 }}
                  >
                    {uploading ? 'Uploading...' : 'Upload Hover Image'}
                  </Button>
                </label>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddImage}
            variant="contained"
            disabled={!newImage.src || !newImage.title}
          >
            {editingImage !== null ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImageShowcaseEditor;
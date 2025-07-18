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
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { updateHomepageSection, uploadHomepageImage } from '../../../services/homepageService';

const HeroEditor = ({ data, onUpdate, onRefresh }) => {
  const [formData, setFormData] = useState({
    title: data?.title || '',
    titleParts: {
      primary: data?.titleParts?.primary || 'Bhuvi',
      secondary: data?.titleParts?.secondary || 'Creations',
      primaryClass: data?.titleParts?.primaryClass || 'hero-title-primary',
      secondaryClass: data?.titleParts?.secondaryClass || 'hero-title-secondary'
    },
    subtitle: data?.subtitle || '',
    sliderImages: data?.sliderImages || []
  });
  const [imageDialog, setImageDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
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
        const newImage = {
          url: response.imageUrl,
          alt: 'Hero Image'
        };
        setFormData(prev => ({
          ...prev,
          sliderImages: [...prev.sliderImages, newImage]
        }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      sliderImages: prev.sliderImages.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateHomepageSection('heroSection', formData);
      if (response.success) {
        onUpdate(formData);
        onRefresh();
      }
    } catch (error) {
      console.error('Error saving hero section:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Hero Section Editor
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Basic Settings</Typography>
              
              <TextField
                fullWidth
                label="Main Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Subtitle"
                value={formData.subtitle}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                margin="normal"
                multiline
                rows={3}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Title Styling</Typography>
              
              <TextField
                fullWidth
                label="Primary Text"
                value={formData.titleParts.primary}
                onChange={(e) => handleInputChange('titleParts.primary', e.target.value)}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Primary CSS Class"
                value={formData.titleParts.primaryClass}
                onChange={(e) => handleInputChange('titleParts.primaryClass', e.target.value)}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Secondary Text"
                value={formData.titleParts.secondary}
                onChange={(e) => handleInputChange('titleParts.secondary', e.target.value)}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Secondary CSS Class"
                value={formData.titleParts.secondaryClass}
                onChange={(e) => handleInputChange('titleParts.secondaryClass', e.target.value)}
                margin="normal"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Slider Images</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setImageDialog(true)}
                >
                  Add Image
                </Button>
              </Box>

              <List>
                {formData.sliderImages.map((image, index) => (
                  <ListItem key={index}>
                    <Box sx={{ mr: 2, width: 60, height: 60 }}>
                      <img
                        src={image.url}
                        alt={image.alt}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                      />
                    </Box>
                    <ListItemText
                      primary={`Image ${index + 1}`}
                      secondary={image.url}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => removeImage(index)} color="error">
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

      <Dialog open={imageDialog} onClose={() => setImageDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Hero Image</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="hero-image-upload"
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="hero-image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadIcon />}
                disabled={uploading}
                size="large"
              >
                {uploading ? 'Uploading...' : 'Choose Image'}
              </Button>
            </label>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HeroEditor;
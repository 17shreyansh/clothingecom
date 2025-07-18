import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { updateHomepageSection, uploadHomepageImage } from '../../../services/homepageService';

const ParallaxBannerEditor = ({ data, onUpdate, onRefresh }) => {
  const [formData, setFormData] = useState({
    title: data?.title || 'Timeless Elegance',
    subtitle: data?.subtitle || 'Discover our handcrafted collection of traditional Indian wear',
    buttonText: data?.buttonText || 'Shop Collection',
    buttonLink: data?.buttonLink || '/products',
    backgroundImage: data?.backgroundImage || ''
  });
  const [imageDialog, setImageDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
        setFormData(prev => ({
          ...prev,
          backgroundImage: response.imageUrl
        }));
        setImageDialog(false);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateHomepageSection('parallaxBanner', formData);
      if (response.success) {
        onUpdate(formData);
        onRefresh();
      }
    } catch (error) {
      console.error('Error saving parallax banner:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Parallax Banner Editor
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Content Settings</Typography>
              
              <TextField
                fullWidth
                label="Banner Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Banner Subtitle"
                value={formData.subtitle}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                margin="normal"
                multiline
                rows={3}
              />

              <TextField
                fullWidth
                label="Button Text"
                value={formData.buttonText}
                onChange={(e) => handleInputChange('buttonText', e.target.value)}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Button Link"
                value={formData.buttonLink}
                onChange={(e) => handleInputChange('buttonLink', e.target.value)}
                margin="normal"
                helperText="URL where the button should redirect (e.g., /products)"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Background Image</Typography>
              
              {formData.backgroundImage ? (
                <Box sx={{ mb: 2 }}>
                  <img
                    src={formData.backgroundImage}
                    alt="Background Preview"
                    style={{ 
                      width: '100%', 
                      height: 200, 
                      objectFit: 'cover', 
                      borderRadius: 8,
                      border: '1px solid #e0e0e0'
                    }}
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                    Current background image
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ 
                  height: 200, 
                  border: '2px dashed #ccc', 
                  borderRadius: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography color="text.secondary">No background image set</Typography>
                  </Box>
                </Box>
              )}

              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => setImageDialog(true)}
                fullWidth
              >
                {formData.backgroundImage ? 'Change Background' : 'Upload Background'}
              </Button>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Recommended size: 1920x800px for best results
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Preview</Typography>
              <Box sx={{ 
                height: 300, 
                borderRadius: 2, 
                overflow: 'hidden',
                position: 'relative',
                backgroundImage: formData.backgroundImage ? `url(${formData.backgroundImage})` : 'linear-gradient(135deg, #D4AF37, #B8941F)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Box sx={{ 
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(45deg, rgba(0,0,0,0.5), rgba(0,0,0,0.3))'
                }} />
                <Box sx={{ 
                  textAlign: 'center', 
                  color: 'white', 
                  zIndex: 1,
                  p: 3,
                  maxWidth: 600
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                    {formData.title}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
                    {formData.subtitle}
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      px: 4,
                      py: 1.5,
                      background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
                      borderRadius: '50px',
                      fontWeight: 600
                    }}
                  >
                    {formData.buttonText}
                  </Button>
                </Box>
              </Box>
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
        <DialogTitle>Upload Background Image</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose a high-quality image for the parallax banner background.
              Recommended dimensions: 1920x800px
            </Typography>
            
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="background-image-upload"
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="background-image-upload">
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

export default ParallaxBannerEditor;
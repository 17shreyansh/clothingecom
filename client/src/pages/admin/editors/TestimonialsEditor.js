import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography, Grid, Switch, FormControlLabel,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemSecondaryAction, Rating
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import { updateHomepageSection, uploadHomepageImage } from '../../../services/homepageService';

const TestimonialsEditor = ({ data, onUpdate, onRefresh }) => {
  const [formData, setFormData] = useState({
    title: data?.title || 'Customer Stories',
    subtitle: data?.subtitle || 'Hear from our satisfied customers about their shopping experience',
    autoplay: data?.autoplay || true,
    autoplaySpeed: data?.autoplaySpeed || 5000,
    testimonials: data?.testimonials || []
  });
  const [testimonialDialog, setTestimonialDialog] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    name: '', location: '', rating: 5, text: '', product: '', avatar: '', verified: true
  });
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
        setNewTestimonial(prev => ({ ...prev, avatar: response.imageUrl }));
      }
    } catch (error) {
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddTestimonial = () => {
    if (!newTestimonial.name.trim()) {
      alert('Please enter customer name');
      return;
    }
    if (!newTestimonial.location.trim()) {
      alert('Please enter customer location');
      return;
    }
    if (!newTestimonial.text.trim()) {
      alert('Please enter testimonial text');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      testimonials: [...prev.testimonials, newTestimonial]
    }));
    setNewTestimonial({ name: '', location: '', rating: 5, text: '', product: '', avatar: '', verified: true });
    setTestimonialDialog(false);
  };

  const removeTestimonial = (index) => {
    setFormData(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateHomepageSection('testimonials', formData);
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
      <Typography variant="h4" gutterBottom>Testimonials Editor</Typography>
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
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.autoplay}
                    onChange={(e) => setFormData(prev => ({ ...prev, autoplay: e.target.checked }))}
                  />
                }
                label="Auto-play testimonials"
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Autoplay Speed (ms)"
                type="number"
                value={formData.autoplaySpeed}
                onChange={(e) => setFormData(prev => ({ ...prev, autoplaySpeed: parseInt(e.target.value) }))}
                margin="normal"
                disabled={!formData.autoplay}
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
                onClick={() => setTestimonialDialog(true)}
                fullWidth
              >
                Add Testimonial
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <List>
                {formData.testimonials.map((testimonial, index) => (
                  <ListItem key={index}>
                    <Box sx={{ mr: 2, width: 50, height: 50 }}>
                      <img src={testimonial.avatar} alt={testimonial.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    </Box>
                    <ListItemText
                      primary={testimonial.name}
                      secondary={
                        <Box>
                          <Rating value={testimonial.rating} readOnly size="small" />
                          <Typography variant="body2">{testimonial.text.substring(0, 100)}...</Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => removeTestimonial(index)} color="error">
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

      <Dialog open={testimonialDialog} onClose={() => setTestimonialDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Testimonial</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Customer Name"
            value={newTestimonial.name}
            onChange={(e) => setNewTestimonial(prev => ({ ...prev, name: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Location"
            value={newTestimonial.location}
            onChange={(e) => setNewTestimonial(prev => ({ ...prev, location: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Product"
            value={newTestimonial.product}
            onChange={(e) => setNewTestimonial(prev => ({ ...prev, product: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Testimonial Text"
            value={newTestimonial.text}
            onChange={(e) => setNewTestimonial(prev => ({ ...prev, text: e.target.value }))}
            margin="normal"
            multiline
            rows={3}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Rating</Typography>
            <Rating
              value={newTestimonial.rating}
              onChange={(e, value) => setNewTestimonial(prev => ({ ...prev, rating: value }))}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="avatar-upload"
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="avatar-upload">
              <Button variant="outlined" component="span" startIcon={<UploadIcon />} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Avatar'}
              </Button>
            </label>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestimonialDialog(false)}>Cancel</Button>
          <Button onClick={handleAddTestimonial} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TestimonialsEditor;
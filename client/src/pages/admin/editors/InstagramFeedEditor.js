import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography, Grid,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemSecondaryAction
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import { updateHomepageSection, uploadHomepageImage } from '../../../services/homepageService';

const InstagramFeedEditor = ({ data, onUpdate, onRefresh }) => {
  const [formData, setFormData] = useState({
    title: data?.title || 'Follow Our Journey',
    subtitle: data?.subtitle || '@bhuvicreations - Daily fashion inspiration and behind-the-scenes',
    buttonText: data?.buttonText || 'Follow on Instagram',
    instagramLink: data?.instagramLink || 'https://instagram.com/bhuvicreations',
    username: data?.username || 'bhuvicreations',
    posts: data?.posts || []
  });
  const [postDialog, setPostDialog] = useState(false);
  const [newPost, setNewPost] = useState({ id: 0, image: '', avatar: '', likes: 0, comments: 0 });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

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
        setNewPost(prev => ({ ...prev, [field]: response.imageUrl }));
      }
    } catch (error) {
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddPost = () => {
    if (!newPost.image) {
      alert('Please upload a post image');
      return;
    }
    if (!newPost.avatar) {
      alert('Please upload an avatar image');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      posts: [...prev.posts, { ...newPost, id: Date.now() }]
    }));
    setNewPost({ id: 0, image: '', avatar: '', likes: 0, comments: 0 });
    setPostDialog(false);
  };

  const removePost = (index) => {
    setFormData(prev => ({
      ...prev,
      posts: prev.posts.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateHomepageSection('instagramFeed', formData);
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
      <Typography variant="h4" gutterBottom>Instagram Feed Editor</Typography>
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
              />
              <TextField
                fullWidth
                label="Button Text"
                value={formData.buttonText}
                onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Instagram Link"
                value={formData.instagramLink}
                onChange={(e) => setFormData(prev => ({ ...prev, instagramLink: e.target.value }))}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                margin="normal"
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
                onClick={() => setPostDialog(true)}
                fullWidth
              >
                Add Instagram Post
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <List>
                {formData.posts.map((post, index) => (
                  <ListItem key={post.id || index}>
                    <Box sx={{ mr: 2, width: 60, height: 60 }}>
                      <img src={post.image} alt="Post" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                    </Box>
                    <ListItemText
                      primary={`Post ${index + 1}`}
                      secondary={`${post.likes} likes, ${post.comments} comments`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => removePost(index)} color="error">
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

      <Dialog open={postDialog} onClose={() => setPostDialog(false)}>
        <DialogTitle>Add Instagram Post</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Likes Count"
            type="number"
            value={newPost.likes}
            onChange={(e) => setNewPost(prev => ({ ...prev, likes: parseInt(e.target.value) || 0 }))}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Comments Count"
            type="number"
            value={newPost.comments}
            onChange={(e) => setNewPost(prev => ({ ...prev, comments: parseInt(e.target.value) || 0 }))}
            margin="normal"
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Post Image</Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="post-image-upload"
              type="file"
              onChange={(e) => handleImageUpload(e, 'image')}
            />
            <label htmlFor="post-image-upload">
              <Button variant="outlined" component="span" startIcon={<UploadIcon />} disabled={uploading}>
                Upload Post Image
              </Button>
            </label>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Avatar Image</Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="avatar-image-upload"
              type="file"
              onChange={(e) => handleImageUpload(e, 'avatar')}
            />
            <label htmlFor="avatar-image-upload">
              <Button variant="outlined" component="span" startIcon={<UploadIcon />} disabled={uploading}>
                Upload Avatar
              </Button>
            </label>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPostDialog(false)}>Cancel</Button>
          <Button onClick={handleAddPost} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InstagramFeedEditor;
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Switch,
  FormControlLabel
} from '@mui/material';
import { updateHomepageSection } from '../../../services/homepageService';

const FeaturedProductsEditor = ({ data, onUpdate, onRefresh }) => {
  const [formData, setFormData] = useState({
    title: data?.title || 'Featured Products',
    subtitle: data?.subtitle || 'Our handpicked selection of premium products',
    buttonText: data?.buttonText || 'View All Products',
    limit: data?.limit || 8,
    enabled: data?.enabled || true
  });
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateHomepageSection('featuredProducts', formData);
      if (response.success) {
        onUpdate(formData);
        onRefresh();
      }
    } catch (error) {
      console.error('Error saving featured products:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Featured Products Editor
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Content Settings</Typography>
              
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

              <TextField
                fullWidth
                label="Button Text"
                value={formData.buttonText}
                onChange={(e) => handleInputChange('buttonText', e.target.value)}
                margin="normal"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Display Settings</Typography>
              
              <TextField
                fullWidth
                label="Number of Products to Show"
                type="number"
                value={formData.limit}
                onChange={(e) => handleInputChange('limit', parseInt(e.target.value))}
                margin="normal"
                inputProps={{ min: 1, max: 20 }}
                helperText="Maximum number of featured products to display"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.enabled}
                    onChange={(e) => handleInputChange('enabled', e.target.checked)}
                  />
                }
                label="Enable Featured Products Section"
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Product Selection</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Products are automatically selected based on the "featured" flag in the product database. 
                To manage which products appear here, edit individual products and mark them as "featured".
              </Typography>
              
              <Box sx={{ 
                p: 2, 
                bgcolor: 'info.light', 
                borderRadius: 1,
                color: 'info.contrastText'
              }}>
                <Typography variant="body2">
                  <strong>Note:</strong> The system automatically fetches products marked as "featured" 
                  from your product catalog. The most recently added featured products will be displayed first.
                </Typography>
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
    </Box>
  );
};

export default FeaturedProductsEditor;
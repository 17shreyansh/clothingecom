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
  Security as SecurityIcon,
  LocalShipping as ShippingIcon,
  Support as SupportIcon,
  Verified as QualityIcon,
  Star as RatingIcon,
  Undo as ReturnsIcon
} from '@mui/icons-material';
import { updateHomepageSection } from '../../../services/homepageService';

const iconTypes = [
  { value: 'secure', label: 'Secure Payment', icon: SecurityIcon },
  { value: 'shipping', label: 'Free Shipping', icon: ShippingIcon },
  { value: 'support', label: '24/7 Support', icon: SupportIcon },
  { value: 'quality', label: 'Quality Assured', icon: QualityIcon },
  { value: 'rating', label: 'Star Rating', icon: RatingIcon },
  { value: 'returns', label: 'Easy Returns', icon: ReturnsIcon }
];

const TrustBadgesEditor = ({ data, onUpdate, onRefresh }) => {
  const [formData, setFormData] = useState({
    badges: data?.badges || [
      { title: 'Secure Payment', desc: '100% secure transactions', iconType: 'secure' },
      { title: 'Free Shipping', desc: 'On orders above ₹999', iconType: 'shipping' },
      { title: '24/7 Support', desc: 'Always here to help', iconType: 'support' },
      { title: 'Quality Assured', desc: 'Premium quality products', iconType: 'quality' }
    ]
  });
  const [badgeDialog, setBadgeDialog] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [newBadge, setNewBadge] = useState({
    title: '',
    desc: '',
    iconType: 'secure'
  });
  const [saving, setSaving] = useState(false);

  const handleAddBadge = () => {
    if (editingBadge !== null) {
      const updatedBadges = [...formData.badges];
      updatedBadges[editingBadge] = newBadge;
      setFormData(prev => ({ ...prev, badges: updatedBadges }));
    } else {
      setFormData(prev => ({
        ...prev,
        badges: [...prev.badges, newBadge]
      }));
    }
    
    setNewBadge({ title: '', desc: '', iconType: 'secure' });
    setEditingBadge(null);
    setBadgeDialog(false);
  };

  const handleEditBadge = (index) => {
    setNewBadge(formData.badges[index]);
    setEditingBadge(index);
    setBadgeDialog(true);
  };

  const removeBadge = (index) => {
    setFormData(prev => ({
      ...prev,
      badges: prev.badges.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateHomepageSection('trustBadges', formData);
      if (response.success) {
        onUpdate(formData);
        onRefresh();
      }
    } catch (error) {
      console.error('Error saving trust badges:', error);
    } finally {
      setSaving(false);
    }
  };

  const getIconComponent = (iconType) => {
    const iconConfig = iconTypes.find(type => type.value === iconType);
    return iconConfig ? iconConfig.icon : SecurityIcon;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Trust Badges Editor
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Trust Badges</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setBadgeDialog(true)}
                >
                  Add Badge
                </Button>
              </Box>

              <List>
                {formData.badges.map((badge, index) => {
                  const IconComponent = getIconComponent(badge.iconType);
                  return (
                    <ListItem key={index} sx={{ border: '1px solid #e0e0e0', mb: 1, borderRadius: 1 }}>
                      <Box sx={{ mr: 2, p: 1, bgcolor: '#D4AF37', borderRadius: '50%', color: 'white' }}>
                        <IconComponent />
                      </Box>
                      <ListItemText
                        primary={badge.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {badge.desc}
                            </Typography>
                            <Chip 
                              size="small" 
                              label={iconTypes.find(t => t.value === badge.iconType)?.label || badge.iconType}
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton onClick={() => handleEditBadge(index)} sx={{ mr: 1 }}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => removeBadge(index)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>

              {formData.badges.length === 0 && (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No trust badges added yet. Click "Add Badge" to create trust indicators.
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

      <Dialog open={badgeDialog} onClose={() => setBadgeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingBadge !== null ? 'Edit Badge' : 'Add New Badge'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Badge Title"
            value={newBadge.title}
            onChange={(e) => setNewBadge(prev => ({ ...prev, title: e.target.value }))}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Badge Description"
            value={newBadge.desc}
            onChange={(e) => setNewBadge(prev => ({ ...prev, desc: e.target.value }))}
            margin="normal"
            multiline
            rows={2}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Icon Type</InputLabel>
            <Select
              value={newBadge.iconType}
              onChange={(e) => setNewBadge(prev => ({ ...prev, iconType: e.target.value }))}
              label="Icon Type"
            >
              {iconTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <type.icon />
                    {type.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBadgeDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddBadge}
            variant="contained"
            disabled={!newBadge.title || !newBadge.desc}
          >
            {editingBadge !== null ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrustBadgesEditor;
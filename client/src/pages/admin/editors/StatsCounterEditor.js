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
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationOnIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { updateHomepageSection } from '../../../services/homepageService';

const iconTypes = [
  { value: 'People', label: 'People', icon: PeopleIcon },
  { value: 'TrendingUp', label: 'Trending Up', icon: TrendingUpIcon },
  { value: 'LocationOn', label: 'Location', icon: LocationOnIcon },
  { value: 'Star', label: 'Star', icon: StarIcon }
];

const StatsCounterEditor = ({ data, onUpdate, onRefresh }) => {
  const [formData, setFormData] = useState({
    title: data?.title || 'Our Journey in Numbers',
    subtitle: data?.subtitle || 'Building trust through quality and excellence',
    stats: data?.stats || [
      { number: 25000, suffix: '+', label: 'Happy Customers', icon: 'People' },
      { number: 800, suffix: '+', label: 'Products', icon: 'TrendingUp' },
      { number: 100, suffix: '+', label: 'Cities Served', icon: 'LocationOn' },
      { number: 4.9, suffix: '/5', label: 'Customer Rating', icon: 'Star' }
    ]
  });
  const [statDialog, setStatDialog] = useState(false);
  const [editingStat, setEditingStat] = useState(null);
  const [newStat, setNewStat] = useState({
    number: 0,
    suffix: '+',
    label: '',
    icon: 'People'
  });
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddStat = () => {
    if (editingStat !== null) {
      const updatedStats = [...formData.stats];
      updatedStats[editingStat] = newStat;
      setFormData(prev => ({ ...prev, stats: updatedStats }));
    } else {
      setFormData(prev => ({
        ...prev,
        stats: [...prev.stats, newStat]
      }));
    }
    
    setNewStat({ number: 0, suffix: '+', label: '', icon: 'People' });
    setEditingStat(null);
    setStatDialog(false);
  };

  const handleEditStat = (index) => {
    setNewStat(formData.stats[index]);
    setEditingStat(index);
    setStatDialog(true);
  };

  const removeStat = (index) => {
    setFormData(prev => ({
      ...prev,
      stats: prev.stats.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateHomepageSection('statsCounter', formData);
      if (response.success) {
        onUpdate(formData);
        onRefresh();
      }
    } catch (error) {
      console.error('Error saving stats counter:', error);
    } finally {
      setSaving(false);
    }
  };

  const getIconComponent = (iconName) => {
    const iconConfig = iconTypes.find(type => type.value === iconName);
    return iconConfig ? iconConfig.icon : PeopleIcon;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Stats Counter Editor
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
              <Typography variant="h6" gutterBottom>Statistics</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add impressive numbers that showcase your business achievements.
              </Typography>
              
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setStatDialog(true)}
                fullWidth
              >
                Add Statistic
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Current Statistics</Typography>

              <List>
                {formData.stats.map((stat, index) => {
                  const IconComponent = getIconComponent(stat.icon);
                  return (
                    <ListItem key={index} sx={{ border: '1px solid #e0e0e0', mb: 1, borderRadius: 1 }}>
                      <Box sx={{ mr: 2, p: 1, bgcolor: '#D4AF37', borderRadius: '50%', color: 'white' }}>
                        <IconComponent />
                      </Box>
                      <ListItemText
                        primary={
                          <Typography variant="h6">
                            {stat.number}{stat.suffix}
                          </Typography>
                        }
                        secondary={stat.label}
                      />
                      <ListItemSecondaryAction>
                        <IconButton onClick={() => handleEditStat(index)} sx={{ mr: 1 }}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => removeStat(index)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>

              {formData.stats.length === 0 && (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No statistics added yet. Click "Add Statistic" to showcase your achievements.
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

      <Dialog open={statDialog} onClose={() => setStatDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingStat !== null ? 'Edit Statistic' : 'Add New Statistic'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Number"
            type="number"
            value={newStat.number}
            onChange={(e) => setNewStat(prev => ({ ...prev, number: parseFloat(e.target.value) || 0 }))}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Suffix"
            value={newStat.suffix}
            onChange={(e) => setNewStat(prev => ({ ...prev, suffix: e.target.value }))}
            margin="normal"
            helperText="e.g., +, %, /5, K, M"
          />

          <TextField
            fullWidth
            label="Label"
            value={newStat.label}
            onChange={(e) => setNewStat(prev => ({ ...prev, label: e.target.value }))}
            margin="normal"
            helperText="Description of what this number represents"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Icon</InputLabel>
            <Select
              value={newStat.icon}
              onChange={(e) => setNewStat(prev => ({ ...prev, icon: e.target.value }))}
              label="Icon"
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
          <Button onClick={() => setStatDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddStat}
            variant="contained"
            disabled={!newStat.label || newStat.number === 0}
          >
            {editingStat !== null ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StatsCounterEditor;
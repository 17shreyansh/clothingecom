import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography, Grid,
  Switch, FormControlLabel, Chip, Alert, Snackbar
} from '@mui/material';
import { Email as EmailIcon, Send as SendIcon } from '@mui/icons-material';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

const EmailSettings = () => {
  const [config, setConfig] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    fromEmail: '',
    fromName: 'Bhuvi Creations',
    adminEmail: '',
    notificationEmails: [],
    isActive: true,
    packingTimeDays: 2
  });
  const [newEmail, setNewEmail] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await api.get('/email-config');
      if (response.data.success) {
        setConfig(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching email config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.put('/email-config', config);
      if (response.data.success) {
        setSnackbar({ open: true, message: 'Email settings saved successfully!', severity: 'success' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error saving settings', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;
    setTesting(true);
    try {
      await api.post('/email-config/test', { testEmail });
      setSnackbar({ open: true, message: 'Test email sent successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to send test email', severity: 'error' });
    } finally {
      setTesting(false);
    }
  };

  const addNotificationEmail = () => {
    if (newEmail && !config.notificationEmails.includes(newEmail)) {
      setConfig(prev => ({
        ...prev,
        notificationEmails: [...prev.notificationEmails, newEmail]
      }));
      setNewEmail('');
    }
  };

  const removeNotificationEmail = (email) => {
    setConfig(prev => ({
      ...prev,
      notificationEmails: prev.notificationEmails.filter(e => e !== email)
    }));
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Email Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>SMTP Configuration</Typography>
              
              <TextField
                fullWidth
                label="SMTP Host"
                value={config.smtpHost}
                onChange={(e) => setConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="SMTP Port"
                type="number"
                value={config.smtpPort}
                onChange={(e) => setConfig(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="SMTP Username"
                value={config.smtpUser}
                onChange={(e) => setConfig(prev => ({ ...prev, smtpUser: e.target.value }))}
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="SMTP Password"
                type="password"
                value={config.smtpPass}
                onChange={(e) => setConfig(prev => ({ ...prev, smtpPass: e.target.value }))}
                margin="normal"
                helperText="Use App Password for Gmail"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Email Settings</Typography>
              
              <TextField
                fullWidth
                label="From Email"
                value={config.fromEmail}
                onChange={(e) => setConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="From Name"
                value={config.fromName}
                onChange={(e) => setConfig(prev => ({ ...prev, fromName: e.target.value }))}
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="Admin Email"
                value={config.adminEmail}
                onChange={(e) => setConfig(prev => ({ ...prev, adminEmail: e.target.value }))}
                margin="normal"
                helperText="Email to receive order notifications"
              />

              <TextField
                fullWidth
                label="Packing Time (Days)"
                type="number"
                value={config.packingTimeDays}
                onChange={(e) => setConfig(prev => ({ ...prev, packingTimeDays: parseInt(e.target.value) || 1 }))}
                margin="normal"
                inputProps={{ min: 1, max: 30 }}
                helperText="Days before order packing starts"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={config.isActive}
                    onChange={(e) => setConfig(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                }
                label="Enable Email Notifications"
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Notification Emails</Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  label="Add Email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  size="small"
                />
                <Button variant="outlined" onClick={addNotificationEmail}>
                  Add
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {config.notificationEmails.map((email, index) => (
                  <Chip
                    key={index}
                    label={email}
                    onDelete={() => removeNotificationEmail(email)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Test Email</Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  label="Test Email Address"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  size="small"
                />
                <Button
                  variant="outlined"
                  startIcon={<SendIcon />}
                  onClick={handleTestEmail}
                  disabled={testing || !testEmail}
                >
                  {testing ? 'Sending...' : 'Send Test'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<EmailIcon />}
              onClick={handleSave}
              disabled={saving}
              size="large"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Box>
    </AdminLayout>
  );
};

export default EmailSettings;
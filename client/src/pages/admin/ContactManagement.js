import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, FormControl, InputLabel, Select, MenuItem, Tabs, Tab
} from '@mui/material';
import {
  Visibility as ViewIcon, Delete as DeleteIcon, Email as EmailIcon,
  Phone as PhoneIcon, Person as PersonIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

const ContactManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchContacts();
  }, [statusFilter]);

  const fetchContacts = async () => {
    try {
      const response = await api.get(`/contact?status=${statusFilter}`);
      if (response.data.success) {
        setContacts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/contact/${id}`, { status: newStatus, isRead: true });
      fetchContacts();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await api.delete(`/contact/${id}`);
        fetchContacts();
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'error',
      read: 'warning', 
      replied: 'info',
      closed: 'success'
    };
    return colors[status] || 'default';
  };

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Contact Management
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status Filter"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="read">Read</MenuItem>
                  <MenuItem value="replied">Replied</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact._id} sx={{ backgroundColor: !contact.isRead ? '#fff3e0' : 'inherit' }}>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.subject}</TableCell>
                  <TableCell>
                    <FormControl size="small">
                      <Select
                        value={contact.status}
                        onChange={(e) => handleStatusChange(contact._id, e.target.value)}
                      >
                        <MenuItem value="new">New</MenuItem>
                        <MenuItem value="read">Read</MenuItem>
                        <MenuItem value="replied">Replied</MenuItem>
                        <MenuItem value="closed">Closed</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>{new Date(contact.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => { setSelectedContact(contact); setViewDialog(true); }}>
                      <ViewIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(contact._id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Contact Details</DialogTitle>
          <DialogContent>
            {selectedContact && (
              <Box sx={{ pt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {selectedContact.name}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <EmailIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {selectedContact.email}
                </Typography>
                {selectedContact.phone && (
                  <Typography variant="body1" gutterBottom>
                    <PhoneIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    {selectedContact.phone}
                  </Typography>
                )}
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Subject:</Typography>
                <Typography variant="body1" gutterBottom>{selectedContact.subject}</Typography>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Message:</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedContact.message}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                  Submitted: {new Date(selectedContact.createdAt).toLocaleString()}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default ContactManagement;
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Description as DescriptionIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { AssignmentSubmission, FileSubmission } from '../../types/course';

interface AssignmentComponentProps {
  instructions: string;
  submissionType: 'text' | 'file' | 'both';
  maxFileSize?: number; // in MB
  allowedFileTypes?: string[];
  onSubmit: (submission: Omit<AssignmentSubmission, 'id' | 'submittedAt' | 'status'>) => void;
  onExit?: () => void;
}

const AssignmentComponent: React.FC<AssignmentComponentProps> = ({
  instructions,
  submissionType,
  maxFileSize = 10,
  allowedFileTypes = ['.pdf', '.doc', '.docx', '.txt'],
  onSubmit,
  onExit
}) => {
  const [textSubmission, setTextSubmission] = useState('');
  const [fileSubmissions, setFileSubmissions] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file size
    const oversizedFiles = files.filter(file => file.size > maxFileSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(`Some files exceed the maximum size of ${maxFileSize}MB`);
      return;
    }

    // Validate file types
    const invalidFiles = files.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return !allowedFileTypes.includes(extension);
    });
    
    if (invalidFiles.length > 0) {
      alert(`Some files have invalid types. Allowed types: ${allowedFileTypes.join(', ')}`);
      return;
    }

    setFileSubmissions(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setFileSubmissions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!textSubmission && fileSubmissions.length === 0) {
      alert('Please provide either text submission or upload files');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Simulate file upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Convert files to FileSubmission format
      const fileSubmissionsData: FileSubmission[] = fileSubmissions.map(file => ({
        id: `file-${Date.now()}-${Math.random()}`,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file), // In real app, this would be the uploaded file URL
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString()
      }));

      const submission: Omit<AssignmentSubmission, 'id' | 'submittedAt' | 'status'> = {
        assignmentId: 'current-assignment',
        userId: 'current-user',
        textSubmission: textSubmission || undefined,
        fileSubmissions: fileSubmissionsData
      };

      onSubmit(submission);
      setShowPreview(true);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Failed to submit assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      {/* Assignment Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <AssignmentIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Assignment
            </Typography>
          </Box>

          <Paper sx={{ p: 3, bgcolor: 'grey.50', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Instructions
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {instructions}
            </Typography>
          </Paper>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip
              label={`Max file size: ${maxFileSize}MB`}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`Allowed types: ${allowedFileTypes.join(', ')}`}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`Submission type: ${submissionType}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Text Submission */}
      {(submissionType === 'text' || submissionType === 'both') && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Text Submission
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={8}
              placeholder="Write your assignment here..."
              value={textSubmission}
              onChange={(e) => setTextSubmission(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              {textSubmission.length} characters
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* File Submission */}
      {(submissionType === 'file' || submissionType === 'both') && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              File Submission
            </Typography>

            <Box sx={{ mb: 3 }}>
              <input
                accept={allowedFileTypes.join(',')}
                style={{ display: 'none' }}
                id="file-upload"
                multiple
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  sx={{ mb: 2 }}
                >
                  Upload Files
                </Button>
              </label>
            </Box>

            {/* Uploaded Files List */}
            {fileSubmissions.length > 0 && (
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Uploaded Files ({fileSubmissions.length})
                </Typography>
                <List dense>
                  {fileSubmissions.map((file, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        bgcolor: 'background.paper'
                      }}
                    >
                      <ListItemIcon>
                        <AttachFileIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={formatFileSize(file.size)}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFile(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            {/* Upload Progress */}
            {isSubmitting && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Uploading files... {uploadProgress}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      background: 'linear-gradient(90deg, #6C63FF 0%, #00FFC6 100%)'
                    }
                  }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Submission Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Submission Summary
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {textSubmission && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon color="success" fontSize="small" />
                <Typography variant="body2">
                  Text submission ({textSubmission.length} characters)
                </Typography>
              </Box>
            )}
            
            {fileSubmissions.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon color="success" fontSize="small" />
                <Typography variant="body2">
                  {fileSubmissions.length} file(s) uploaded
                </Typography>
              </Box>
            )}
            
            {!textSubmission && fileSubmissions.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No submission yet
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onExit}
          disabled={isSubmitting}
        >
          Exit Assignment
        </Button>
        
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting || (!textSubmission && fileSubmissions.length === 0)}
          sx={{
            background: 'linear-gradient(135deg, #6C63FF 0%, #00FFC6 100%)',
            px: 4,
            py: 1.5
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
        </Button>
      </Box>

      {/* Success Dialog */}
      <Dialog open={showPreview} onClose={() => setShowPreview(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CheckIcon color="success" />
            Assignment Submitted Successfully!
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Your assignment has been submitted and is now under review.
          </Typography>
          
          <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Submission Details:
            </Typography>
            {textSubmission && (
              <Typography variant="body2">
                • Text submission: {textSubmission.length} characters
              </Typography>
            )}
            {fileSubmissions.length > 0 && (
              <Typography variant="body2">
                • Files uploaded: {fileSubmissions.length} file(s)
              </Typography>
            )}
            <Typography variant="body2">
              • Submitted at: {new Date().toLocaleString()}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssignmentComponent;

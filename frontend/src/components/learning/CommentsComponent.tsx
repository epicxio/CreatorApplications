import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Send as SendIcon,
  ThumbUp as ThumbUpIcon,
  Reply as ReplyIcon,
  Person as PersonIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Comment } from '../../types/course';
import { courseService } from '../../services/courseService';

interface CommentsComponentProps {
  lessonId: string;
  onCommentAdded?: (_comment: Comment) => void;
}

const CommentsComponent: React.FC<CommentsComponentProps> = ({
  lessonId,
  onCommentAdded
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load comments
  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const commentsData = await courseService.getComments(lessonId);
      setComments(commentsData);
    } catch {
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  // Add new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const comment = await courseService.addComment(lessonId, 'current-user', newComment.trim());
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      onCommentAdded?.(comment);
    } catch {
      setError('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  // Add reply
  const handleAddReply = async () => {
    if (!replyText.trim() || !replyingTo) return;

    try {
      setSubmitting(true);
      const reply = await courseService.addComment(lessonId, 'current-user', replyText.trim(), replyingTo);
      
      // Update comments to include the reply
      setComments(prev => prev.map(comment => 
        comment.id === replyingTo 
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment
      ));
      
      setReplyText('');
      setReplyingTo(null);
      setShowReplyDialog(false);
    } catch {
      setError('Failed to add reply');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle like
  const handleLike = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, likes: comment.likes + 1 }
        : comment
    ));
  };

  // Handle reply click
  const handleReplyClick = (commentId: string) => {
    setReplyingTo(commentId);
    setShowReplyDialog(true);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    
    return date.toLocaleDateString();
  };

  // Load comments on mount
  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- lessonId is the trigger; loadComments is stable
  }, [lessonId]);

  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <motion.div
      key={comment.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ListItem
        sx={{
          alignItems: 'flex-start',
          py: 2,
          px: isReply ? 4 : 0,
          borderLeft: isReply ? '2px solid' : 'none',
          borderColor: isReply ? 'primary.main' : 'transparent',
          bgcolor: isReply ? 'primary.50' : 'transparent',
          borderRadius: isReply ? 1 : 0,
          mb: isReply ? 1 : 0
        }}
      >
        <ListItemAvatar>
          <Avatar
            src={comment.userAvatar}
            sx={{ bgcolor: comment.isInstructor ? 'primary.main' : 'grey.500' }}
          >
            {comment.isInstructor ? <SchoolIcon /> : <PersonIcon />}
          </Avatar>
        </ListItemAvatar>
        
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {comment.userName}
              </Typography>
              {comment.isInstructor && (
                <Chip
                  label="Instructor"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
              )}
              <Typography variant="caption" color="text.secondary">
                {formatDate(comment.createdAt)}
              </Typography>
            </Box>
          }
          secondary={
            <Box>
              <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.6 }}>
                {comment.content}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => handleLike(comment.id)}
                  sx={{ color: 'text.secondary' }}
                >
                  <ThumbUpIcon fontSize="small" />
                </IconButton>
                <Typography variant="caption" color="text.secondary">
                  {comment.likes}
                </Typography>
                
                {!isReply && (
                  <IconButton
                    size="small"
                    onClick={() => handleReplyClick(comment.id)}
                    sx={{ color: 'text.secondary', ml: 1 }}
                  >
                    <ReplyIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Box>
          }
        />
      </ListItem>
    </motion.div>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Add Comment */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Add a Comment
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <PersonIcon />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Share your thoughts or ask a question..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || submitting}
                  sx={{
                    background: 'linear-gradient(135deg, #6C63FF 0%, #00FFC6 100%)',
                    px: 3
                  }}
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Comments List */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Comments ({comments.length})
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {comments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No comments yet. Be the first to comment!
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {comments.map(comment => (
                <Box key={comment.id}>
                  {renderComment(comment)}
                  
                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <Box sx={{ ml: 2 }}>
                      {comment.replies.map(reply => renderComment(reply, true))}
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 1 }} />
                </Box>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onClose={() => setShowReplyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Reply to Comment
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Write your reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReplyDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddReply}
            disabled={!replyText.trim() || submitting}
            sx={{
              background: 'linear-gradient(135deg, #6C63FF 0%, #00FFC6 100%)'
            }}
          >
            {submitting ? 'Posting...' : 'Post Reply'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommentsComponent;

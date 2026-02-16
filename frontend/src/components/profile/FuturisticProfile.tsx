import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Grid,
  Chip,
  IconButton,
  styled,
  TextField,
  Card,
  CardContent,
} from '@mui/material';
import {
  Save,
  Cancel,
  Edit as EditIcon,
  InfoOutlined
} from '@mui/icons-material';
import { AvatarSelectionModal } from '../common/AvatarSelectionModal';
import { CameraCaptureModal } from '../common/CameraCaptureModal';
import { AvatarChoiceModal } from '../common/AvatarChoiceModal';
import { User as BaseUser } from '../../services/userService';
import api from '../../services/api';
import CreatorCategorySelector from './CreatorCategorySelector';

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#6C63FF',
    },
    color: '#fff',
    background: 'rgba(0,0,0,0.2)',
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#6C63FF',
  }
});

// Extend User type to include categories for local use
type User = BaseUser & {
  categories?: Array<{
    mainCategoryId: string;
    subCategoryIds: string[];
    _id?: string;
  }>;
};

interface FuturisticProfileProps {
  user: User | null;
  onUpdateUser: (_data: Partial<User>) => Promise<void>;
  hideCategoriesSection?: boolean;
}

const FuturisticProfile: React.FC<FuturisticProfileProps> = ({ user, onUpdateUser, hideCategoriesSection = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [choiceModalOpen, setChoiceModalOpen] = useState(false);
  const [initialAvatarTab, setInitialAvatarTab] = useState(0);
  const [kyc, setKyc] = useState<any>(null);
  const [categoriesComplete, setCategoriesComplete] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  useEffect(() => {
    // Fetch KYC profile data
    api.get('/kyc/profile')
      .then(res => setKyc(res.data.data))
      .catch(() => setKyc(null));
  }, []);

  // Categories completion: use user.categories directly
  useEffect(() => {
    if (!hideCategoriesSection && user) {
      const extUser = user as User;
      const hasCategories =
        Array.isArray(extUser.categories) &&
        extUser.categories.length > 0 &&
        extUser.categories.some((cat: any) => Array.isArray(cat.subCategoryIds) && cat.subCategoryIds.length > 0);
      setCategoriesComplete(hasCategories);
    }
  }, [user, hideCategoriesSection]);

  // Calculate profile completion
  useEffect(() => {
    let kycComplete = false;
    if (kyc && kyc.documents) {
      // Treat both 'approved' and 'verified' as valid for completion
      const uploaded = kyc.documents.filter((d: any) => d.status === 'uploaded' || d.status === 'approved' || d.status === 'verified').length;
      const approved = kyc.documents.filter((d: any) => d.status === 'approved' || d.status === 'verified').length;
      kycComplete = uploaded >= 3 && approved >= 3;
    }
    // 50% for KYC, 50% for categories
    let percent = 0;
    if (kycComplete) percent += 50;
    if (categoriesComplete) percent += 50;
    setProfileCompletion(percent);
  }, [kyc, categoriesComplete]);

  const handleEditToggle = async () => {
    if (isEditing) {
      setIsEditing(false);
      setIsSaving(true);
      if(editedUser && user && onUpdateUser) {
        const updatedData: Partial<User> = {};
        if (editedUser.name !== user.name) {
          updatedData.name = editedUser.name;
        }
        if (editedUser.profileImage !== user.profileImage) {
          updatedData.profileImage = editedUser.profileImage;
        }
        try {
          if (Object.keys(updatedData).length > 0) {
            await onUpdateUser(updatedData);
          }
        } catch {
        } finally {
          setIsSaving(false);
        }
      } else {
        setIsSaving(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleAvatarSelect = async (url: string) => {
    setEditedUser(prev => prev ? { ...prev, profileImage: url } : null);
    setAvatarModalOpen(false);
    if (user && onUpdateUser) {
      try {
        await onUpdateUser({ profileImage: url });
      } catch {
      }
    }
  };

  const handlePhotoCapture = async (imageSrc: string) => {
    setEditedUser(prev => prev ? { ...prev, profileImage: imageSrc } : null);
    setCameraModalOpen(false);
    if (user && onUpdateUser) {
      try {
        await onUpdateUser({ profileImage: imageSrc });
      } catch {
      }
    }
  };

  const handleChooseLibrary = () => {
    setChoiceModalOpen(false);
    setInitialAvatarTab(0);
    setAvatarModalOpen(true);
  };

  const handleTakePhoto = () => {
    setChoiceModalOpen(false);
    setTimeout(() => setCameraModalOpen(true), 100);
  };

  const handleUpload = () => {
    setChoiceModalOpen(false);
    setInitialAvatarTab(4);
    setAvatarModalOpen(true);
  };

  // Helper: Get PAN/Aadhar card display status based on KYC documents
  const getKYCNumberDisplay = (type: 'pan_card' | 'aadhar_card') => {
    if (!kyc || !kyc.documents) return 'Document Not Provided';
    const docs = kyc.documents.filter((d: any) => d.documentType === type);
    if (docs.length === 0) return 'Document Not Provided';
    const verifiedDoc = docs.find((d: any) => d.status === 'verified');
    if (verifiedDoc) return verifiedDoc.documentNumber;
    // Latest doc of this type (by createdAt) to show status when not verified
    const sorted = [...docs].sort((a: any, b: any) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    const latest = sorted[0];
    const status = latest?.status;
    switch (status) {
      case 'pending':
        return 'Uploaded – awaiting verification';
      case 'rejected':
        return 'Verification failed – please resubmit';
      case 'expired':
        return 'Expired';
      default:
        return 'Yet to be verified';
    }
  };

  if (!user) {
    return (
      <Box sx={{ p: 3, color: '#fff' }}>
        <Typography>Loading user profile...</Typography>
      </Box>
    );
  }

  const creatorId = String(user?._id || "");

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #18182a 0%, #23234a 100%)',
        p: { xs: 2, md: 6 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowX: 'hidden',
      }}
    >
      {/* Profile Header */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4, position: 'relative' }}>
        <Box sx={{ position: 'relative', mb: 0, width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Outermost Arc: KYC Progress (SVG, orange) */}
          {(() => {
            // Outer arc (KYC)
            const kycSize = 160;
            const kycStroke = 8;
            const kycRadius = (kycSize - kycStroke) / 2;
            const kycCircumference = 2 * Math.PI * kycRadius;
            const kycValue = kyc && kyc.documents ? Math.min(100, (kyc.documents.filter((d: any) => d.status === 'approved').length / 3) * 100) : 0;
            const kycOffset = kycCircumference * (1 - kycValue / 100);
            // Inner arc (Profile Completion)
            const profileSize = 140;
            const profileStroke = 6;
            const profileRadius = (profileSize - profileStroke) / 2;
            const profileCircumference = 2 * Math.PI * profileRadius;
            const profileOffset = profileCircumference * (1 - profileCompletion / 100);
            return (
              <>
                {/* KYC Arc (outer) */}
                <svg width={kycSize} height={kycSize} style={{ position: 'absolute', zIndex: 3 }}>
                  {/* Background arc */}
                  <circle
                    cx={kycSize / 2}
                    cy={kycSize / 2}
                    r={kycRadius}
                    fill="none"
                    stroke="#FF9100"
                    strokeWidth={kycStroke}
                    opacity={0.18}
                  />
                  {/* Progress arc */}
                  {kycValue === 100 ? (
                    <circle
                      cx={kycSize / 2}
                      cy={kycSize / 2}
                      r={kycRadius}
                      fill="none"
                      stroke="#FF9100"
                      strokeWidth={kycStroke}
                      strokeLinecap="round"
                      style={{
                        transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)',
                        filter: 'drop-shadow(0 0 12px #FF910044)'
                      }}
                    />
                  ) : (
                  <circle
                    cx={kycSize / 2}
                    cy={kycSize / 2}
                    r={kycRadius}
                    fill="none"
                    stroke="#FF9100"
                    strokeWidth={kycStroke}
                    strokeDasharray={kycCircumference}
                    strokeDashoffset={kycOffset}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)',
                      filter: 'drop-shadow(0 0 12px #FF910044)'
                    }}
                  />
                  )}
                </svg>
                {/* Profile Completion Arc (inner) */}
                <svg width={profileSize} height={profileSize} style={{ position: 'absolute', zIndex: 2 }}>
                  {/* Background arc */}
                  <circle
                    cx={profileSize / 2}
                    cy={profileSize / 2}
                    r={profileRadius}
                    fill="none"
                    stroke="#2979FF"
                    strokeWidth={profileStroke}
                    opacity={0.18}
                  />
                  {/* Progress arc */}
                  {profileCompletion === 100 ? (
                    <circle
                      cx={profileSize / 2}
                      cy={profileSize / 2}
                      r={profileRadius}
                      fill="none"
                      stroke="#2979FF"
                      strokeWidth={profileStroke}
                      strokeLinecap="round"
                      style={{
                        transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)',
                        filter: 'drop-shadow(0 0 10px #2979FF44)'
                      }}
                    />
                  ) : (
                  <circle
                    cx={profileSize / 2}
                    cy={profileSize / 2}
                    r={profileRadius}
                    fill="none"
                    stroke="#2979FF"
                    strokeWidth={profileStroke}
                    strokeDasharray={profileCircumference}
                    strokeDashoffset={profileOffset}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)',
                      filter: 'drop-shadow(0 0 10px #2979FF44)'
                    }}
                  />
                  )}
                </svg>
              </>
            );
          })()}
          {/* Avatar in the center */}
          <Avatar
            src={editedUser?.profileImage}
            sx={{
              width: 120,
              height: 120,
              bgcolor: 'primary.main',
              fontSize: 48,
              boxShadow: '0 0 32px 8px #6C63FF55',
              border: '4px solid #fff',
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
              zIndex: 3,
              position: 'absolute',
              left: 20,
              top: 20,
              '&:hover': { transform: 'scale(1.05)' },
            }}
            onClick={() => setChoiceModalOpen(true)}
          >
            {editedUser?.name ? editedUser.name[0] : ''}
          </Avatar>
          <IconButton
            className="edit-icon"
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              background: '#6C63FF',
              borderRadius: '50%',
              color: '#fff',
              opacity: 0.9,
              zIndex: 4,
              '&:hover': { background: '#574fd6' },
            }}
            onClick={() => setChoiceModalOpen(true)}
            size="small"
            aria-label="Edit Avatar"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
        {/* Percentage below avatar */}
        <Box sx={{ mt: 1, mb: 0.5, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
          <Typography variant="h5" fontWeight={900} color="#6C63FF" sx={{ letterSpacing: 1, textAlign: 'center', mb: 0 }}>
            {`${Math.round(profileCompletion)}% Complete`}
          </Typography>
          {/* Guidance message below percentage */}
          {profileCompletion < 100 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <InfoOutlined sx={{ color: '#6C63FF', mr: 1, fontSize: 20 }} />
              <Typography variant="body2" color="#6C63FF" sx={{ fontWeight: 500 }}>
                Complete your KYC and select at least one category & subcategory to finish your profile.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <InfoOutlined sx={{ color: '#6C63FF', mr: 1, fontSize: 20 }} />
              <Typography variant="body2" color="#6C63FF" sx={{ fontWeight: 700 }}>
                Good Job!
              </Typography>
            </Box>
          )}
        </Box>
        {/* Name and edit logic */}
        {isEditing ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <StyledTextField
              name="name"
              value={editedUser?.name || ''}
              onChange={handleInputChange}
              size="small"
              sx={{ input: { color: '#fff', fontWeight: 900, fontSize: 32, textAlign: 'center', letterSpacing: 1 } }}
              InputProps={{
                style: { fontWeight: 900, fontSize: 32, textAlign: 'center', letterSpacing: 1 },
              }}
              variant="outlined"
            />
            <IconButton onClick={handleEditToggle} color="primary" aria-label="Save" sx={{ bgcolor: '#6C63FF', color: '#fff', ml: 1 }} disabled={isSaving}>
              <Save />
            </IconButton>
            <IconButton onClick={handleCancel} color="secondary" aria-label="Cancel" sx={{ bgcolor: '#222', color: '#fff', ml: 1 }} disabled={isSaving}>
              <Cancel />
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="h4" fontWeight={900} color="#fff" sx={{ letterSpacing: 1, textAlign: 'center', mb: 0 }}>
              {editedUser?.name || ''}
            </Typography>
            <IconButton onClick={handleEditToggle} color="primary" aria-label="Edit Name" sx={{ bgcolor: '#6C63FF', color: '#fff', ml: 1 }}>
              <EditIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Key Info Cards */}
      <Grid container spacing={2} sx={{ width: '100%', maxWidth: 900, mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'rgba(40,40,60,0.7)', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="#bbb" gutterBottom>PAN Card Number</Typography>
              <Typography variant="body1" color="#fff" fontWeight={700}>
                {getKYCNumberDisplay('pan_card')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'rgba(40,40,60,0.7)', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="#bbb" gutterBottom>Aadhar Card Number</Typography>
              <Typography variant="body1" color="#fff" fontWeight={700}>
                {getKYCNumberDisplay('aadhar_card')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'rgba(40,40,60,0.7)', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="#bbb" gutterBottom>Email Address</Typography>
              <Typography variant="body1" color="#fff" fontWeight={700}>{user?.email}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'rgba(40,40,60,0.7)', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="#bbb" gutterBottom>Role</Typography>
              <Typography variant="body1" color="#fff" fontWeight={700}>
                {typeof user.role === "object"
                  ? String(user.role?.name || 'Creator')
                  : String(user.role || 'Creator')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'rgba(40,40,60,0.7)', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="#bbb" gutterBottom>User Type</Typography>
              <Typography variant="body1" color="#fff" fontWeight={700}>
                {typeof user.userType === "object"
                  ? String(user.userType?.name || 'creator')
                  : String(user.userType || 'creator')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Categories & Subcategories */}
      {!hideCategoriesSection && (
        <Box sx={{ width: '100%', maxWidth: 900, mb: 3 }}>
          <CreatorCategorySelector user={user || {}} creatorId={creatorId} onSave={() => {
            // Re-fetch categories completion after save
            fetch(`/api/users/${user._id}/categories`)
              .then(res => res.json())
              .then((data: { categories: any[] }) => {
                const hasCategories = Array.isArray(data.categories) && data.categories.length > 0 && data.categories.some((cat: any) => cat.subCategoryIds && cat.subCategoryIds.length > 0);
                setCategoriesComplete(hasCategories);
              });
          }} />
        </Box>
      )}

      {/* Assigned Screens */}
      <Box sx={{ width: '100%', maxWidth: 900, mb: 3 }}>
        <Card sx={{ background: 'rgba(40,40,60,0.7)', borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" color="#fff" fontWeight={700} gutterBottom>
              Assigned Screens
            </Typography>
            {(!user?.assignedScreens || user.assignedScreens.length === 0) ? (
              <Typography variant="body2" color="#ffb300" sx={{ mt: 1 }}>
                Contact your admin - the screens are not properly configured
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {(user?.assignedScreens || []).map((screen: string) => (
                  <Chip
                    key={screen}
                    label={screen}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.10)',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: 14,
                      borderRadius: 2,
                    }}
                  />
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      <AvatarSelectionModal 
        open={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        onSelectAvatar={handleAvatarSelect}
        initialTab={initialAvatarTab}
      />

      <CameraCaptureModal
        open={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onCapture={handlePhotoCapture}
      />

      <AvatarChoiceModal
        open={choiceModalOpen}
        onClose={() => setChoiceModalOpen(false)}
        onChooseLibrary={handleChooseLibrary}
        onTakePhoto={handleTakePhoto}
        onUpload={handleUpload}
      />
    </Box>
  );
};

export default FuturisticProfile; 
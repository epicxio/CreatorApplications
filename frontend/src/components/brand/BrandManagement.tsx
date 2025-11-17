import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  styled,
  OutlinedInput,
  Autocomplete,
  Switch,
  FormControlLabel,
  InputAdornment,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  School as SchoolIcon,
  Store as StoreIcon,
  Link as LinkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Image as ImageIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Public as PublicIcon,
  Home as HomeIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}));

interface Brand {
  id: string;
  name: string;
  logo: string;
  description: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  products: Product[];
  status: 'active' | 'inactive';
  contactName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  addresses: { addressLine1: string; addressLine2: string; city: string; state: string; country: string; zip: string; locations: { name: string; map: string }[] }[];
}

interface Product {
  id: string;
  name: string;
  image: string;
  description: string;
  category: string;
  price: string;
}

// Mock data for demonstration
const mockBrands: Brand[] = [
  {
    id: '1',
    name: 'Brand 1',
    logo: 'https://via.placeholder.com/150',
    description: 'Description of Brand 1',
    website: 'https://www.brand1.com',
    contactEmail: 'contact@brand1.com',
    contactPhone: '123-456-7890',
    products: [],
    status: 'active',
    contactName: 'John Doe',
    ownerName: 'Jane Doe',
    ownerEmail: 'jane@example.com',
    ownerPhone: '555-1234',
    addresses: [],
  },
];

const availableProducts: Product[] = [
  {
    id: '1',
    name: 'Product 1',
    image: 'https://via.placeholder.com/150',
    description: 'Description of Product 1',
    category: 'Category 1',
    price: '$10.00',
  },
  {
    id: '2',
    name: 'Product 2',
    image: 'https://via.placeholder.com/150',
    description: 'Description of Product 2',
    category: 'Category 2',
    price: '$15.00',
  },
  {
    id: '3',
    name: 'Product 3',
    image: 'https://via.placeholder.com/150',
    description: 'Description of Product 3',
    category: 'Category 3',
    price: '$20.00',
  },
];

const categories = ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5'];

export const BrandManagement: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>(mockBrands);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');

  const handleAddBrand = () => {
    setSelectedBrand(null);
    setOpenDialog(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setSelectedBrand(brand);
    setOpenDialog(true);
  };

  const handleDeleteBrand = (brandId: string) => {
    setBrands(brands.filter(brand => brand.id !== brandId));
  };

  const handleSaveBrand = (brandData: Partial<Brand>) => {
    if (selectedBrand) {
      // Edit existing brand
      setBrands(brands.map(brand =>
        brand.id === selectedBrand.id ? { ...brand, ...brandData } : brand
      ));
    } else {
      // Add new brand
      const newBrand: Brand = {
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        logo: '',
        description: '',
        website: '',
        contactEmail: '',
        contactPhone: '',
        products: [],
        status: 'active',
        contactName: '',
        ownerName: '',
        ownerEmail: '',
        ownerPhone: '',
        addresses: [],
      };
      setBrands([...brands, newBrand]);
    }
    setOpenDialog(false);
  };

  const filteredBrands = brands.filter(brand => {
    const matchesSearch = 
      brand.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || brand.products.some(product => product.category === filterCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <Box>
      <StyledPaper>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Brand Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddBrand}
          >
            Add Brand
          </Button>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Filter by Category</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Filter by Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Products</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBrands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>{brand.name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {brand.products.map((product) => (
                        <Chip
                          key={product.id}
                          label={product.name}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={brand.status}
                      color={brand.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditBrand(brand)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteBrand(brand.id)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </StyledPaper>

      <BrandDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveBrand}
        brand={selectedBrand}
      />
    </Box>
  );
};

interface BrandDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (brandData: Partial<Brand>) => void;
  brand: Brand | null;
}

const BrandDialog: React.FC<BrandDialogProps> = ({
  open,
  onClose,
  onSave,
  brand,
}) => {
  const [formData, setFormData] = useState<Partial<Brand>>(
    brand || {
      name: '',
      logo: '',
      description: '',
      website: '',
      contactEmail: '',
      contactPhone: '',
      products: [],
      status: 'active',
      contactName: '',
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      addresses: [],
    }
  );
  const [logo, setLogo] = useState<string | null>(null);

  React.useEffect(() => {
    setFormData(brand || {
      name: '',
      logo: '',
      description: '',
      website: '',
      contactEmail: '',
      contactPhone: '',
      products: [],
      status: 'active',
      contactName: '',
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      addresses: [],
    });
    setLogo(null);
  }, [brand]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogo(ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>
          {brand ? 'Edit Brand' : 'Add New Brand'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="logo-upload"
              type="file"
              onChange={handleLogoChange}
            />
            <label htmlFor="logo-upload">
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <IconButton component="span" sx={{ bgcolor: 'white', p: 0.5 }}>
                    <EditIcon fontSize="small" color="primary" />
                  </IconButton>
                }
              >
                <Avatar
                  src={logo || formData.logo || ''}
                  sx={{ width: 80, height: 80, boxShadow: 3, cursor: 'pointer', bgcolor: 'primary.main' }}
                >
                  <StoreIcon fontSize="large" />
                </Avatar>
              </Badge>
            </label>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Brand Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <StoreIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Logo URL"
                value={formData.logo || ''}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ImageIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Website URL"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Contact Email"
                value={formData.contactEmail || ''}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Contact Phone"
                value={formData.contactPhone || ''}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.status === 'active'}
                    onChange={(_, checked) => setFormData({ ...formData, status: checked ? 'active' : 'inactive' })}
                    color="primary"
                  />
                }
                label={
                  <Chip
                    icon={formData.status === 'active' ? <CheckCircleIcon /> : <DeleteIcon />}
                    label={formData.status === 'active' ? 'Active' : 'Inactive'}
                    color={formData.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                }
                labelPlacement="end"
                sx={{ ml: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={availableProducts}
                getOptionLabel={(option) => option.name}
                value={formData.products || []}
                onChange={(_, newValue) => setFormData({ ...formData, products: newValue })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Products"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <StoreIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      avatar={<Avatar src={option.image}>{option.name.charAt(0)}</Avatar>}
                      label={option.name}
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Contact Name"
                value={formData.contactName || ''}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Owner Name"
                value={formData.ownerName || ''}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Owner Email"
                value={formData.ownerEmail || ''}
                onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Owner Phone"
                value={formData.ownerPhone || ''}
                onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              {(formData.addresses ?? []).map((address, idx) => (
                <Paper key={idx} sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                    <TextField
                      fullWidth
                      placeholder="Address Line 1"
                      value={address.addressLine1}
                      onChange={e => {
                        const updated = [...(formData.addresses ?? [])];
                        updated[idx].addressLine1 = e.target.value;
                        setFormData({ ...formData, addresses: updated });
                      }}
                      InputProps={{ startAdornment: <InputAdornment position="start"><HomeIcon color="primary" /></InputAdornment> }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                    <TextField
                      fullWidth
                      placeholder="Address Line 2"
                      value={address.addressLine2}
                      onChange={e => {
                        const updated = [...(formData.addresses ?? [])];
                        updated[idx].addressLine2 = e.target.value;
                        setFormData({ ...formData, addresses: updated });
                      }}
                      InputProps={{ startAdornment: <InputAdornment position="start"><HomeIcon color="primary" /></InputAdornment> }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                    <TextField
                      fullWidth
                      placeholder="City"
                      value={address.city}
                      onChange={e => {
                        const updated = [...(formData.addresses ?? [])];
                        updated[idx].city = e.target.value;
                        setFormData({ ...formData, addresses: updated });
                      }}
                      InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon color="primary" /></InputAdornment> }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                    <TextField
                      fullWidth
                      placeholder="State"
                      value={address.state}
                      onChange={e => {
                        const updated = [...(formData.addresses ?? [])];
                        updated[idx].state = e.target.value;
                        setFormData({ ...formData, addresses: updated });
                      }}
                      InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon color="primary" /></InputAdornment> }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                    <TextField
                      fullWidth
                      placeholder="Country"
                      value={address.country}
                      onChange={e => {
                        const updated = [...(formData.addresses ?? [])];
                        updated[idx].country = e.target.value;
                        setFormData({ ...formData, addresses: updated });
                      }}
                      InputProps={{ startAdornment: <InputAdornment position="start"><PublicIcon color="primary" /></InputAdornment> }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                    <TextField
                      fullWidth
                      placeholder="Zip"
                      value={address.zip}
                      onChange={e => {
                        const updated = [...(formData.addresses ?? [])];
                        updated[idx].zip = e.target.value;
                        setFormData({ ...formData, addresses: updated });
                      }}
                      InputProps={{ startAdornment: <InputAdornment position="start"><PublicIcon color="primary" /></InputAdornment> }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton color="error" onClick={() => {
                      const updated = [...(formData.addresses ?? [])];
                      updated.splice(idx, 1);
                      setFormData({ ...formData, addresses: updated });
                    }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton color="primary" onClick={() => setFormData({ ...formData, addresses: [...(formData.addresses ?? []), { addressLine1: '', addressLine2: '', city: '', state: '', country: '', zip: '', locations: [] }] })}>
                  <AddIcon />
                </IconButton>
                <Typography variant="body2" color="text.secondary">Add Address</Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              {(formData.addresses ?? []).map((address, idx) => (
                <Paper key={idx} sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                    <TextField
                      fullWidth
                      placeholder="Location Name"
                      value={address.locations[0]?.name || ''}
                      onChange={e => {
                        const updated = [...(formData.addresses ?? [])];
                        updated[idx].locations[0].name = e.target.value;
                        setFormData({ ...formData, addresses: updated });
                      }}
                      InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon color="primary" /></InputAdornment> }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                    <TextField
                      fullWidth
                      placeholder="Google Maps Link"
                      value={address.locations[0]?.map || ''}
                      onChange={e => {
                        const updated = [...(formData.addresses ?? [])];
                        updated[idx].locations[0].map = e.target.value;
                        setFormData({ ...formData, addresses: updated });
                      }}
                      InputProps={{ startAdornment: <InputAdornment position="start"><LinkIcon color="primary" /></InputAdornment> }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton color="error" onClick={() => {
                      const updated = [...(formData.addresses ?? [])];
                      updated[idx].locations.splice(0, 1);
                      setFormData({ ...formData, addresses: updated });
                    }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton color="primary" onClick={() => setFormData({ ...formData, addresses: [...(formData.addresses ?? []), { addressLine1: '', addressLine2: '', city: '', state: '', country: '', zip: '', locations: [{ name: '', map: '' }] }] })}>
                  <AddIcon />
                </IconButton>
                <Typography variant="body2" color="text.secondary">Add Location</Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button onClick={onClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 700,
              fontSize: 16,
              boxShadow: 3,
              transition: 'all 0.2s',
              '&:hover': { bgcolor: 'primary.dark', transform: 'scale(1.04)' },
            }}
          >
            {brand ? 'Save Changes' : 'Add Brand'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BrandManagement; 
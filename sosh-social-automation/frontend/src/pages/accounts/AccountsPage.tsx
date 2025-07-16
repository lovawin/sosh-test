import React, { useState } from 'react';
import {
  Grid,
  Typography,
  Button,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  OutlinedInput,
  SelectChangeEvent,
  CircularProgress,
} from '@mui/material';
import {
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Autorenew as AutorenewIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { TikTokIcon } from '../../components/icons/TikTokIcon';
import { ChildAccountProfileModal } from '../../components/ChildAccountProfileModal/ChildAccountProfileModal';
import {
  type SocialPlatform,
  type MotherAccount,
  type ChildAccount,
} from '../../services/social-platforms.service';
import { useAccounts } from '../../hooks/useAccounts';

interface PlatformConfig {
  name: string;
  icon: React.ReactNode;
  color: string;
}

const platformConfigs: Record<SocialPlatform, PlatformConfig> = {
  twitter: {
    name: 'Twitter',
    icon: <TwitterIcon />,
    color: '#1DA1F2',
  },
  instagram: {
    name: 'Instagram',
    icon: <InstagramIcon />,
    color: '#E1306C',
  },
  tiktok: {
    name: 'TikTok',
    icon: <TikTokIcon />,
    color: '#000000',
  },
  youtube: {
    name: 'YouTube',
    icon: <YouTubeIcon />,
    color: '#FF0000',
  },
};

export const AccountsPage: React.FC = () => {
  const {
    motherAccounts,
    childAccounts,
    loading,
    error,
    addMotherAccount,
    enableMotherAccountAutomation,
    removeMotherAccount,
    addChildAccount,
    updateChildMotherConnections,
  } = useAccounts();
  const [newMotherUsername, setNewMotherUsername] = useState<string>('');
  const [expandedPlatform, setExpandedPlatform] = useState<string | false>(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedChildAccount, setSelectedChildAccount] = useState<{
    id: string;
    platform: SocialPlatform;
    motherId: string;
  } | null>(null);

  const handleAddMotherAccount = async (platform: SocialPlatform) => {
    if (!newMotherUsername.trim()) return;
    try {
      await addMotherAccount(platform, newMotherUsername.trim());
      setNewMotherUsername('');
    } catch (error) {
      // Error is handled by the hook
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error.message}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Platform Accounts
      </Typography>
      <Grid container spacing={3}>
        {(Object.keys(platformConfigs) as SocialPlatform[]).map((platform) => {
          const config = platformConfigs[platform];
          const platformMotherAccounts = motherAccounts[platform];
          const platformChildAccounts = childAccounts[platform];

          return (
            <Grid item xs={12} key={platform}>
              <Accordion
                expanded={expandedPlatform === platform}
                onChange={() => setExpandedPlatform(expandedPlatform === platform ? false : platform)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: config.color,
                        mr: 2,
                      }}
                    >
                      {config.icon}
                    </Box>
                    <Typography variant="h6">{config.name}</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {/* Mother Accounts Section */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Mother Accounts
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <TextField
                        label="Username"
                        size="small"
                        value={newMotherUsername}
                        onChange={(e) => setNewMotherUsername(e.target.value)}
                      />
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleAddMotherAccount(platform)}
                      >
                        Add Mother Account
                      </Button>
                    </Box>
                    <List>
                      {platformMotherAccounts.map((account: MotherAccount) => (
                        <ListItem key={account.id}>
                          <ListItemText
                            primary={account.username}
                            secondary={
                              <Chip
                                size="small"
                                label={account.isAutomated ? 'Automated' : 'Basic'}
                                color={account.isAutomated ? 'success' : 'default'}
                              />
                            }
                          />
                          <ListItemSecondaryAction>
                            {!account.isAutomated && (
                              <Tooltip title="Enable automation">
                                <IconButton
                                  edge="end"
                                  onClick={() => enableMotherAccountAutomation(platform, account.id)}
                                  sx={{ mr: 1 }}
                                >
                                  <AutorenewIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Remove account">
                              <IconButton
                                edge="end"
                                onClick={() => removeMotherAccount(platform, account.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Child Accounts Section */}
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Child Accounts (OAuth Required)
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => addChildAccount(platform)}
                      sx={{ mb: 2 }}
                    >
                      Add Child Account
                    </Button>
                    <List>
                      {platformChildAccounts.map((account: ChildAccount) => (
                        <ListItem key={account.id}>
                          <ListItemText
                            primary={account.username}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Daily Interactions: {account.dailyInteractions} | Total: {account.totalInteractions}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <FormControl size="small" sx={{ mt: 1, minWidth: 200 }}>
                                    <Select
                                      multiple
                                      value={account.connectedMotherAccounts}
                                      onChange={(event: SelectChangeEvent<string[]>) => {
                                        const value = event.target.value as string[];
                                        updateChildMotherConnections(platform, account.id, value);
                                      }}
                                      input={<OutlinedInput />}
                                      renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                          {selected.map((value: string) => {
                                            const mother = platformMotherAccounts.find((m: MotherAccount) => m.id === value);
                                            return mother ? (
                                              <Chip key={value} label={mother.username} size="small" />
                                            ) : null;
                                          })}
                                        </Box>
                                      )}
                                    >
                                      {platformMotherAccounts.map((mother: MotherAccount) => (
                                        <MenuItem key={mother.id} value={mother.id}>
                                          {mother.username}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                  <Tooltip title="Manage Profile">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setSelectedChildAccount({
                                          id: account.id,
                                          platform,
                                          motherId: account.connectedMotherAccounts[0] || ''
                                        });
                                        setProfileModalOpen(true);
                                      }}
                                    >
                                      <SettingsIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>
          );
        })}
      </Grid>

      {/* Child Account Profile Modal */}
      {selectedChildAccount && (
        <ChildAccountProfileModal
          open={profileModalOpen}
          onClose={() => {
            setProfileModalOpen(false);
            setSelectedChildAccount(null);
          }}
          platform={selectedChildAccount.platform}
          motherAccountId={selectedChildAccount.motherId}
          childAccountId={selectedChildAccount.id}
        />
      )}
    </Box>
  );
};

export default AccountsPage;

import * as React from "react";

import { Keyboard, Settings } from "@mui/icons-material";
import LogoutIcon from "@mui/icons-material/Logout";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useHotkeys } from "react-hotkeys-hook";

import ProfileAvatar from "@/components/general/ProfileAvatar";
import ThemeMenuItem from "@/components/general/ThemeMenuItem";
import { auth } from "@/firebase";
import { useAuthStore } from "@/store/auth";
import { useKeyboardShortcutStore } from "@/store/keyboard-shortcut";
import { Capacitor } from "@capacitor/core";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { signOut } from "firebase/auth";
import toast from "react-hot-toast";

const logout = async () => {
  if (Capacitor.isNativePlatform()) {
    await toast.promise(
      GoogleAuth.signOut(),
      {
        loading: "Logout...",
        success: "Success",
        error: "Failed to Logout",
      },
      {
        style: {
          minWidth: "180px",
        },
      },
    );
  }
  return signOut(auth);
};

export default function SettingsMenu() {
  const { user } = useAuthStore();
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const openModal = useKeyboardShortcutStore((state) => state.openModal);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleItemClick = (cb?: () => void) => {
    setAnchorEl(null);
    cb?.();
  };

  useHotkeys(
    "shift+s",
    () => {
      if (!anchorEl) {
        buttonRef.current?.click();
      } else {
        setAnchorEl(null);
      }
    },
    undefined,
    [anchorEl],
  );

  return (
    <React.Fragment>
      <Tooltip title="Settings">
        <IconButton
          onClick={handleClick}
          size="medium"
          aria-controls={open ? "settings-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          ref={buttonRef}
        >
          <Settings htmlColor="#fff" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        id="settings-menu"
        open={open}
        onClose={() => handleItemClick()}
        onClick={() => handleItemClick()}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
              minWidth: 180,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={() => handleItemClick()}>
          {!user ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Avatar /> Profile
            </Box>
          ) : (
            <Box sx={{ display: "flex" }}>
              <ProfileAvatar />
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography fontSize={12} color="grey">
                  Profile
                </Typography>
                <Typography fontSize={12} color="grey">
                  {user.email}
                </Typography>
              </Box>
            </Box>
          )}
        </MenuItem>
        <Divider />
        <ThemeMenuItem handleItemClick={handleItemClick} />
        <Divider />
        <MenuItem
          onClick={() => handleItemClick(openModal)}
          sx={{
            marginTop: "0.5rem",
          }}
        >
          <ListItemIcon>
            <Keyboard />
          </ListItemIcon>
          Keyboard shortcuts
        </MenuItem>
        {user ? (
          <Box>
            <Divider sx={{ marginTop: "0.5rem", marginBottom: "0.5rem" }} />
            <MenuItem onClick={() => handleItemClick(logout)}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Box>
        ) : null}
      </Menu>
    </React.Fragment>
  );
}

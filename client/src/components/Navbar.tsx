import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
	AppBar,
	Toolbar,
	Typography,
	Button,
	IconButton,
	Menu,
	MenuItem,
	Box,
	Avatar
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleLogout = () => {
		logout();
		handleClose();
		navigate("/");
	};

	return (
		<AppBar position="static">
			<Toolbar>
				<Typography
					variant="h6"
					component={RouterLink}
					to="/"
					sx={{
						flexGrow: 1,
						textDecoration: "none",
						color: "inherit"
					}}
				>
					MovieBox
				</Typography>

				{user ? (
					<>
						<Button
							color="inherit"
							component={RouterLink}
							to="/watchlist"
							sx={{ mr: 2 }}
						>
							Watchlist
						</Button>
						<IconButton onClick={handleMenu} color="inherit">
							<Avatar
								alt={user.username}
								src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
									user.username
								)}`}
								sx={{ width: 32, height: 32 }}
							/>
						</IconButton>
						<Menu
							anchorEl={anchorEl}
							open={Boolean(anchorEl)}
							onClose={handleClose}
						>
							<MenuItem
								component={RouterLink}
								to="/profile"
								onClick={handleClose}
							>
								Profile
							</MenuItem>
							<MenuItem onClick={handleLogout}>Logout</MenuItem>
						</Menu>
					</>
				) : (
					<Box>
						<Button
							color="inherit"
							component={RouterLink}
							to="/login"
							sx={{ mr: 1 }}
						>
							Login
						</Button>
						<Button color="inherit" component={RouterLink} to="/register">
							Register
						</Button>
					</Box>
				)}
			</Toolbar>
		</AppBar>
	);
}

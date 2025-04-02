import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
	Container,
	Paper,
	TextField,
	Button,
	Typography,
	Box,
	Alert,
	Link
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

export default function Register() {
	const navigate = useNavigate();
	const { register } = useAuth();
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: ""
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value
		}));
	};

	const validateForm = () => {
		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match");
			return false;
		}
		if (formData.password.length < 6) {
			setError("Password must be at least 6 characters long");
			return false;
		}
		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!validateForm()) {
			return;
		}

		setLoading(true);

		try {
			await register(formData.username, formData.email, formData.password);
			navigate("/");
		} catch (error) {
			setError("Registration failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container maxWidth="sm">
			<Box sx={{ py: 8 }}>
				<Paper sx={{ p: 4 }}>
					<Typography variant="h4" component="h1" gutterBottom align="center">
						Register
					</Typography>

					{error && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{error}
						</Alert>
					)}

					<form onSubmit={handleSubmit}>
						<TextField
							fullWidth
							label="Username"
							name="username"
							value={formData.username}
							onChange={handleChange}
							margin="normal"
							required
							autoComplete="username"
						/>
						<TextField
							fullWidth
							label="Email"
							name="email"
							type="email"
							value={formData.email}
							onChange={handleChange}
							margin="normal"
							required
							autoComplete="email"
						/>
						<TextField
							fullWidth
							label="Password"
							name="password"
							type="password"
							value={formData.password}
							onChange={handleChange}
							margin="normal"
							required
							autoComplete="new-password"
						/>
						<TextField
							fullWidth
							label="Confirm Password"
							name="confirmPassword"
							type="password"
							value={formData.confirmPassword}
							onChange={handleChange}
							margin="normal"
							required
							autoComplete="new-password"
						/>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							size="large"
							disabled={loading}
							sx={{ mt: 3 }}
						>
							{loading ? "Registering..." : "Register"}
						</Button>
					</form>

					<Box sx={{ mt: 2, textAlign: "center" }}>
						<Typography variant="body2">
							Already have an account?{" "}
							<Link component={RouterLink} to="/login" underline="hover">
								Login
							</Link>
						</Typography>
					</Box>
				</Paper>
			</Box>
		</Container>
	);
}

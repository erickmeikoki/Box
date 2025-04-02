import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface PrivateRouteProps {
	children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
	const { user, loading } = useAuth();

	if (loading) {
		return null;
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	return <>{children}</>;
}

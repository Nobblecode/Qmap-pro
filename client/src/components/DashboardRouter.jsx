// components/DashboardRouter.jsx
import AffiliateDashboard from "./AffiliateDashboard";
import ProductOwnerDashboard from "./ProductOwnerDashboard";
import AdminDashboard from "./AdminDashboard";

export default function DashboardRouter({ role }) {
  switch (role) {
    case "affiliate":
      return <AffiliateDashboard />;
    case "productOwner":
      return <ProductOwnerDashboard onSubmitProduct={handleProductSubmit} />;
    case "admin":
      return <AdminDashboard />;
    default:
      return <div>Unauthorized</div>;
  }
}AffiliateDashboard

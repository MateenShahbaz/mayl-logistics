// App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Verification from "./pages/AuthPages/Verification";
import Order from "./pages/orders/Order";
import VerifiedShipper from "./pages/shippers/verifiedShipper/VerifiedShipper";
import UnVerifiedShipper from "./pages/shippers/unVerifiedShipper/UnVerifiedShipper";
import BulkBooking from "./pages/orders/BulkBooking";
import OrderLog from "./pages/orders/OrderLog";
import AirwayBills from "./pages/orders/AirwayBills";
import LoadSheet from "./pages/orders/LoadSheet";
import LogSheet from "./pages/orders/LogSheet";
import CashPayment from "./pages/payments/CashPayment";
import TransactionLog from "./pages/payments/TransactionLog";
import ProtectedRoute from "./utils/ProtectedRoute";
import Processing from "./pages/AuthPages/Processing";
import ViewShipper from "./pages/shippers/verifiedShipper/ViewShipper";
import OrderView from "./pages/orders/OrderView";
import ShippmentArrives from "./pages/MayllogisticsCalc/ShippmentArrives";
import Utilities from "./pages/MayllogisticsCalc/Utilities";
import OnRoute from "./pages/MayllogisticsCalc/OnRoute/OnRoute";
import AddOnRoute from "./pages/MayllogisticsCalc/OnRoute/AddOnRoute";
import OutForDelivery from "./pages/Debriefing/OutForDelivery/OutForDelivery";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Protected Layout (all child routes require auth) */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index path="/" element={<Home />} />
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/orders" element={<Order />} />
          <Route path="/bulk-booking" element={<BulkBooking />} />
          <Route path="/order-log" element={<OrderLog />} />
          <Route path="/airway-bills" element={<AirwayBills />} />
          <Route path="/load-sheet" element={<LoadSheet />} />
          <Route path="/log-sheet" element={<LogSheet />} />
          <Route path="/cash-payment" element={<CashPayment />} />
          <Route path="/transaction-log" element={<TransactionLog />} />
          <Route path="/verified" element={<VerifiedShipper />} />
          <Route path="/unverified" element={<UnVerifiedShipper />} />
          <Route path="/shipper-view/:id" element={<ViewShipper />} />
          <Route path="/order-view/:id" element={<OrderView />} />

          {/* admin */}
          <Route path="/shippment-arrives" element={<ShippmentArrives />} />
          <Route path="/utilities" element={<Utilities />} />
          <Route path="/on-route" element={<OnRoute />} />
          <Route path="/add-on-route" element={<AddOnRoute />} />
          <Route path="/out-for-delivery" element={<OutForDelivery />} />
        </Route>

        {/* Public routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/processing" element={<Processing />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

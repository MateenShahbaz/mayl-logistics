import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import ProtectedRoute from "./utils/ProtectedRoute";

const SignIn = lazy(() => import("./pages/AuthPages/SignIn"));
const SignUp = lazy(() => import("./pages/AuthPages/SignUp"));
const NotFound = lazy(() => import("./pages/OtherPage/NotFound"));
const UserProfiles = lazy(() => import("./pages/UserProfiles"));
const AppLayout = lazy(() => import("./layout/AppLayout"));
const Home = lazy(() => import("./pages/Dashboard/Home"));
const Verification = lazy(() => import("./pages/AuthPages/Verification"));
const Order = lazy(() => import("./pages/orders/Order"));
const VerifiedShipper = lazy(() => import("./pages/shippers/verifiedShipper/VerifiedShipper"));
const UnVerifiedShipper = lazy(() => import("./pages/shippers/unVerifiedShipper/UnVerifiedShipper"));
const BulkBooking = lazy(() => import("./pages/orders/BulkBooking"));
const OrderLog = lazy(() => import("./pages/orders/OrderLog"));
const AirwayBills = lazy(() => import("./pages/orders/AirwayBills"));
const LoadSheet = lazy(() => import("./pages/orders/LoadSheet"));
const LogSheet = lazy(() => import("./pages/orders/LogSheet"));
const CashPayment = lazy(() => import("./pages/payments/CashPayment"));
const TransactionLog = lazy(() => import("./pages/payments/TransactionLog"));
const Processing = lazy(() => import("./pages/AuthPages/Processing"));
const ViewShipper = lazy(() => import("./pages/shippers/verifiedShipper/ViewShipper"));
const OrderView = lazy(() => import("./pages/orders/OrderView"));


export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
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
          </Route>

          {/* Public routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/processing" element={<Processing />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

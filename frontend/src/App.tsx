import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login, Register } from "@features/auth";
import { AnonymousRoute, Layout, ProtectedRoute } from "@shared";
import { Toaster } from "react-hot-toast";
import { AboutPage } from "@features/about";
import { ShortenedUrlPage, ViewUrlPage } from "@features/shortenedUrl";
import { AdminsPage } from "@features/admins";
import AuthCheckWrapper from "@shared/components/AuthCheckWrapper";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Layout>
          <AuthCheckWrapper>
            <Routes>
              <Route element={<AnonymousRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={["SuperAdmin"]} />}>
                <Route path="/admins" element={<AdminsPage />} />
              </Route>

              <Route path="/" element={<ShortenedUrlPage />}>
                <Route element={<ProtectedRoute allowedRoles={["User", "Admin", "SuperAdmin"]} />}>
                  <Route path="url/:id" element={<ViewUrlPage />} />
                </Route>
              </Route>
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthCheckWrapper>
        </Layout>
      </BrowserRouter>
      <Toaster position="bottom-right" />
    </>
  );
}

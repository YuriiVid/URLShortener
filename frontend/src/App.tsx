import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login, Register } from "@features/auth";
import { AnonymousRoute, ProtectedRoute } from "@shared";
import { Toaster } from "react-hot-toast";
import AboutPage from "./features/about/pages/AboutPage";
import ShortenedUrlPage from "@features/shortenedUrl/pages/ShortenedUrlPage";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<AnonymousRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/shortenedUrl" element={<AboutPage />} />
          </Route>

          <Route path="/" element={<ShortenedUrlPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" />
    </>
  );
}

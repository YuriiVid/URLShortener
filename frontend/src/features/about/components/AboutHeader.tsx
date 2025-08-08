import React from "react";
import { FileText } from "lucide-react";

const AboutHeader: React.FC = () => (
  <div className="text-center mb-2 sm:mb-4 relative">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-2">
      <FileText className="w-8 h-8 text-blue-600" />
    </div>
    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">About</h1>
  </div>
);

export default AboutHeader;

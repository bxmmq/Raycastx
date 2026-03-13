"use client";

export default function RefreshButton() {
  return (
    <button 
      className="ml-2 underline hover:text-white" 
      onClick={() => window.location.reload()}
    >
      รีเฟรชหน้าต่าง
    </button>
  );
}

import React, { ReactNode } from 'react';

interface AppLayoutProps {
  header: ReactNode;
  editor: ReactNode;
  preview: ReactNode;
  config: ReactNode;
}

export function AppLayout({ header, editor, preview, config }: AppLayoutProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 text-gray-800">
      {header}
      <div className="flex h-[calc(100vh-46px)] overflow-hidden">
        {editor}
        {preview}
        {config}
      </div>
    </div>
  );
}

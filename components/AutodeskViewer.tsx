"use client";

import { useEffect, useRef } from 'react';
import axios from 'axios';

// Declare standard APS global
declare global {
  interface Window {
    Autodesk: any;
  }
}

export default function AutodeskViewer({ urn }: { urn: string }) {
  const viewerRef = useRef<HTMLDivElement>(null);
  let viewer: any = null;

  useEffect(() => {
    if (!urn || !window.Autodesk || !viewerRef.current) return;

    const getAccessToken = async (callback: any) => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
            const res = await axios.get(`${API_URL}/auth/token`);
            callback(res.data.access_token, res.data.expires_in);
        } catch (err) {
            console.error("Failed to authenticate viewer", err);
        }
    };

    const options = {
      env: 'AutodeskProduction',
      api: 'derivativeV2',
      getAccessToken: getAccessToken
    };

    window.Autodesk.Viewing.Initializer(options, () => {
      viewer = new window.Autodesk.Viewing.GuiViewer3D(viewerRef.current);
      viewer.start();

      const documentId = `urn:${urn}`;
      window.Autodesk.Viewing.Document.load(
        documentId,
        (doc: any) => {
          const defaultModel = doc.getRoot().getDefaultGeometry();
          viewer.loadDocumentNode(doc, defaultModel);
        },
        (errorCode: any, errorMsg: any, messages: any) => {
          console.error("Failed to load Autodesk Model", errorMsg);
        }
      );
    });

    return () => {
      if (viewer && viewer.running) {
        viewer.finish();
      }
    };
  }, [urn]);

  return (
    <div className="w-full h-[600px] relative rounded-xl overflow-hidden glass-panel">
        {!urn && <div className="absolute inset-0 flex items-center justify-center text-slate-400">No Model Rendered. Proceed with Job Upload.</div>}
        <div ref={viewerRef} className="w-full h-full" />
    </div>
  );
}

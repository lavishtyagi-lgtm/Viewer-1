import React, { useEffect, useRef, CSSProperties } from 'react';

// Props for the viewer component
interface ForgeViewerProps {
    urn: string | null;
    getAccessToken: (callback: (accessToken: string, expiresIn: number) => void) => void;
}

// --- Style Definition for the viewer container ---
const viewerStyle: CSSProperties = {
    width: '100%',
    height: '100%', // Changed from 100vh to 100%
    position: 'relative',
    backgroundColor: '#f0f0f0'
};

const ForgeViewer: React.FC<ForgeViewerProps> = ({ urn, getAccessToken }) => {
    const viewerDiv = useRef<HTMLDivElement>(null);
    const viewerInstance = useRef<any>(null);

    useEffect(() => {
        if (!viewerDiv.current) return;
        const Autodesk = (window as any).Autodesk;
        if (!Autodesk) {
            console.error("Autodesk viewer script is not loaded");
            return;
        }

        // Cleanup previous viewer instance
        if (viewerInstance.current && viewerInstance.current.finish) {
            viewerInstance.current.finish();
            viewerInstance.current = null;
        }

        Autodesk.Viewing.Initializer(
            { env: 'AutodeskProduction', getAccessToken },
            () => {
                const viewer = new Autodesk.Viewing.GuiViewer3D(
                    viewerDiv.current!, 
                    { 
                        extensions: ['Autodesk.DocumentBrowser'],
                        // Add config to ensure proper sizing
                        config: {
                            'extensions': ['Autodesk.DocumentBrowser']
                        }
                    }
                );
                
                viewer.start();
                viewer.setTheme('light-theme');
                viewerInstance.current = viewer;

                // Force resize after initialization
                setTimeout(() => {
                    if (viewer && viewer.resize) {
                        viewer.resize();
                    }
                }, 100);

                if (urn) {
                    Autodesk.Viewing.Document.load(
                        `urn:${urn}`,
                        (doc: any) => {
                            viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry());
                            // Force resize after model load
                            setTimeout(() => {
                                if (viewer && viewer.resize) {
                                    viewer.resize();
                                }
                            }, 500);
                        },
                        (code: any, message: any) => {
                            console.error('Failed to load document', message);
                        }
                    );
                }
            }
        );

        // Cleanup function
        return () => {
            if (viewerInstance.current && viewerInstance.current.finish) {
                viewerInstance.current.finish();
                viewerInstance.current = null;
            }
        };
    }, [urn, getAccessToken]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (viewerInstance.current && viewerInstance.current.resize) {
                viewerInstance.current.resize();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div
            ref={viewerDiv}
            style={viewerStyle}
            id="forgeViewer"
        />
    );
};

export default ForgeViewer;
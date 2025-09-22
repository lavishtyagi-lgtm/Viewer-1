import React, { useState, useRef, CSSProperties } from 'react';

interface DragDropUploadProps {
    onUpload: (file: File, entrypoint?: string) => void;
}


const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: '#f8f9fa',
    position: 'relative'
};

const dropZoneStyle: CSSProperties = {
    border: '3px dashed #007bff',
    borderRadius: '12px',
    padding: '4rem 2rem',
    textAlign: 'center',
    backgroundColor: '#fff',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    minWidth: '400px',
    maxWidth: '600px',
    width: '80%'
};

const dropZoneActiveStyle: CSSProperties = {
    ...dropZoneStyle,
    borderColor: '#28a745',
    backgroundColor: '#f8fff9',
    transform: 'scale(1.02)'
};

const iconStyle: CSSProperties = {
    fontSize: '4rem',
    color: '#007bff',
    marginBottom: '1rem'
};

const titleStyle: CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#343a40',
    marginBottom: '0.5rem'
};

const subtitleStyle: CSSProperties = {
    fontSize: '1rem',
    color: '#6c757d',
    marginBottom: '2rem'
};

const supportedFormatsStyle: CSSProperties = {
    fontSize: '0.875rem',
    color: '#6c757d',
    fontStyle: 'italic'
};

const uploadButtonStyle: CSSProperties = {
    padding: '0.8rem 2rem',
    fontSize: '1rem',
    fontWeight: '500',
    color: '#fff',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '1rem',
    transition: 'background-color 0.2s ease-in-out',
};

const DragDropUpload: React.FC<DragDropUploadProps> = ({ onUpload }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    const handleFileUpload = (file: File) => {
        if (file.name.endsWith('.zip')) {
            const entrypoint = window.prompt('Please enter the filename of the main design inside the archive.');
            if (!entrypoint) return;
            onUpload(file, entrypoint);
        } else {
            onUpload(file);
        }
    };

    const handleButtonClick = () => {
        inputRef.current?.click();
    };

    const handleFileChange = () => {
        const file = inputRef.current?.files?.[0];
        if (!file) return;
        handleFileUpload(file);
        
        if (inputRef.current) {
            inputRef.current.value = ''; // reset
        }
    };

    return (
        <div style={containerStyle}>
            <div
                style={isDragOver ? dropZoneActiveStyle : dropZoneStyle}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleButtonClick}
            >
                <div style={iconStyle}>📁</div>
                <h2 style={titleStyle}>
                    {isDragOver ? 'Drop your model file here' : 'Upload 3D Model'}
                </h2>
                <p style={subtitleStyle}>
                    Drag and drop your model file here, or click to browse
                </p>
                <button 
                    style={uploadButtonStyle}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                >
                    Choose File
                </button>
                <p style={supportedFormatsStyle}>
                    Supported formats: .dwg, .step, .iges, .sat, .ipt, .iam, .zip and more
                </p>
            </div>
            
            <input
                type="file"
                ref={inputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
        </div>
    );
};

export default DragDropUpload;
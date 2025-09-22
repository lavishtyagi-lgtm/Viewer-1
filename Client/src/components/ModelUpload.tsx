import React, { useRef, CSSProperties } from 'react';

interface ModelUploadProps {
    onUpload: (file: File, entrypoint?: string) => void;
}

// --- Style Definition for the button ---
const buttonStyle: CSSProperties = {
    padding: '0.5em 1.2em',
    fontSize: '1em',
    fontWeight: '500',
    color: '#fff',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: 'auto',
    transition: 'background-color 0.2s ease-in-out',
};

const ModelUpload: React.FC<ModelUploadProps> = ({ onUpload }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const onButtonClick = () => {
        inputRef.current?.click();
    };

    const onFileChange = () => {
        const file = inputRef.current?.files?.[0];
        if (!file) return;

        if (file.name.endsWith('.zip')) {
            const entrypoint = window.prompt('Please enter the filename of the main design inside the archive.');
            if (!entrypoint) return;
            onUpload(file, entrypoint);
        } else {
            onUpload(file);
        }

        if (inputRef.current) {
            inputRef.current.value = ''; // reset
        }
    };

    return (
        <>
            <button onClick={onButtonClick} style={buttonStyle}>
                Upload
            </button>
            <input
                type="file"
                ref={inputRef}
                onChange={onFileChange}
                style={{ display: 'none' }}
            />
        </>
    );
};

export default ModelUpload;


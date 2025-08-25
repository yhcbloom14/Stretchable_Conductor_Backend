import Button from "./button";
import { Upload } from "lucide-react";

interface FileInputProps {
    handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
    disabled?: boolean
}

export default function FileInput({handleFileUpload, disabled=false}: FileInputProps) {
    return (
        <>
            <input
                type="file"
                id="file-upload"
                accept=".csv"
                onChange={handleFileUpload}
                className="sr-only"
                disabled={disabled}
            />
            <label htmlFor="file-upload">
                <Button
                    type="button"
                    variant="default"
                    size="small"
                    onClick={() => !disabled && document.getElementById("file-upload")?.click()}
                    disabled={disabled}
                >
                    <Upload className="h-3 w-3 mr-2" /> Upload File
                </Button>
            </label>
        </>
    );
}
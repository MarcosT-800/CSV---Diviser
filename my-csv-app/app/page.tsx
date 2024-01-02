'use client'
import React, { useState, ChangeEvent } from 'react';
import * as XLSX from 'xlsx';
import { useDropzone } from 'react-dropzone';
import Navbar from './components/navbar';

const dropzoneStyle: React.CSSProperties = {
  border: '2px dashed #3498db',
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
  margin: '20px',
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: '#ecf0f1',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  maxWidth: '600px',
  margin: '0 auto',
};

const inputStyle: React.CSSProperties = {
  margin: '10px',
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #3498db',
  fontSize: '16px',
  textAlign: 'center',
  color: 'black',
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#3498db',
  color: '#fff',
  padding: '15px',
  borderRadius: '4px',
  fontSize: '18px',
  cursor: 'pointer',
  marginTop: '20px',
  border: 'none',
  outline: 'none',
  transition: 'background-color 0.3s',
};

const buttonHoverStyle: React.CSSProperties = {
  backgroundColor: '#2980b9',
};

const footerStyle: React.CSSProperties = {
  textAlign: 'center',
  alignContent: 'flex-end',
  marginTop: '20px',
};

export default function Home() {
    const [file, setFile] = useState<File | null>(null);
    const [parts, setParts] = useState<number>(1);
    const [percentages, setPercentages] = useState<number[]>([100]);
    const [isHovered, setHovered] = useState<boolean>(false);
    const [selectedFormat, setSelectedFormat] = useState<'xlsx' | 'csv'>('xlsx');
  
    // Adicione a função handlePartsChange
    const handlePartsChange = (event: ChangeEvent<HTMLInputElement>) => {
      const newParts = parseInt(event.target.value, 10);
      setParts(newParts);
      const defaultPercentage = Math.floor(100 / newParts);
      setPercentages(new Array(newParts).fill(defaultPercentage));
    };
  
    const handlePercentageChange = (index: number, value: number) => {
      const updatedPercentages = [...percentages];
      updatedPercentages[index] = value;
      setPercentages(updatedPercentages);
    };

  const handleDownload = () => {
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;

        const data = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = data.SheetNames[0];
        const worksheet: XLSX.Sheet = data.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });

        const nonEmptyRows = jsonData.filter((row) => row.some((cellValue) => typeof cellValue === 'string' && cellValue.trim() !== ''));

        const totalRows = nonEmptyRows.length;

        const rowsPerPart = percentages.map((percentage) => Math.ceil((percentage / 100) * totalRows));

        const header = nonEmptyRows.shift() || [];

        for (let i = 0; i < parts; i++) {
          const startRow = i > 0 ? rowsPerPart.slice(0, i).reduce((acc, val) => acc + val, 0) : 0;
          const endRow = startRow + rowsPerPart[i];

          const slicedData: string[][] = [header];
          slicedData.push(...nonEmptyRows.slice(startRow, endRow));

          if (slicedData.length > 0) {
            const slicedWorkbook = XLSX.utils.book_new();
            const slicedWorksheet = XLSX.utils.aoa_to_sheet(slicedData);
            XLSX.utils.book_append_sheet(slicedWorkbook, slicedWorksheet, 'Sheet 1');

            let blob: Blob;
            let extension: string;

            if (selectedFormat === 'xlsx') {
              //@ts-ignore
              blob = new Blob([XLSX.write(slicedWorkbook, { bookType: 'xlsx', type: 'array', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })]);
              extension = 'xlsx';
            } else if (selectedFormat === 'csv') {
              blob = new Blob([XLSX.utils.sheet_to_csv(slicedWorksheet)]);
              extension = 'csv';
            } else {
              console.error("Formato de arquivo inválido selecionado");
              return;
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `part_${i + 1}.${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        }
      } catch (error) {
        console.error("Erro durante o processamento do arquivo:", error);
      }
    };

    fileReader.readAsArrayBuffer(file);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      const uploadedFile = acceptedFiles[0];
      setFile(uploadedFile);
    },
  });

  return (
    <>
    <Navbar />
      <div style={containerStyle}>
        <h1 style={{ color: '#3498db', marginBottom: '20px', fontSize: '40px' }}>Manipulação de Arquivo Excel (XLS)</h1>
        <div {...getRootProps()} style={dropzoneStyle}>
          <input {...getInputProps()} />
          <p style={{ fontSize: '18px', color: 'black' }}>Arraste e solte o arquivo Excel (XLS) aqui ou clique para fazer o upload.</p>
        </div>
        <label style={{ fontSize: '18px', color: 'black' }}>
          Partes para o seu arquivo:
          <input type="number" value={parts} onChange={handlePartsChange} style={inputStyle} />
        </label>
        {Array.from({ length: parts }, (_, i) => (
          <label key={i} style={{ fontSize: '18px', color: 'black' }}>
            Porcentagem para Parte {i + 1}:
            <input
              type="number"
              value={percentages[i]}
              onChange={(e) => handlePercentageChange(i, parseFloat(e.target.value))}
              style={inputStyle}
            />
          </label>
        ))}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
          <label style={{ fontSize: '18px', color: 'black' }}>
            Formato de arquivo:
            <select value={selectedFormat} onChange={(e) => setSelectedFormat(e.target.value as 'xlsx' | 'csv')} style={inputStyle}>
              <option value="xlsx">XLSX</option>
              <option value="csv">CSV</option>
            </select>
          </label>
        </div>
        <button
          onClick={handleDownload}
          style={{ ...buttonStyle, ...(isHovered ? buttonHoverStyle : {}) }}
          onMouseOver={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          Dividir e Baixar
        </button>
      </div>
      <footer style={footerStyle}>
        <p>Development By MarcosJr<span> Copyright © PH Negócios</span></p>
      </footer>
    </>
  );
}

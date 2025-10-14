export const exportService = {
  exportToExcel: (data, filename) => {
    // Logic xuất Excel
    const blob = new Blob([data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    downloadFile(blob, `${filename}.xlsx`);
  },

  exportToPDF: (data, filename) => {
    // Logic xuất PDF
    const blob = new Blob([data], { type: 'application/pdf' });
    downloadFile(blob, `${filename}.pdf`);
  }
};

const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};
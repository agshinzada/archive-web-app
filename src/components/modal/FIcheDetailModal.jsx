import { Button, Modal, notification, Upload } from "antd";
import { useFiches } from "../../context/FichesContext";
import styles from "./modal.module.css";
import {
  FilePdfOutlined,
  FileZipOutlined,
  FolderViewOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useAuth } from "../../context/AuthContext";
import {
  fetchDownloadFiles,
  fetchUploadFiles,
} from "../../services/file_service";
import { PDFDocument } from "pdf-lib";
import { useState } from "react";

function FicheDetailModal() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const {
    ficheDetailIsOpen,
    setFicheDetailIsOpen,
    selectedFiche,
    selectedFicheFileList,
  } = useFiches();

  const props = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      if (file.type === "image/png" || file.type === "image/jpeg") {
        const newFile = generateName(file);
        setFileList([...fileList, newFile]);
        return false;
      } else {
        notification.info({
          placement: "topRight",
          message: "Sənəd düzəlişi",
          description: "Fayl tipi düzgün deyil!",
        });
        return Upload.LIST_IGNORE;
      }
    },
    fileList,
  };

  function generateName(file) {
    try {
      const ext = file.name.substring(file.name.lastIndexOf("."));
      const fileName = `${selectedFiche.FICHENO}_${
        selectedFiche.TRCODE
      }_M_${Math.random().toString(36).substring(2, 6)}${ext}`;
      const newFile = new File([file], fileName, { type: file.type });
      return newFile;
    } catch (error) {
      console.log(error);
    }
  }

  const handleViewFile = async (name) => {
    setLoading(true);
    const data = await fetchDownloadFiles(name, user.TOKEN);
    if (data) {
      const blob = new Blob([data], { type: "image/jpeg" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    setLoading(true);
    const zip = new JSZip();
    for (const iterator of selectedFicheFileList) {
      const fileData = await fetchDownloadFiles(iterator.FILENAME, user.TOKEN);
      if (fileData) {
        zip.file(iterator.FILENAME, fileData);
      }
    }
    if (zip.length > 0) {
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, selectedFiche?.FICHENO);
    }
    setLoading(false);
  };

  const handlePdfDownload = async () => {
    setLoading(true);
    const pdfDoc = await PDFDocument.create();

    for (let iterator of selectedFicheFileList) {
      const fileData = await fetchDownloadFiles(iterator.FILENAME, user.TOKEN);
      if (fileData) {
        const page = pdfDoc.addPage();
        const pngImage = await pdfDoc.embedJpg(fileData);
        const pageWidth = page.getWidth();
        const pageHeight = page.getHeight();

        // Görsel boyutlarını sayfa boyutuna göre ayarlama
        const imageWidth = pngImage.width;
        const imageHeight = pngImage.height;
        const aspectRatio = imageWidth / imageHeight;

        let scaledWidth, scaledHeight;

        // Görseli sayfaya sığdırmak için ölçeklendirme
        if (imageWidth > pageWidth || imageHeight > pageHeight) {
          if (pageWidth / aspectRatio <= pageHeight) {
            scaledWidth = pageWidth;
            scaledHeight = pageWidth / aspectRatio;
          } else {
            scaledHeight = pageHeight;
            scaledWidth = pageHeight * aspectRatio;
          }
        } else {
          scaledWidth = imageWidth;
          scaledHeight = imageHeight;
        }

        page.drawImage(pngImage, {
          x: (pageWidth - scaledWidth) / 2, // Ortalamak için X konumu
          y: (pageHeight - scaledHeight) / 2, // Ortalamak için Y konumu
          width: scaledWidth,
          height: scaledHeight,
        });
      } else {
        setLoading(false);
        return;
      }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedFiche.FICHENO}.pdf`;
    link.click();
    setLoading(false);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append("files[]", file);
    });
    formData.append("ficheno", selectedFiche.FICHENO);
    formData.append("type", selectedFiche.TRCODE);
    formData.append("token", user.TOKEN);
    formData.append("readstatus", 1);
    setUploading(true);
    const res = await fetchUploadFiles(formData);
    if (res) {
      setFileList([]);
      setFicheDetailIsOpen(false);
    }
    setUploading(false);
  };

  return (
    <Modal
      title="İrsaliyə məlumatları"
      centered
      open={ficheDetailIsOpen}
      onOk={() => setFicheDetailIsOpen(false)}
      onCancel={() => setFicheDetailIsOpen(false)}
      footer={[]}
    >
      <div className={styles.container}>
        <p className={styles.title}>{selectedFiche?.FICHENO}</p>
        <div className={styles.grid}>
          <p>
            <span>Müştəri adı:</span>
            <p>{selectedFiche?.DEFINITION_}</p>
          </p>
          <p>
            <span>Müştəri kodu:</span>
            <p>{selectedFiche?.CODE}</p>
          </p>
          <p>
            <span>Təslimatçı:</span>
            <p>{selectedFiche?.TESLIMAT}</p>
          </p>
          <p>
            <span>Məbləğ:</span>
            <p>{selectedFiche?.NETTOTAL}</p>
          </p>
          <p>
            <span>Tarix:</span>
            <p>
              {new Date(selectedFiche?.FICHE_DATE).toLocaleDateString("az")}
            </p>
          </p>
        </div>
        <div className="mt-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">
              {selectedFicheFileList.length} fayl mövcuddur
            </span>
            <div className="flex gap-1">
              <Button
                type="primary"
                icon={<FileZipOutlined />}
                size={"middle"}
                loading={loading}
                onClick={handleDownload}
              >
                ZIP
              </Button>
              <Button
                type="primary"
                icon={<FilePdfOutlined />}
                size={"middle"}
                loading={loading}
                onClick={handlePdfDownload}
                // disabled
              >
                PDF
              </Button>
            </div>
          </div>
          <div
            style={{
              padding: "10px",
              border: "1px solid #ebebeb",
              marginTop: "10px",
            }}
          >
            {Object.keys(selectedFicheFileList).length &&
              selectedFicheFileList?.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div key={item.ID} className="font-bold">
                    {item.FILENAME}
                  </div>
                  <Button
                    type="link"
                    icon={<FolderViewOutlined />}
                    size={"middle"}
                    loading={loading}
                    onClick={() => handleViewFile(item.FILENAME)}
                    // disabled
                  >
                    View
                  </Button>
                </div>
              ))}
          </div>
        </div>
        {user.ROLE === "ADMIN" || user.ROLE === "MODERATOR" ? (
          <div
            style={{
              border: "1px solid #efefef",
              marginTop: "1rem",
              padding: "10px",
            }}
          >
            <p
              style={{
                fontWeight: "500",
              }}
            >
              Əlavə sənəd:
            </p>
            <div className={styles.grid1}>
              <Upload {...props}>
                <Button icon={<UploadOutlined />}>
                  Faylı seç <small> (.jpg və ya .png)</small>
                </Button>
              </Upload>
            </div>
            <Button type="primary" onClick={handleUpload} loading={uploading}>
              Göndər
            </Button>
          </div>
        ) : (
          ""
        )}
      </div>
    </Modal>
  );
}

export default FicheDetailModal;

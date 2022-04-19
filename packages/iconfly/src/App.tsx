import { useState } from 'react';
import { Upload, Button, Card, message } from 'antd';
import 'antd/dist/antd.css';
import { RcFile } from 'antd/lib/upload/interface';
import { getRandomStr, serializeParams } from './utils';
import './App.css';

interface SvgContent {
  id: string;
  svg: string;
}

interface UploadParams {
  cleanColor?: boolean;
}

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [svgs, setSvgs] = useState<SvgContent[]>([]);

  const handleChange = async (file: RcFile, files: RcFile[]) => {
    const svg = await file.text();
    const id = getRandomStr(5);
    setSvgs([
      ...svgs,
      {
        id,
        svg,
      },
    ]);
    setFiles(files);
    return false;
  };

  const handleUpload = async (uploadParams?: UploadParams) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('file', file));
    let uploadUrl = '/api/upload';
    if (uploadParams?.cleanColor) {
      uploadUrl += `?${serializeParams({
        cleanColor: 'true',
      })}`;
    }
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (uploadRes.ok) {
      message.success('上传成功');
    }
  };

  return (
    <div style={{ margin: 50 }}>
      <Upload name="file" showUploadList={false} beforeUpload={handleChange}>
        <Button>选择文件</Button>
      </Upload>
      <Card style={{ marginTop: 20 }}>
        {svgs.map((item) => {
          return (
            <div
              key={item.id}
              className="icon-containner"
              dangerouslySetInnerHTML={{ __html: item.svg }}
            ></div>
          );
        })}
      </Card>
      <div style={{ marginTop: 20 }}>
        <Button type="primary" onClick={() => handleUpload()}>
          上传
        </Button>
        <Button
          type="primary"
          onClick={() => handleUpload({ cleanColor: true })}
          style={{ marginLeft: 24 }}
        >
          清除颜色上传
        </Button>
      </div>
    </div>
  );
}

export default App;
